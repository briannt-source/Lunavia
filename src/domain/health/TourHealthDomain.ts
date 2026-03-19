/**
 * TourHealthDomain — Real-Time Tour Health Score
 *
 * Computes a 0–100 health score from real execution data.
 * No stored field — computed on demand from ServiceRequest,
 * SegmentCheckIn, and Incident tables.
 *
 * Weights:
 *   Pickup/start delay  20%
 *   Segment progress     30%
 *   Skipped segments     20%
 *   Incidents            20%
 *   Guide reliability    10%
 */

import { prisma } from '@/lib/prisma';

// ── Health Status Mapping ─────────────────────────────────────────────

export const HEALTH_STATUS = {
    HEALTHY: { label: 'Healthy', color: 'green', emoji: '🟢', min: 80 },
    MINOR_RISK: { label: 'Minor Risk', color: 'amber', emoji: '🟡', min: 60 },
    AT_RISK: { label: 'At Risk', color: 'orange', emoji: '🟠', min: 40 },
    CRITICAL: { label: 'Critical', color: 'red', emoji: '🔴', min: 0 },
} as const;

export interface TourHealthResult {
    score: number;
    status: string;
    emoji: string;
    label: string;
    factors: {
        startDelay: { score: number; detail: string };
        segmentProgress: { score: number; detail: string };
        skippedSegments: { score: number; detail: string };
        incidents: { score: number; detail: string };
        guideReliability: { score: number; detail: string };
    };
}

// ── Compute Health Score ──────────────────────────────────────────────

