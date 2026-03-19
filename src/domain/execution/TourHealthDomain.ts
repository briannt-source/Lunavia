import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * TourHealthDomain — Real-time Tour Health Monitoring
 *
 * Derives health state from operational signals:
 *   HEALTHY     — on track, all checkpoints hit
 *   AT_RISK     — pickup delayed >15min, missing check-ins
 *   DELAYED     — tour started late
 *   INCIDENT    — incident reported
 *   SOS_ACTIVE  — SOS broadcast triggered
 *
 * Integrates with: ExecutionTimeline, SOSBroadcast, ReplacementControl
 */

import { prisma } from '@/lib/prisma';

// ── Health States ─────────────────────────────────────────────────────

export const TOUR_HEALTH = {
    HEALTHY: 'HEALTHY',
    AT_RISK: 'AT_RISK',
    DELAYED: 'DELAYED',
    INCIDENT: 'INCIDENT',
    SOS_ACTIVE: 'SOS_ACTIVE',
} as const;

type TourHealthState = typeof TOUR_HEALTH[keyof typeof TOUR_HEALTH];

const HEALTH_PRIORITY: Record<string, number> = {
    SOS_ACTIVE: 5,
    INCIDENT: 4,
    DELAYED: 3,
    AT_RISK: 2,
    HEALTHY: 1,
};

const HEALTH_COLORS: Record<string, string> = {
    HEALTHY: '#22c55e',     // Green
    AT_RISK: '#eab308',     // Yellow
    DELAYED: '#f97316',     // Orange
    INCIDENT: '#ef4444',    // Red
    SOS_ACTIVE: '#a855f7',  // Purple
};

// ── Calculate Tour Health ─────────────────────────────────────────────

async function calculateTourHealth(tourId: string): Promise<{
    health: TourHealthState;
    color: string;
    reasons: string[];
}> {
    const tour = await (prisma as any).serviceRequest.findUnique({
        where: { id: tourId },
        select: {
            id: true,
            status: true,
            startDate: true,
            tourHealth: true,
        },
    });

    if (!tour) throw new Error('NOT_FOUND');

    const now = new Date();
    const reasons: string[] = [];
    let health: TourHealthState = TOUR_HEALTH.HEALTHY;

    // 1. Check for active SOS broadcast
    const activeSOS = await (prisma as any).sOSGuideBroadcast.findFirst({
        where: { tourId, status: 'ACTIVE' },
    });
    if (activeSOS) {
        health = TOUR_HEALTH.SOS_ACTIVE;
        reasons.push('SOS broadcast is active');
    }

    // 2. Check for incidents
    const activeIncidents = await (prisma as any).incident.findMany({
        where: { tourId, resolved: false },
    });
    if (activeIncidents.length > 0 && HEALTH_PRIORITY[health] < HEALTH_PRIORITY.INCIDENT) {
        health = TOUR_HEALTH.INCIDENT;
        reasons.push(`${activeIncidents.length} active incident(s)`);
    }

    // 3. Check for delayed start
    const executionEvents = await (prisma as any).tourExecutionEvent.findMany({
        where: { tourId, isSimulation: false },
        orderBy: { createdAt: 'asc' },
        select: { eventType: true, createdAt: true },
    });

    const tourStartedEvent = executionEvents.find((e: any) => e.eventType === 'TOUR_STARTED');
    if (tourStartedEvent) {
        const scheduledStart = new Date(tour.startDate);
        const actualStart = new Date(tourStartedEvent.createdAt);
        const delayMin = (actualStart.getTime() - scheduledStart.getTime()) / 60000;
        if (delayMin > 15 && HEALTH_PRIORITY[health] < HEALTH_PRIORITY.DELAYED) {
            health = TOUR_HEALTH.DELAYED;
            reasons.push(`Tour started ${Math.round(delayMin)} minutes late`);
        }
    }

    // 4. Check for at-risk signals
    if (tour.status === 'ASSIGNED' || tour.status === 'READY') {
        const scheduledStart = new Date(tour.startDate);
        const minutesUntilStart = (scheduledStart.getTime() - now.getTime()) / 60000;

        // Pickup should start before scheduled time
        const pickupEvent = executionEvents.find((e: any) => e.eventType === 'PICKUP_STARTED');
        if (!pickupEvent && minutesUntilStart < -15 && HEALTH_PRIORITY[health] < HEALTH_PRIORITY.AT_RISK) {
            health = TOUR_HEALTH.AT_RISK;
            reasons.push('Pickup not started 15+ minutes after scheduled time');
        }

        // Guide not verified close to start
        const verifiedEvent = executionEvents.find((e: any) => e.eventType === 'GUIDE_VERIFIED');
        if (!verifiedEvent && minutesUntilStart < 30 && minutesUntilStart > -60 && HEALTH_PRIORITY[health] < HEALTH_PRIORITY.AT_RISK) {
            health = TOUR_HEALTH.AT_RISK;
            reasons.push('Guide not yet verified, tour starting soon');
        }
    }

    // 5. Check for replacement in progress
    const pendingReplacement = await (prisma as any).guideReplacementRequest.findFirst({
        where: { tourId, status: 'PENDING' },
    });
    if (pendingReplacement && HEALTH_PRIORITY[health] < HEALTH_PRIORITY.AT_RISK) {
        health = TOUR_HEALTH.AT_RISK;
        reasons.push('Guide replacement request pending');
    }

    if (reasons.length === 0) {
        reasons.push('All systems normal');
    }

    // Persist the calculated health
    await (prisma as any).serviceRequest.update({
        where: { id: tourId },
        data: { tourHealth: health },
    });

    return {
        health,
        color: HEALTH_COLORS[health] || HEALTH_COLORS.HEALTHY,
        reasons,
    };
}

// ── Get Health Summary for Operator ───────────────────────────────────

async function getOperatorHealthSummary(operatorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tours = await (prisma as any).serviceRequest.findMany({
        where: {
            operatorId,
            startDate: { gte: today, lt: tomorrow },
            status: { notIn: ['CANCELLED', 'DRAFT'] },
        },
        select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            tourHealth: true,
            groupSize: true,
            location: true,
            assignedGuideId: true,
        },
        orderBy: { startDate: 'asc' },
    });

    // Count by health
    const healthCounts: Record<string, number> = {
        HEALTHY: 0, AT_RISK: 0, DELAYED: 0, INCIDENT: 0, SOS_ACTIVE: 0,
    };
    tours.forEach((t: any) => {
        const h = t.tourHealth || 'HEALTHY';
        healthCounts[h] = (healthCounts[h] || 0) + 1;
    });

    // Count by status
    const statusCounts = {
        scheduled: tours.filter((t: any) => ['ASSIGNED', 'READY', 'OPEN'].includes(t.status)).length,
        inProgress: tours.filter((t: any) => t.status === 'IN_PROGRESS').length,
        completed: tours.filter((t: any) => t.status === 'COMPLETED').length,
        incidents: healthCounts.INCIDENT,
        sosAlerts: healthCounts.SOS_ACTIVE,
    };

    return {
        tours,
        healthCounts,
        statusCounts,
        totalToday: tours.length,
    };
}

// ── Exports ───────────────────────────────────────────────────────────

export const TourHealthDomain = {
    calculateTourHealth,
    getOperatorHealthSummary,
    TOUR_HEALTH,
    HEALTH_COLORS,
};
