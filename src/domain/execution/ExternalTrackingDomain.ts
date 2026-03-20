import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * ExternalTrackingDomain — Token-based Tour Tracking for Partner Agencies
 *
 * Allows agencies to monitor tour execution without platform accounts.
 *
 * Flow:
 *   Operator creates tracking link → secure token generated →
 *   Agency accesses /tour-track/{token} → sees sanitized tour data →
 *   Link expires 48h after tour completion
 *
 * Security:
 *   - No financial data exposed
 *   - No operator internal data
 *   - No access to other tours
 *   - Token-scoped to single tour
 */

import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// ── Constants ─────────────────────────────────────────────────────────

const TOKEN_LENGTH = 32; // 256-bit token
const DEFAULT_EXPIRY_HOURS_AFTER_COMPLETION = 48;

// ── Create Tracking Link ──────────────────────────────────────────────

interface CreateTrackingLinkInput {
    tourId: string;
    operatorId: string;
    agencyName: string;
    permissions?: {
        viewTimeline?: boolean;
        viewGuide?: boolean;
        viewStatus?: boolean;
    };
}

async function createTrackingLink(input: CreateTrackingLinkInput) {
    const { tourId, operatorId, agencyName, permissions } = input;

    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, operatorId: true, endDate: true, title: true },
    }));

    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== operatorId) throw new Error('FORBIDDEN');

    // Generate secure token
    const token = randomBytes(TOKEN_LENGTH).toString('hex');

    // Expiry: 48h after tour end time
    const expiresAt = new Date(tour.endDate.getTime() + DEFAULT_EXPIRY_HOURS_AFTER_COMPLETION * 3600000);

    const defaultPerms = {
        viewTimeline: true,
        viewGuide: true,
        viewStatus: true,
        ...(permissions || {}),
    };

    const access = await (prisma as any).tourExternalAccess.create({
        data: {
            tourId,
            token,
            agencyName,
            permissions: defaultPerms,
            expiresAt,
        },
    });

    return {
        id: access.id,
        token,
        trackingUrl: `/tour-track/${token}`,
        agencyName,
        expiresAt,
        permissions: defaultPerms,
    };
}

// ── Get Tracking Data (public, no auth) ───────────────────────────────

async function getTrackingData(token: string) {
    const access = await (prisma as any).tourExternalAccess.findUnique({
        where: { token },
    });

    if (!access) throw new Error('INVALID_TOKEN');
    if (new Date() > new Date(access.expiresAt)) throw new Error('TOKEN_EXPIRED');

    const permissions = access.permissions as any;

    // Fetch tour data (sanitized — no financials)
    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: access.tourId },
        select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            durationMinutes: true,
            location: true,
            province: true,
            language: true,
            groupSize: true,
            // NO financial fields (totalPayout, currency, etc.)
            // NO internal fields (operatorMetadata, etc.)
        },
    }));

    if (!tour) throw new Error('TOUR_NOT_FOUND');

    // Operator name (sanitized)
    const operator = await prisma.user.findUnique({
        where: { id: (await prisma.tour.findUnique({ where: { id: access.tourId }, select: { operatorId: true } }))?.operatorId || '' },
        select: { email: true, profile: { select: { name: true } } },
    });

    // Guide info (if permitted)
    let guide = null;
    if (permissions.viewGuide) {
        const tourFull = enrichTourCompat(await prisma.tour.findUnique({
            where: { id: access.tourId },
            select: { assignedGuideId: true },
        }));
        if (tourFull?.assignedGuideId) {
            guide = await prisma.user.findUnique({
                where: { id: tourFull.assignedGuideId },
                select: { email: true, profile: { select: { name: true, photoUrl: true } } },
            });
        }
    }

    // Execution timeline (if permitted)
    let timeline: any[] = [];
    if (permissions.viewTimeline) {
        timeline = await (prisma as any).tourExecutionEvent.findMany({
            where: { tourId: access.tourId, isSimulation: false },
            orderBy: { createdAt: 'asc' },
            select: {
                eventType: true,
                role: true,
                description: true,
                createdAt: true,
                // NO guideId, NO metadata (could contain internal data)
            },
        });
    }

    // Tour segments
    const segments = await prisma.tourSegment.findMany({
        where: { tourId: access.tourId },
        orderBy: { orderIndex: 'asc' },
        select: { title: true, type: true, orderIndex: true },
    });

    // Compute progress
    const totalSegments = segments.length;
    const checkedInSegments = timeline.filter((e: any) => e.eventType === 'SEGMENT_CHECKED_IN').length;
    const progress = computeProgress(tour.status, totalSegments, checkedInSegments);

    return {
        tour: {
            ...tour,
            operatorName: operator?.profile?.name || operator?.email || 'Operator',
        },
        guide,
        segments,
        timeline,
        progress,
        agencyName: access.agencyName,
        expiresAt: access.expiresAt,
    };
}

// ── Revoke Tracking Link ──────────────────────────────────────────────

async function revokeTrackingLink(linkId: string, operatorId: string) {
    const access = await (prisma as any).tourExternalAccess.findUnique({
        where: { id: linkId },
        include: { tour: { select: { operatorId: true } } },
    });

    if (!access) throw new Error('NOT_FOUND');
    if (access.tour.operatorId !== operatorId) throw new Error('FORBIDDEN');

    await (prisma as any).tourExternalAccess.delete({
        where: { id: linkId },
    });

    return { revoked: true };
}

// ── List Tracking Links for a Tour ────────────────────────────────────

async function listTrackingLinks(tourId: string) {
    return (prisma as any).tourExternalAccess.findMany({
        where: { tourId },
        select: { id: true, agencyName: true, token: true, expiresAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
}

// ── Helpers ───────────────────────────────────────────────────────────

function computeProgress(
    status: string,
    totalSegments: number,
    checkedInSegments: number
): { percentage: number; label: string; phase: string } {
    switch (status) {
        case 'OPEN':
        case 'APPLIED':
            return { percentage: 0, label: 'Waiting for guide', phase: 'PENDING' };
        case 'ASSIGNED':
        case 'READY':
            return { percentage: 10, label: 'Guide assigned', phase: 'ASSIGNED' };
        case 'IN_PROGRESS': {
            if (totalSegments === 0) return { percentage: 50, label: 'Tour in progress', phase: 'IN_PROGRESS' };
            const segmentProgress = (checkedInSegments / totalSegments) * 80;
            return { percentage: Math.round(10 + segmentProgress), label: `${checkedInSegments}/${totalSegments} segments completed`, phase: 'IN_PROGRESS' };
        }
        case 'COMPLETED':
            return { percentage: 100, label: 'Tour completed', phase: 'COMPLETED' };
        case 'CANCELLED':
            return { percentage: 0, label: 'Tour cancelled', phase: 'CANCELLED' };
        default:
            return { percentage: 0, label: status, phase: status };
    }
}

// ── Exports ───────────────────────────────────────────────────────────

export const ExternalTrackingDomain = {
    createTrackingLink,
    getTrackingData,
    revokeTrackingLink,
    listTrackingLinks,
    DEFAULT_EXPIRY_HOURS_AFTER_COMPLETION,
};
