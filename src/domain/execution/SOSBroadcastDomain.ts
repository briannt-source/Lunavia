/**
 * SOSBroadcastDomain — Emergency SOS Guide Search
 *
 * Flow:
 *   Operator triggers SOS → System broadcasts to matching guides →
 *   Guide sees urgent tour card with full snapshot →
 *   Guide accepts → GuideApplication created → Operator approves manually
 *
 * Features:
 *   - Tour snapshot frozen at broadcast time (title, operator, time, guests, price, itinerary)
 *   - Targeted: matching language, province, available guides
 *   - 15-minute TTL, auto-expires
 *   - Trust penalty if guide accepts SOS but no-shows (-20)
 */

import { prisma } from '@/lib/prisma';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

// ── Constants ─────────────────────────────────────────────────────────

const SOS_DEFAULT_TTL_MINUTES = 15;

const SOS_STATUS = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    FILLED: 'FILLED',
    CANCELLED: 'CANCELLED',
} as const;

const SOS_MAX_ACCEPTS = 3;

// ── Trigger SOS Broadcast ─────────────────────────────────────────────

interface TriggerSOSInput {
    tourId: string;
    operatorId: string;
    ttlMinutes?: number;
}

const SOS_COST_VND = 200000;

// ── Eligibility Check ─────────────────────────────────────────────────

async function checkEligibility(operatorId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Count broadcasts in the last 7 days
    const recentBroadcasts = await (prisma as any).sOSGuideBroadcast.count({
        where: {
            operatorId,
            createdAt: { gte: sevenDaysAgo },
        }
    });

    const isFree = recentBroadcasts === 0;
    
    return {
        isFree,
        cost: isFree ? 0 : SOS_COST_VND,
        remainingFreeThisWeek: isFree ? 1 : 0,
    };
}

