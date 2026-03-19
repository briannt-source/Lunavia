/**
 * GuideReliabilityDomain — Guide Reliability Score & Commitment Lock
 *
 * Reliability Score (0-100, starts at 100):
 *   Completed tour:        +3
 *   Replacement request:   -2
 *   Late cancellation (<12h): -10
 *   No-show:               -20
 *
 * Commitment Lock Window:
 *   >12h before start → normal replacement
 *   2-12h before start → emergency replacement only
 *   <2h before start → CRITICAL replacement + OPS alert
 */

import { prisma } from '@/lib/prisma';

// ── Constants ─────────────────────────────────────────────────────────

const RELIABILITY_EVENTS = {
    TOUR_COMPLETED: { delta: +3, label: 'Tour completed' },
    REPLACEMENT_REQUESTED: { delta: -2, label: 'Replacement requested' },
    LATE_CANCELLATION: { delta: -10, label: 'Late cancellation (<12h)' },
    NO_SHOW: { delta: -20, label: 'No-show' },
    SOS_ACCEPT_NO_SHOW: { delta: -20, label: 'Accepted SOS but no-show' },
} as const;

const COMMITMENT_LOCK_HOURS = 12;
const CRITICAL_LOCK_HOURS = 2;
const RECOVERY_CONSECUTIVE_CLEAN = 3;
const RECOVERY_BONUS = 5;

// ── Reliability Score ─────────────────────────────────────────────────

/**
 * Recalculate guide reliability score from trust events.
 * Starts at 100, modified by events.
 */
async function recalculateReliabilityScore(guideId: string): Promise<number> {
    const events = await prisma.trustRecord.findMany({
        where: { userId: guideId },
        select: { type: true, delta: true },
    });

    let score = 100;

    for (const event of events) {
        if (event.type === 'TOUR_CONFIRMED' || event.type === 'TOUR_COMPLETED') {
            score += 3;
        } else if (event.type === 'GUIDE_REPLACEMENT_REQUESTED') {
            score -= 2;
        } else if (event.type === 'GUIDE_LATE_CANCELLATION') {
            score -= 10;
        } else if (event.type === 'GUIDE_ABANDONED_TOUR' || event.type === 'GUIDE_NO_SHOW') {
            score -= 20;
        } else if (event.type === 'SOS_ACCEPT_NO_SHOW') {
            score -= 20;
        }
    }

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    // Recovery: +5 after 3 consecutive clean tours
    score += await computeRecoveryBonus(guideId);
    score = Math.max(0, Math.min(100, score));

    // Persist
    await (prisma as any).user.update({
        where: { id: guideId },
        data: { reliabilityScore: score },
    });

    return score;
}

/**
 * Apply a reliability event and update score.
 */
async function applyReliabilityEvent(
    guideId: string,
    eventType: keyof typeof RELIABILITY_EVENTS,
    tourId?: string
) {
    const eventConfig = RELIABILITY_EVENTS[eventType];

    // ── Guide Pro Cancellation Forgiveness: 1 penalty-free cancel per quarter ──
    if (eventType === 'LATE_CANCELLATION') {
        const guide = await (prisma as any).user.findUnique({
            where: { id: guideId },
            select: { plan: true },
        });

        if (guide?.plan === 'PRO') {
            // Check if this quarter's forgiveness has been used
            const now = new Date();
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            const forgivenThisQuarter = await prisma.trustRecord.count({
                where: {
                    userId: guideId,
                    type: 'CANCELLATION_FORGIVEN',
                    createdAt: { gte: quarterStart },
                },
            });

            if (forgivenThisQuarter === 0) {
                // Use the forgiveness — record but don't penalize
                await prisma.trustRecord.create({
                    data: {
                        userId: guideId,
                        type: 'CANCELLATION_FORGIVEN',
                        delta: 0,
                        newScore: 0,
                        description: 'Pro benefit: penalty-free cancellation used (1/quarter)',
                        relatedRequestId: tourId || null,
                    },
                });
                // Still recalculate (no penalty applied)
                return recalculateReliabilityScore(guideId);
            }
        }
    }

    // Record trust event
    await prisma.trustRecord.create({
        data: {
            userId: guideId,
            type: eventType,
            delta: eventConfig.delta,
            newScore: 0, // Will be overwritten by recalc
            relatedRequestId: tourId || null,
        },
    });

    // Recalculate
    return recalculateReliabilityScore(guideId);
}

