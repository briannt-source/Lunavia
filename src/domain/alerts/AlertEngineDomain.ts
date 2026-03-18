/**
 * AlertEngineDomain — Operational Alert Detection & Management
 *
 * Detects operational issues from real tour data and creates OperationalAlert records.
 * Rules: pickup delay, tour delay, no check-in, segment skipped, incident reported.
 */

import { prisma } from '@/lib/prisma';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { TourHealthDomain } from '@/domain/health/TourHealthDomain';

// ── Alert Types & Severity ────────────────────────────────────────────

export const ALERT_TYPES = {
    TOUR_DELAYED: 'TOUR_DELAYED',
    PICKUP_DELAY: 'PICKUP_DELAY',
    SEGMENT_DELAY: 'SEGMENT_DELAY',
    SEGMENT_SKIPPED: 'SEGMENT_SKIPPED',
    NO_CHECKIN: 'NO_CHECKIN',
    INCIDENT_REPORTED: 'INCIDENT_REPORTED',
    HEALTH_CRITICAL: 'HEALTH_CRITICAL',
} as const;

export const ALERT_SEVERITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export const ALERT_STATUS = {
    OPEN: 'OPEN',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
} as const;

const ALERT_ICONS: Record<string, string> = {
    TOUR_DELAYED: '⏰',
    PICKUP_DELAY: '🚗',
    SEGMENT_DELAY: '📍',
    SEGMENT_SKIPPED: '⏭️',
    NO_CHECKIN: '❓',
    INCIDENT_REPORTED: '⚠️',
    HEALTH_CRITICAL: '🔴',
};

// ── Severity Ordering (for escalation) ────────────────────────────────
const SEVERITY_ORDER: Record<string, number> = {
    LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3,
};

function shouldEscalate(current: string, proposed: string): boolean {
    return (SEVERITY_ORDER[proposed] ?? 0) > (SEVERITY_ORDER[current] ?? 0);
}

// ── Detection Engine ──────────────────────────────────────────────────

interface DetectedAlert {
    tourId: string;
    alertType: string;
    severity: string;
    message: string;
    metadata?: any;
    operatorId: string;
}

