/**
 * AlertEngineDomain — Automatic Operational Alert System
 *
 * Auto-generates alerts when tours need attention:
 *   PICKUP_DELAY       — pickup not started 15+ min after scheduled start
 *   GUIDE_NOT_VERIFIED — tour approaching, guide identity not verified
 *   SEGMENT_MISSING    — expected segment not checked in
 *   INCIDENT_REPORTED  — incident created on tour
 *   SOS_ACTIVE         — SOS broadcast triggered
 *
 * Integrates with: TourHealth, ExecutionTimeline, SOSBroadcast
 */

import { prisma } from '@/lib/prisma';

// ── Alert Types ───────────────────────────────────────────────────────

export const ALERT_TYPES = {
    PICKUP_DELAY: 'PICKUP_DELAY',
    GUIDE_NOT_VERIFIED: 'GUIDE_NOT_VERIFIED',
    SEGMENT_MISSING: 'SEGMENT_MISSING',
    INCIDENT_REPORTED: 'INCIDENT_REPORTED',
    SOS_ACTIVE: 'SOS_ACTIVE',
} as const;

export const SEVERITY = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
} as const;

// ── Create Alert (avoid duplicates) ────────────────────────────────────

async function createAlert(params: {
    tourId: string;
    alertType: string;
    severity: string;
    message: string;
    metadata?: any;
}) {
    // Avoid duplicate open alerts of the same type on the same tour
    const existing = await (prisma as any).operationalAlert.findFirst({
        where: {
            tourId: params.tourId,
            alertType: params.alertType,
            status: 'OPEN',
        },
    });
    if (existing) return existing;

    return (prisma as any).operationalAlert.create({
        data: {
            tourId: params.tourId,
            alertType: params.alertType,
            severity: params.severity,
            message: params.message,
            metadata: params.metadata || {},
            status: 'OPEN',
        },
    });
}

// ── Scan Tour for Alerts ──────────────────────────────────────────────

async function scanTourForAlerts(tourId: string) {
    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, status: true, startTime: true, assignedGuideId: true },
    });
    if (!tour) return [];

    const now = new Date();
    const alerts: any[] = [];

    // 1. Pickup delay — pickup not started 15+ min after scheduled start
    const minutesPastStart = (now.getTime() - new Date(tour.startTime).getTime()) / 60000;
    if (minutesPastStart > 15 && ['ASSIGNED', 'READY'].includes(tour.status)) {
        const pickupEvent = await (prisma as any).tourExecutionEvent.findFirst({
            where: { tourId, eventType: 'PICKUP_STARTED', isSimulation: false },
        });
        if (!pickupEvent) {
            const alert = await createAlert({
                tourId,
                alertType: ALERT_TYPES.PICKUP_DELAY,
                severity: minutesPastStart > 30 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
                message: `Pickup delayed ${Math.round(minutesPastStart)} minutes.`,
                metadata: { delayMinutes: Math.round(minutesPastStart) },
            });
            alerts.push(alert);
        }
    }

    // 2. Guide not verified — tour approaching and identity not verified
    const minutesUntilStart = -minutesPastStart;
    if (minutesUntilStart > 0 && minutesUntilStart < 30 && tour.assignedGuideId) {
        const verification = await (prisma as any).tourTeamVerification.findFirst({
            where: { tourId, guideId: tour.assignedGuideId },
        });
        if (!verification) {
            const alert = await createAlert({
                tourId,
                alertType: ALERT_TYPES.GUIDE_NOT_VERIFIED,
                severity: minutesUntilStart < 15 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
                message: `Guide identity not verified. Tour starts in ${Math.round(minutesUntilStart)} minutes.`,
            });
            alerts.push(alert);
        }
    }

    // 3. Active SOS
    const activeSOS = await (prisma as any).sOSGuideBroadcast.findFirst({
        where: { tourId, status: 'ACTIVE' },
    });
    if (activeSOS) {
        const alert = await createAlert({
            tourId,
            alertType: ALERT_TYPES.SOS_ACTIVE,
            severity: SEVERITY.CRITICAL,
            message: 'SOS guide request is active.',
        });
        alerts.push(alert);
    }

    // 4. Active incidents
    const openIncidents = await (prisma as any).incident.findMany({
        where: { requestId: tourId, resolved: false },
    });
    for (const incident of openIncidents) {
        const alert = await createAlert({
            tourId,
            alertType: ALERT_TYPES.INCIDENT_REPORTED,
            severity: incident.severity === 'HIGH' ? SEVERITY.CRITICAL : SEVERITY.WARNING,
            message: `Tour incident reported: ${incident.description.slice(0, 80)}`,
            metadata: { incidentId: incident.id },
        });
        alerts.push(alert);
    }

    return alerts;
}

// ── Get Active Alerts ─────────────────────────────────────────────────

async function getActiveAlerts(operatorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (prisma as any).operationalAlert.findMany({
        where: {
            status: 'OPEN',
            tour: { operatorId },
            createdAt: { gte: today },
        },
        include: {
            tour: { select: { id: true, title: true, assignedGuideId: true, startTime: true } },
        },
        orderBy: [
            { severity: 'desc' },
            { createdAt: 'desc' },
        ],
        take: 50,
    });
}

// ── Resolve Alert ─────────────────────────────────────────────────────

async function resolveAlert(alertId: string) {
    return (prisma as any).operationalAlert.update({
        where: { id: alertId },
        data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
        },
    });
}

// ── Batch Scan All Active Tours ───────────────────────────────────────

async function scanOperatorTours(operatorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tours = await prisma.serviceRequest.findMany({
        where: {
            operatorId,
            startTime: { gte: today, lt: tomorrow },
            status: { notIn: ['CANCELLED', 'COMPLETED', 'DRAFT'] },
        },
        select: { id: true },
    });

    const allAlerts: any[] = [];
    for (const tour of tours) {
        const alerts = await scanTourForAlerts(tour.id);
        allAlerts.push(...alerts);
    }
    return allAlerts;
}

// ── Exports ───────────────────────────────────────────────────────────

export const AlertEngineDomain = {
    createAlert,
    scanTourForAlerts,
    getActiveAlerts,
    resolveAlert,
    scanOperatorTours,
    ALERT_TYPES,
    SEVERITY,
};