// ── Commitment Lock ───────────────────────────────────────────────────

interface CommitmentCheckResult {
    isLocked: boolean;
    hoursUntilStart: number;
    replacementType: 'NORMAL' | 'EMERGENCY' | 'CRITICAL';
    requiresOpsAlert: boolean;
    message: string;
}

/**
 * Check if a guide's commitment is locked for a tour.
 * >12h = normal replacement allowed
 * 2-12h = emergency replacement only (penalties apply)
 * <2h = CRITICAL replacement (OPS alert required)
 */
function checkCommitmentLock(tourStartTime: Date): CommitmentCheckResult {
    const hoursUntilStart = (tourStartTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilStart > COMMITMENT_LOCK_HOURS) {
        return {
            isLocked: false,
            hoursUntilStart: Math.round(hoursUntilStart),
            replacementType: 'NORMAL',
            requiresOpsAlert: false,
            message: 'Normal replacement allowed. No penalties.',
        };
    }

    if (hoursUntilStart <= CRITICAL_LOCK_HOURS) {
        return {
            isLocked: true,
            hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
            replacementType: 'CRITICAL',
            requiresOpsAlert: true,
            message: `CRITICAL: Only ${Math.round(hoursUntilStart * 10) / 10}h until start. OPS alert triggered.`,
        };
    }

    return {
        isLocked: true,
        hoursUntilStart: Math.round(hoursUntilStart * 10) / 10,
        replacementType: 'EMERGENCY',
        requiresOpsAlert: false,
        message: `Commitment locked (${Math.round(hoursUntilStart * 10) / 10}h until start). Emergency replacement only — penalty applies.`,
    };
}

/**
 * Get guide reliability stats.
 */
async function getGuideReliabilityStats(guideId: string) {
    const user = await (prisma as any).user.findUnique({
        where: { id: guideId },
        select: { reliabilityScore: true, trustScore: true },
    });

    // Count relevant events
    const events = await prisma.trustRecord.findMany({
        where: { userId: guideId },
        select: { type: true },
    });

    const completedTours = events.filter(e =>
        e.type === 'TOUR_CONFIRMED' || e.type === 'TOUR_COMPLETED'
    ).length;

    const lateCancellations = events.filter(e =>
        e.type === 'GUIDE_LATE_CANCELLATION'
    ).length;

    const noShows = events.filter(e =>
        e.type === 'GUIDE_ABANDONED_TOUR' || e.type === 'GUIDE_NO_SHOW'
    ).length;

    const replacementRequests = events.filter(e =>
        e.type === 'GUIDE_REPLACEMENT_REQUESTED'
    ).length;

    return {
        reliabilityScore: user?.reliabilityScore ?? 100,
        trustScore: user?.trustScore ?? 0,
        completedTours,
        lateCancellations,
        noShows,
        replacementRequests,
    };
}

// ── Recovery Mechanism ────────────────────────────────────────────────

/**
 * If guide completed 3 consecutive tours without incidents,
 * grant a +5 reliability recovery bonus.
 */
async function computeRecoveryBonus(guideId: string): Promise<number> {
    const recentEvents = await prisma.trustRecord.findMany({
        where: { userId: guideId },
        orderBy: { createdAt: 'desc' },
        take: RECOVERY_CONSECUTIVE_CLEAN,
        select: { type: true },
    });

    if (recentEvents.length < RECOVERY_CONSECUTIVE_CLEAN) return 0;

    const allClean = recentEvents.every(e =>
        e.type === 'TOUR_CONFIRMED' || e.type === 'TOUR_COMPLETED'
    );

    return allClean ? RECOVERY_BONUS : 0;
}

// ── Exports ───────────────────────────────────────────────────────────

export const GuideReliabilityDomain = {
    recalculateReliabilityScore,
    applyReliabilityEvent,
    checkCommitmentLock,
    getGuideReliabilityStats,
    computeRecoveryBonus,
    RELIABILITY_EVENTS,
    COMMITMENT_LOCK_HOURS,
    CRITICAL_LOCK_HOURS,
    RECOVERY_CONSECUTIVE_CLEAN,
};