async function runDetection(): Promise<{ created: number; scanned: number }> {
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Fetch active tours with related data
    const activeTours = await (prisma as any).serviceRequest.findMany({
        where: {
            status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
            startTime: { lt: now }, // Only tours that should have started
        },
        include: {
            segments: {
                include: { checkIns: { orderBy: { checkInTime: 'desc' }, take: 1 } },
                orderBy: { orderIndex: 'asc' },
            },
            incidents: { where: { status: 'OPEN', createdAt: { gte: thirtyMinAgo } } },
            operationalAlerts: { where: { status: 'OPEN' } },
        },
    });

    const detectedAlerts: DetectedAlert[] = [];

    for (const tour of activeTours) {
        const existingTypes = new Set(tour.operationalAlerts.map((a: any) => a.alertType));

        // Rule 1 — Tour departure delay: ASSIGNED but past start time
        if (tour.status === 'ASSIGNED' && !tour.operatorStartedAt) {
            const delayMin = Math.round((now.getTime() - tour.startTime.getTime()) / 60000);
            if (delayMin >= 15) {
                const newSeverity = delayMin >= 60 ? ALERT_SEVERITY.CRITICAL : delayMin >= 30 ? ALERT_SEVERITY.HIGH : ALERT_SEVERITY.MEDIUM;
                const existingAlert = tour.operationalAlerts.find((a: any) => a.alertType === ALERT_TYPES.TOUR_DELAYED);

                if (!existingAlert) {
                    detectedAlerts.push({
                        tourId: tour.id,
                        alertType: ALERT_TYPES.TOUR_DELAYED,
                        severity: newSeverity,
                        message: `Tour "${tour.title}" is delayed by ${delayMin} minutes. No operator start recorded.`,
                        metadata: { delayMinutes: delayMin, plannedStart: tour.startTime.toISOString() },
                        operatorId: tour.operatorId,
                    });
                } else if (existingAlert.severity !== newSeverity && shouldEscalate(existingAlert.severity, newSeverity)) {
                    // Escalate existing alert severity
                    try {
                        await (prisma as any).operationalAlert.update({
                            where: { id: existingAlert.id },
                            data: {
                                severity: newSeverity,
                                message: `Tour "${tour.title}" is delayed by ${delayMin} minutes — escalated to ${newSeverity}.`,
                                metadata: { delayMinutes: delayMin, plannedStart: tour.startTime.toISOString(), escalatedFrom: existingAlert.severity },
                            },
                        });
                    } catch { /* escalation failed, skip */ }
                }
            }
        }

        // Rule 2 — No guide check-in: IN_PROGRESS but no check-ins in 30 min
        if (tour.status === 'IN_PROGRESS' && tour.operatorStartedAt) {
            const allCheckIns = tour.segments.flatMap((s: any) => s.checkIns);
            const latestCheckIn = allCheckIns.sort((a: any, b: any) =>
                new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
            )[0];

            const lastActivity = latestCheckIn
                ? new Date(latestCheckIn.checkInTime)
                : tour.operatorStartedAt;

            const silentMin = Math.round((now.getTime() - lastActivity.getTime()) / 60000);
            if (silentMin >= 30 && !existingTypes.has(ALERT_TYPES.NO_CHECKIN)) {
                detectedAlerts.push({
                    tourId: tour.id,
                    alertType: ALERT_TYPES.NO_CHECKIN,
                    severity: silentMin >= 60 ? ALERT_SEVERITY.HIGH : ALERT_SEVERITY.MEDIUM,
                    message: `No guide activity for ${silentMin} minutes on "${tour.title}".`,
                    metadata: { silentMinutes: silentMin },
                    operatorId: tour.operatorId,
                });
            }
        }

        // Rule 3 — Segment skipped
        const skippedSegments = tour.segments.filter((s: any) =>
            s.checkIns.length > 0 && s.checkIns[0].status === 'SKIPPED'
        );
        for (const seg of skippedSegments) {
            const skipAlertKey = `${ALERT_TYPES.SEGMENT_SKIPPED}-${seg.id}`;
            const hasExisting = tour.operationalAlerts.some((a: any) =>
                a.alertType === ALERT_TYPES.SEGMENT_SKIPPED && a.metadata && (a.metadata as any).segmentId === seg.id
            );
            if (!hasExisting) {
                detectedAlerts.push({
                    tourId: tour.id,
                    alertType: ALERT_TYPES.SEGMENT_SKIPPED,
                    severity: ALERT_SEVERITY.MEDIUM,
                    message: `Segment "${seg.title}" was skipped on "${tour.title}".`,
                    metadata: { segmentId: seg.id, segmentTitle: seg.title },
                    operatorId: tour.operatorId,
                });
            }
        }

        // Rule 4 — Recent incidents
        for (const inc of tour.incidents) {
            const hasExisting = tour.operationalAlerts.some((a: any) =>
                a.alertType === ALERT_TYPES.INCIDENT_REPORTED && a.metadata && (a.metadata as any).incidentId === inc.id
            );
            if (!hasExisting) {
                detectedAlerts.push({
                    tourId: tour.id,
                    alertType: ALERT_TYPES.INCIDENT_REPORTED,
                    severity: inc.severity === 'HIGH' ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH,
                    message: `Incident reported on "${tour.title}": ${inc.description.substring(0, 100)}`,
                    metadata: { incidentId: inc.id, severity: inc.severity },
                    operatorId: tour.operatorId,
                });
            }
        }

        // Rule 5 — Health score critical (< 50)
        if (!existingTypes.has(ALERT_TYPES.HEALTH_CRITICAL)) {
            try {
                const health = await TourHealthDomain.computeHealth(tour.id);
                if (health.score < 50) {
                    detectedAlerts.push({
                        tourId: tour.id,
                        alertType: ALERT_TYPES.HEALTH_CRITICAL,
                        severity: health.score < 30 ? ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.HIGH,
                        message: `Tour "${tour.title}" health score dropped to ${health.score} (${health.label}).`,
                        metadata: { healthScore: health.score, status: health.label },
                        operatorId: tour.operatorId,
                    });
                }
            } catch { /* health computation failed, skip */ }
        }
    }

    // Create alerts and notifications
    let created = 0;
    for (const alert of detectedAlerts) {
        try {
            await (prisma as any).operationalAlert.create({
                data: {
                    tourId: alert.tourId,
                    alertType: alert.alertType,
                    severity: alert.severity,
                    message: alert.message,
                    metadata: alert.metadata || undefined,
                },
            });

            // Notify operator
            await createDomainNotification({
                userId: alert.operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours/${alert.tourId}/live`,
                type: `ALERT_${alert.alertType}`,
                title: `${ALERT_ICONS[alert.alertType] || '⚠️'} ${alert.alertType.replace(/_/g, ' ')}`,
                message: alert.message,
                relatedId: alert.tourId,
            });

            created++;
        } catch (err) {
            console.error(`[AlertEngine] Failed to create alert:`, err);
        }
    }

    return { created, scanned: activeTours.length };
}

// ── Query Alerts ──────────────────────────────────────────────────────

async function getAlerts(filters: { status?: string; tourId?: string; limit?: number }) {
    return (prisma as any).operationalAlert.findMany({
        where: {
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.tourId ? { tourId: filters.tourId } : {}),
        },
        include: {
            tour: { select: { id: true, title: true, operatorId: true, assignedGuideId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
    });
}

async function getAlertById(id: string) {
    return (prisma as any).operationalAlert.findUnique({
        where: { id },
        include: {
            tour: { select: { id: true, title: true, operatorId: true, assignedGuideId: true } },
        },
    });
}

// ── Lifecycle ─────────────────────────────────────────────────────────

async function acknowledgeAlert(id: string) {
    return (prisma as any).operationalAlert.update({
        where: { id },
        data: { status: ALERT_STATUS.ACKNOWLEDGED },
    });
}

async function resolveAlert(id: string) {
    return (prisma as any).operationalAlert.update({
        where: { id },
        data: { status: ALERT_STATUS.RESOLVED, resolvedAt: new Date() },
    });
}

export const AlertEngineDomain = {
    runDetection,
    getAlerts,
    getAlertById,
    acknowledgeAlert,
    resolveAlert,
    ALERT_TYPES,
    ALERT_SEVERITY,
    ALERT_STATUS,
    ALERT_ICONS,
};
