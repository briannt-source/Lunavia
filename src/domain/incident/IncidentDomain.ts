import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * IncidentDomain — Incident Lifecycle Mutations
 *
 * Handles incident creation, resolution, notifications, and risk recompute.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { evaluateOperatorRisk, persistRiskEvaluation } from '@/domain/risk/RiskEngine';
import { computeComplianceLevel } from '@/domain/operator/OperatorGovernance';
import { createTourEvent } from '@/lib/tour-events';

// ── Create Incident ─────────────────────────────────────────────────

interface CreateIncidentInput {
    requestId: string; reporterId: string; description: string;
    severity: string; operatorId: string; assignedGuideId?: string | null; tourTitle: string;
}

async function createIncident(input: CreateIncidentInput) {
    return executeSimpleMutation({
        entityName: 'Incident',
        actorId: input.reporterId,
        actorRole: 'SYSTEM',
        auditAction: 'INCIDENT_CREATED',
        metadata: { severity: input.severity, tourId: input.requestId },
        atomicMutation: async (tx) => {
            const incident = await tx.incident.create({
                data: {
                    requestId: input.requestId,
                    reporterId: input.reporterId,
                    description: input.description,
                    severity: input.severity,
                    status: 'OPEN',
                },
            });

            return { incident };
        },
        notification: async () => {
            // Notify operator if reporter is not operator
            if (input.operatorId !== input.reporterId) {
                await createDomainNotification({
                    userId: input.operatorId,
                    domain: NotificationDomain.INCIDENT,
                    targetUrl: '/dashboard/operator/tours',
                    type: 'INCIDENT_REPORTED',
                    title: 'Incident Reported',
                    message: `Incident reported on "${input.tourTitle}": ${input.description}`,
                });
            }

            // Notify guide if assigned and reporter is not guide
            if (input.assignedGuideId && input.assignedGuideId !== input.reporterId) {
                await createDomainNotification({
                    userId: input.assignedGuideId,
                    domain: NotificationDomain.INCIDENT,
                    targetUrl: '/dashboard/guide/tours',
                    type: 'INCIDENT_REPORTED',
                    title: 'Incident Reported',
                    message: `Incident reported on "${input.tourTitle}": ${input.description}`,
                });
            }

            await createTourEvent({
                tourId: input.requestId,
                actorId: input.reporterId,
                actorRole: 'SYSTEM',
                eventType: 'INCIDENT_REPORTED',
                metadata: { severity: input.severity, description: input.description },
            });
        },
    });
}

// ── Recompute Risk (best-effort) ────────────────────────────────────

async function recomputeOperatorRisk(operatorId: string, kybStatusOverride?: string) {
    try {
        const riskResult = await evaluateOperatorRisk(operatorId);
        const [completedTours, conflictCount, totalTours] = await Promise.all([
            prisma.tour.count({ where: { operatorId, status: 'COMPLETED' } }),
            prisma.conflict.count({ where: { OR: [{ filedById: operatorId }, { receivedById: operatorId }] } }),
            prisma.tour.count({ where: { operatorId } }),
        ]);
        let kybStatus = kybStatusOverride;
        if (!kybStatus) {
            const operator = await prisma.user.findUnique({ where: { id: operatorId }, select: { kybStatus: true } });
            kybStatus = operator?.kybStatus || 'NOT_STARTED';
        }
        const disputeRate = totalTours > 0 ? conflictCount / totalTours : 0;
        const compLevel = computeComplianceLevel({ kybStatus, completedTours, disputeRate, riskLevel: riskResult.level });
        await persistRiskEvaluation(operatorId, riskResult.score, compLevel);
    } catch (err) {
        console.error('Risk recompute failed (best-effort):', err);
    }
}

// ── Resolve Incident ────────────────────────────────────────────────

interface ResolveIncidentInput {
    incidentId: string; resolverId: string;
    resolution?: string; internalNotes?: string; status?: string;
}

async function resolveIncident(input: ResolveIncidentInput) {
    return executeSimpleMutation({
        entityName: 'Incident',
        entityId: input.incidentId,
        actorId: input.resolverId,
        actorRole: 'ADMIN',
        auditAction: 'INCIDENT_RESOLVED',
        metadata: { resolution: input.resolution },
        atomicMutation: async (tx) => {
            const incident = await tx.incident.update({
                where: { id: input.incidentId },
                data: {
                    status: input.status || 'RESOLVED',
                    resolution: input.resolution,
                    internalNotes: input.internalNotes,
                },
                include: { request: { select: { operatorId: true } } },
            });

            return { incident };
        },
        notification: async () => {
            // Post-resolution risk recompute (best-effort)
            const incident = await prisma.incident.findUnique({
                where: { id: input.incidentId },
                include: { request: { select: { operatorId: true } } },
            });
            if (incident) {
                await recomputeOperatorRisk(incident.request.operatorId);
            }
        },
    });
}

export const IncidentDomain = {
    createIncident,
    resolveIncident,
    recomputeOperatorRisk,
};