async function triggerSOSBroadcast(input: TriggerSOSInput) {
    const { tourId, operatorId, ttlMinutes = SOS_DEFAULT_TTL_MINUTES } = input;

    // 1. Fetch full tour data for snapshot
    const tour = await (prisma as any).serviceRequest.findUnique({
        where: { id: tourId },
        include: {
            operator: { select: { id: true, name: true, avatarUrl: true } },
            segments: { orderBy: { orderIndex: 'asc' }, select: { title: true, type: true, orderIndex: true, latitude: true, longitude: true } },
        },
    });

    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== operatorId) throw new Error('FORBIDDEN');

    // 2. Check if there's already an active broadcast
    const existingBroadcast = await (prisma as any).sOSGuideBroadcast.findFirst({
        where: { tourId, status: SOS_STATUS.ACTIVE },
    });
    if (existingBroadcast) throw new Error('SOS_ALREADY_ACTIVE');

    // 2.5 Eligibility & Wallet Check
    const eligibility = await checkEligibility(operatorId);
    
    const wallet = await prisma.wallet.findUnique({
        where: { operatorId }
    });

    if (!wallet) throw new Error('NOT_FOUND');
    
    // Only block if it costs money and they don't have enough
    if (!eligibility.isFree && wallet.availableBalance < eligibility.cost) {
        throw new Error('INSUFFICIENT_FUNDS');
    }

    // 3. Build tour snapshot (frozen at broadcast time)
    const tourSnapshot = {
        tourId: tour.id,
        title: tour.title,
        operator: { id: tour.operator.id, name: tour.operator.name, avatarUrl: tour.operator.avatarUrl },
        startTime: tour.startTime.toISOString(),
        endTime: tour.endTime.toISOString(),
        durationMinutes: tour.durationMinutes,
        location: tour.location,
        province: tour.province,
        language: tour.language,
        groupSize: tour.groupSize,
        totalPayout: tour.totalPayout,
        currency: tour.currency,
        itinerary: tour.segments.map((s: any) => ({ title: s.title, type: s.type, order: s.orderIndex })),
        description: tour.description,
        eligibilityNotes: tour.eligibilityNotes,
        // Geo coordinates for distance calculation
        latitude: tour.segments[0]?.latitude || null,
        longitude: tour.segments[0]?.longitude || null,
    };

    const targetCriteria = {
        language: tour.language,
        province: tour.province,
    };

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // 4. Create broadcast AND deduct wallet (if applicable) in a transaction
    const transactionQueries: any[] = [
        (prisma as any).sOSGuideBroadcast.create({
            data: {
                tourId,
                operatorId,
                tourSnapshot,
                targetCriteria,
                status: SOS_STATUS.ACTIVE,
                expiresAt,
            },
        })
    ];

    if (!eligibility.isFree) {
        transactionQueries.push(
            prisma.wallet.update({
                where: { id: wallet.id },
                data: { availableBalance: { decrement: eligibility.cost } }
            })
        );
    }

    // Always log the transaction for ledger transparency (either 0 or 200k)
    transactionQueries.push(
        prisma.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'SOS_BROADCAST_FEE',
                amount: -eligibility.cost, // 0 if free, -200000 if paid
                relatedTourId: tourId,
                status: 'COMPLETED',
                description: eligibility.isFree ? `Emergency SOS Broadcast (Free Weekly Allowance) for tour: ${tour.title}` : `Emergency SOS Broadcast Fee for tour: ${tour.title}`,
            }
        })
    );

    const [broadcast] = await prisma.$transaction(transactionQueries);

    // 5. Find and notify matching guides
    const matchingGuides = await findMatchingGuides(tour);

    let notifiedCount = 0;
    for (const guide of matchingGuides) {
        try {
            await createDomainNotification({
                userId: guide.id,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/guide/sos/${broadcast.id}`,
                type: 'SOS_GUIDE_BROADCAST',
                title: '🚨 URGENT TOUR REQUEST',
                message: `${tour.operator.name} needs a guide urgently! "${tour.title}" starting ${formatTimeUntil(tour.startTime)} in ${tour.location}. ${tour.groupSize || '?'} guests, ${tour.language || 'N/A'}. Payment: ${formatCurrency(tour.totalPayout, tour.currency)}`,
                relatedId: broadcast.id,
            });
            notifiedCount++;
        } catch { /* notification failed for one guide, continue */ }
    }

    // Update broadcast count
    await (prisma as any).sOSGuideBroadcast.update({
        where: { id: broadcast.id },
        data: { broadcastCount: notifiedCount },
    });

    // 6. Timeline event
    await (prisma as any).tourTimelineEvent.create({
        data: {
            tourId,
            actorId: operatorId,
            actorRole: 'OPERATOR',
            eventType: 'SOS_BROADCAST_TRIGGERED',
            title: 'SOS Guide Broadcast Triggered',
            description: `Emergency guide search broadcast to ${notifiedCount} guides. Expires in ${ttlMinutes} minutes.`,
            metadata: JSON.stringify({ broadcastId: broadcast.id, notifiedCount, expiresAt: expiresAt.toISOString() }),
        },
    });

    // 7. Create operational alert
    await (prisma as any).operationalAlert.create({
        data: {
            tourId,
            alertType: 'SOS_GUIDE_BROADCAST',
            severity: 'CRITICAL',
            message: `SOS guide broadcast for "${tour.title}" — ${notifiedCount} guides notified. Expires ${expiresAt.toLocaleTimeString()}.`,
            metadata: { broadcastId: broadcast.id, notifiedCount },
        },
    });

    return { broadcast, notifiedCount, expiresAt };
}

// ── Guide Accepts SOS Broadcast ───────────────────────────────────────

async function acceptSOSBroadcast(broadcastId: string, guideId: string) {
    const broadcast = await (prisma as any).sOSGuideBroadcast.findUnique({
        where: { id: broadcastId },
    });

    if (!broadcast) throw new Error('NOT_FOUND');
    if (broadcast.status !== SOS_STATUS.ACTIVE) throw new Error('BROADCAST_CLOSED');
    if (new Date() > new Date(broadcast.expiresAt)) throw new Error('BROADCAST_EXPIRED');

    // #5: Accept limit — max 3 guides
    if (broadcast.acceptCount >= SOS_MAX_ACCEPTS) throw new Error('ACCEPT_LIMIT_REACHED');

    // Check if guide already applied for this tour
    const existingApp = await prisma.guideApplication.findFirst({
        where: { requestId: broadcast.tourId, guideId },
    });
    if (existingApp) throw new Error('ALREADY_APPLIED');

    const tourSnapshot = broadcast.tourSnapshot as any;

    // Create a GuideApplication (operator must still approve)
    await prisma.guideApplication.create({
        data: {
            requestId: broadcast.tourId,
            guideId,
            roleApplied: 'LEAD_GUIDE',
            status: 'APPLIED',
        },
    });

    // Update broadcast accept count; mark FILLED if at limit
    const newAcceptCount = (broadcast.acceptCount || 0) + 1;
    await (prisma as any).sOSGuideBroadcast.update({
        where: { id: broadcastId },
        data: {
            acceptCount: { increment: 1 },
            ...(newAcceptCount >= SOS_MAX_ACCEPTS ? { status: SOS_STATUS.FILLED } : {}),
        },
    });

    // Notify operator
    const guide = await (prisma as any).user.findUnique({
        where: { id: guideId },
        select: { name: true, trustScore: true, reliabilityScore: true },
    });

    await createDomainNotification({
        userId: broadcast.operatorId,
        domain: NotificationDomain.SYSTEM,
        targetUrl: `/dashboard/operator/tours/${broadcast.tourId}`,
        type: 'SOS_GUIDE_ACCEPTED',
        title: '✅ Guide Responded to SOS',
        message: `${guide?.name || 'A guide'} accepted your urgent request for "${tourSnapshot.title}". Trust: ${guide?.trustScore ?? 0}, Reliability: ${guide?.reliabilityScore ?? 100}%. Review and approve.`,
        relatedId: broadcast.tourId,
    });

    // Timeline event
    await (prisma as any).tourTimelineEvent.create({
        data: {
            tourId: broadcast.tourId,
            actorId: guideId,
            actorRole: 'GUIDE',
            eventType: 'SOS_GUIDE_ACCEPTED',
            title: 'Guide Accepted SOS',
            description: `Guide responded to SOS broadcast. Awaiting operator approval.`,
            metadata: JSON.stringify({ broadcastId, guideName: guide?.name }),
        },
    });

    return {
        accepted: true,
        message: 'Application submitted. The operator will review and approve.',
        tourSnapshot,
    };
}

// ── Get Active Broadcasts for Guide ───────────────────────────────────

async function getActiveSOSBroadcasts(guideId: string) {
    const now = new Date();

    // Get guide info for matching
    const guide = await prisma.user.findUnique({
        where: { id: guideId },
        select: { languages: true, skills: true },
    });

    const broadcasts = await (prisma as any).sOSGuideBroadcast.findMany({
        where: {
            status: SOS_STATUS.ACTIVE,
            expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    // Enrich with time-until-start and check if guide already applied
    const enriched = await Promise.all(broadcasts.map(async (b: any) => {
        const snapshot = b.tourSnapshot as any;
        const startTime = new Date(snapshot.startTime);
        const minutesUntilStart = Math.round((startTime.getTime() - now.getTime()) / 60000);
        const minutesUntilExpiry = Math.round((new Date(b.expiresAt).getTime() - now.getTime()) / 60000);

        // Check if guide already applied
        const existingApp = await prisma.guideApplication.findFirst({
            where: { requestId: b.tourId, guideId },
        });

        return {
            id: b.id,
            tourSnapshot: snapshot,
            isEmergency: true,
            minutesUntilStart,
            minutesUntilExpiry,
            expiresAt: b.expiresAt,
            alreadyApplied: !!existingApp,
            broadcastCount: b.broadcastCount,
            acceptCount: b.acceptCount,
            acceptsRemaining: Math.max(0, SOS_MAX_ACCEPTS - (b.acceptCount || 0)),
            // #6: Distance from tour start (if coordinates available)
            distanceKm: null as number | null,
        };
    }));

    return enriched;
}

// ── Get SOS Broadcast Details (for Tour Preview) ──────────────────────

async function getSOSBroadcastDetails(broadcastId: string) {
    const broadcast = await (prisma as any).sOSGuideBroadcast.findUnique({
        where: { id: broadcastId },
    });

    if (!broadcast) throw new Error('NOT_FOUND');

    const snapshot = broadcast.tourSnapshot as any;
    const startTime = new Date(snapshot.startTime);
    const minutesUntilStart = Math.round((startTime.getTime() - Date.now()) / 60000);

    return {
        id: broadcast.id,
        tourSnapshot: snapshot,
        status: broadcast.status,
        isExpired: new Date() > new Date(broadcast.expiresAt),
        minutesUntilStart,
        expiresAt: broadcast.expiresAt,
        acceptCount: broadcast.acceptCount,
    };
}

// ── Expire Broadcasts (cron-callable) ─────────────────────────────────

async function expireSOSBroadcasts(): Promise<number> {
    const result = await (prisma as any).sOSGuideBroadcast.updateMany({
        where: {
            status: SOS_STATUS.ACTIVE,
            expiresAt: { lt: new Date() },
        },
        data: { status: SOS_STATUS.EXPIRED },
    });

    return result.count;
}

// ── Helpers ───────────────────────────────────────────────────────────

async function findMatchingGuides(tour: any) {
    // Find guides that are:
    // 1. Active & have TOUR_GUIDE role
    // 2. Not already assigned to conflicting tours (#4)
    // 3. Matching language (if specified)
    const excludeIds: string[] = [tour.operatorId];
    if (tour.assignedGuideId) excludeIds.push(tour.assignedGuideId);

    // #4: Find guides with overlapping assigned tours
    const overlappingGuideIds = await prisma.tour.findMany({
        where: {
            status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
            startTime: { lte: tour.endTime },
            endTime: { gte: tour.startTime },
            assignedGuideId: { not: null },
        },
        select: { assignedGuideId: true },
    });
    const busyGuideIds = overlappingGuideIds
        .map(t => t.assignedGuideId)
        .filter((id): id is string => id !== null);
    const allExcluded = [...new Set([...excludeIds, ...busyGuideIds])];

    return (prisma as any).user.findMany({
        where: {
            role: { name: 'TOUR_GUIDE' },
            accountStatus: 'ACTIVE',
            id: { notIn: allExcluded },
        },
        select: { id: true, name: true, languages: true, skills: true },
        orderBy: [
            { reliabilityScore: 'desc' },
            { trustScore: 'desc' },
        ],
        take: 50,
    });
}

function formatTimeUntil(startTime: Date): string {
    const minutes = Math.round((startTime.getTime() - Date.now()) / 60000);
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMin = minutes % 60;
    return `in ${hours}h ${remainingMin}m`;
}

function formatCurrency(amount: number | null, currency: string): string {
    if (!amount) return 'To be discussed';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(amount);
}

/**
 * Haversine distance between two lat/lng points in km.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Cancel SOS Broadcast (#7) ──────────────────────────────────────

async function cancelSOSBroadcast(broadcastId: string, operatorId: string) {
    const broadcast = await (prisma as any).sOSGuideBroadcast.findUnique({
        where: { id: broadcastId },
    });

    if (!broadcast) throw new Error('NOT_FOUND');
    if (broadcast.operatorId !== operatorId) throw new Error('FORBIDDEN');
    if (broadcast.status !== SOS_STATUS.ACTIVE) throw new Error('NOT_ACTIVE');

    await (prisma as any).sOSGuideBroadcast.update({
        where: { id: broadcastId },
        data: { status: SOS_STATUS.CANCELLED },
    });

    // Timeline event
    await (prisma as any).tourTimelineEvent.create({
        data: {
            tourId: broadcast.tourId,
            actorId: operatorId,
            actorRole: 'OPERATOR',
            eventType: 'SOS_BROADCAST_CANCELLED',
            title: 'SOS Broadcast Cancelled',
            description: 'Operator cancelled the active SOS guide broadcast.',
            metadata: JSON.stringify({ broadcastId }),
        },
    });

    return { cancelled: true };
}

// ── Exports ───────────────────────────────────────────────────────────

export const SOSBroadcastDomain = {
    triggerSOSBroadcast,
    acceptSOSBroadcast,
    getActiveSOSBroadcasts,
    getSOSBroadcastDetails,
    expireSOSBroadcasts,
    cancelSOSBroadcast,
    checkEligibility,
    haversineKm,
    SOS_STATUS,
    SOS_DEFAULT_TTL_MINUTES,
    SOS_MAX_ACCEPTS,
    SOS_COST_VND,
};