async function computeHealth(tourId: string): Promise<TourHealthResult> {
    const now = new Date();

    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        include: {
            segments: {
                include: { checkIns: { orderBy: { checkInTime: 'desc' as const }, take: 1 } },
                orderBy: { orderIndex: 'asc' as const },
            },
            incidents: { where: { status: 'OPEN' } },
        },
    });

    if (!tour) {
        return makeResult(0, { startDelay: 0, segmentProgress: 0, skippedSegments: 0, incidents: 0, guideReliability: 0 });
    }

    // ── Factor 1: Start Delay (20%) ──────────────
    let startDelayScore = 100;
    let startDelayDetail = 'On time';

    if (tour.status === 'ASSIGNED' && tour.startTime < now) {
        const delayMin = Math.round((now.getTime() - tour.startTime.getTime()) / 60000);
        if (delayMin >= 60) { startDelayScore = 0; startDelayDetail = `${delayMin}min late — critical`; }
        else if (delayMin >= 30) { startDelayScore = 25; startDelayDetail = `${delayMin}min late`; }
        else if (delayMin >= 15) { startDelayScore = 50; startDelayDetail = `${delayMin}min late`; }
        else if (delayMin >= 5) { startDelayScore = 75; startDelayDetail = `${delayMin}min late`; }
    } else if (tour.operatorStartedAt && tour.startTime) {
        const startDiff = Math.round((tour.operatorStartedAt.getTime() - tour.startTime.getTime()) / 60000);
        if (startDiff <= 5) { startDelayScore = 100; startDelayDetail = 'Started on time'; }
        else if (startDiff <= 15) { startDelayScore = 80; startDelayDetail = `Started ${startDiff}min late`; }
        else if (startDiff <= 30) { startDelayScore = 50; startDelayDetail = `Started ${startDiff}min late`; }
        else { startDelayScore = 20; startDelayDetail = `Started ${startDiff}min late`; }
    }

    // ── Factor 2: Segment Progress (30%) ─────────
    let segProgressScore = 100;
    let segProgressDetail = 'All segments on track';
    const totalSegments = tour.segments.length;

    if (totalSegments > 0 && tour.status === 'IN_PROGRESS') {
        const completed = tour.segments.filter((s: any) => s.checkIns.length > 0 && s.checkIns[0].status === 'COMPLETED').length;
        const started = tour.segments.filter((s: any) => s.checkIns.length > 0).length;
        const actualRatio = started / totalSegments;

        // Time-aware: compare actual progress against expected progress
        if (tour.operatorStartedAt && tour.endTime) {
            const totalDuration = tour.endTime.getTime() - tour.operatorStartedAt.getTime();
            const elapsed = now.getTime() - tour.operatorStartedAt.getTime();
            const expectedRatio = totalDuration > 0 ? Math.min(1, elapsed / totalDuration) : 0;
            // Score = how well actual matches expected (ratio of ratios, capped at 100)
            const progressVsExpected = expectedRatio > 0 ? actualRatio / expectedRatio : 1;
            segProgressScore = Math.round(Math.min(1, progressVsExpected) * 100);
            segProgressDetail = `${completed}/${totalSegments} done, ${Math.round(expectedRatio * 100)}% time elapsed`;
        } else {
            segProgressScore = Math.round(actualRatio * 100);
            segProgressDetail = `${completed}/${totalSegments} completed, ${started}/${totalSegments} started`;
        }
    } else if (totalSegments === 0) {
        segProgressScore = 100;
        segProgressDetail = 'No segments defined';
    }

    // ── Factor 3: Skipped Segments (20%) ─────────
    let skippedScore = 100;
    let skippedDetail = 'No segments skipped';
    const skippedCount = tour.segments.filter((s: any) => s.checkIns.length > 0 && s.checkIns[0].status === 'SKIPPED').length;

    if (totalSegments > 0 && skippedCount > 0) {
        const skipRatio = skippedCount / totalSegments;
        skippedScore = Math.round(Math.max(0, (1 - skipRatio * 2) * 100));
        skippedDetail = `${skippedCount}/${totalSegments} segments skipped`;
    }

    // ── Factor 4: Incidents (20%) ────────────────
    let incidentScore = 100;
    let incidentDetail = 'No open incidents';
    const openIncidents = tour.incidents.length;

    if (openIncidents > 0) {
        const hasHigh = tour.incidents.some((i: any) => i.severity === 'HIGH');
        if (hasHigh) { incidentScore = 10; incidentDetail = `${openIncidents} open (HIGH severity)`; }
        else if (openIncidents >= 3) { incidentScore = 20; incidentDetail = `${openIncidents} open incidents`; }
        else if (openIncidents >= 2) { incidentScore = 40; incidentDetail = `${openIncidents} open incidents`; }
        else { incidentScore = 60; incidentDetail = `${openIncidents} open incident`; }
    }

    // ── Factor 5: Guide Reliability (10%) ────────
    let guideScore = 100;
    let guideDetail = 'Guide active';

    if (tour.status === 'IN_PROGRESS' && tour.operatorStartedAt) {
        const allCheckIns = tour.segments.flatMap((s: any) => s.checkIns);
        const latestCheckIn = allCheckIns.sort((a: any, b: any) =>
            new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
        )[0];
        const lastActivity = latestCheckIn ? new Date(latestCheckIn.checkInTime) : tour.operatorStartedAt;
        const silentMin = Math.round((now.getTime() - lastActivity.getTime()) / 60000);

        if (silentMin >= 60) { guideScore = 10; guideDetail = `No activity for ${silentMin}min`; }
        else if (silentMin >= 30) { guideScore = 40; guideDetail = `No activity for ${silentMin}min`; }
        else if (silentMin >= 15) { guideScore = 70; guideDetail = `Last activity ${silentMin}min ago`; }
        else { guideScore = 100; guideDetail = `Active (${silentMin}min ago)`; }
    } else if (!tour.assignedGuideId) {
        guideScore = 50;
        guideDetail = 'No guide assigned';
    }

    // ── Weighted Total ───────────────────────────
    const factors = {
        startDelay: startDelayScore,
        segmentProgress: segProgressScore,
        skippedSegments: skippedScore,
        incidents: incidentScore,
        guideReliability: guideScore,
    };

    return makeResult(
        Math.round(
            factors.startDelay * 0.2 +
            factors.segmentProgress * 0.3 +
            factors.skippedSegments * 0.2 +
            factors.incidents * 0.2 +
            factors.guideReliability * 0.1
        ),
        {
            startDelay: factors.startDelay,
            segmentProgress: factors.segmentProgress,
            skippedSegments: factors.skippedSegments,
            incidents: factors.incidents,
            guideReliability: factors.guideReliability,
        },
        {
            startDelay: startDelayDetail,
            segmentProgress: segProgressDetail,
            skippedSegments: skippedDetail,
            incidents: incidentDetail,
            guideReliability: guideDetail,
        }
    );
}

function makeResult(
    score: number,
    scores: Record<string, number>,
    details?: Record<string, string>
): TourHealthResult {
    const d = details || {
        startDelay: '', segmentProgress: '', skippedSegments: '', incidents: '', guideReliability: ''
    };

    const status = score >= 80 ? HEALTH_STATUS.HEALTHY :
        score >= 60 ? HEALTH_STATUS.MINOR_RISK :
            score >= 40 ? HEALTH_STATUS.AT_RISK :
                HEALTH_STATUS.CRITICAL;

    return {
        score,
        status: status.label,
        emoji: status.emoji,
        label: status.label,
        factors: {
            startDelay: { score: scores.startDelay, detail: d.startDelay },
            segmentProgress: { score: scores.segmentProgress, detail: d.segmentProgress },
            skippedSegments: { score: scores.skippedSegments, detail: d.skippedSegments },
            incidents: { score: scores.incidents, detail: d.incidents },
            guideReliability: { score: scores.guideReliability, detail: d.guideReliability },
        },
    };
}

export const TourHealthDomain = {
    computeHealth,
    HEALTH_STATUS,
};
