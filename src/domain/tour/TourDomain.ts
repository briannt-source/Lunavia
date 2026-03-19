/**
 * TourDomain — Mutation Boundary for Tour Operations
 *
 * ALL tour state mutations MUST go through this service.
 * Route layer calls these functions; this is the ONLY place
 * where prisma.tour is mutated.
 *
 * Governed mutations use executeGovernedMutation kernel.
 * Simpler mutations use executeSimpleMutation kernel.
 */

import { prisma } from '@/lib/prisma';
import { executeGovernedMutation } from '@/domain/governance/executeGovernedMutation';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { TOUR_MACHINE } from '@/lib/state-machine';
import { snapshotRecord } from '@/domain/governance/AuditService';
import { createExecutionArchive } from '@/domain/governance/ExecutionArchive';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { emitEvent } from '@/lib/events';
import { TOUR_STATUS } from '@/lib/tour-lifecycle';

// ══════════════════════════════════════════════════════════════════════
// TOUR COMPLETION — Governed Mutation
// ══════════════════════════════════════════════════════════════════════

interface CompleteTourInput {
    tourId: string;
    actorId: string;
    actorRole: string;
    ipAddress: string;
}

export async function completeTour(input: CompleteTourInput) {
    const { tourId, actorId, actorRole, ipAddress } = input;

    const request = await prisma.tour.findUnique({ where: { id: tourId } });
    if (!request) throw new Error('Request not found');
    if (request.operatorId !== actorId) throw new Error('Not your request');

    return executeGovernedMutation({
        entityName: 'Tour',
        entityId: tourId,
        actorId,
        actorRole,
        stateMachine: TOUR_MACHINE,
        fromState: request.status,
        toState: 'COMPLETED',
        invariants: [
            async (tx) => {
                const openIncidents = await (tx as any).incident?.count({
                    where: { tourId, status: { not: 'RESOLVED' } },
                }).catch(() => 0);
                if (openIncidents > 0) {
                    throw new Error(`Cannot complete tour: ${openIncidents} unresolved incident(s)`);
                }
            },
        ],
        atomicMutation: async (tx) => {
            const result = await tx.serviceRequest.update({
                where: { id: tourId },
                data: { status: 'COMPLETED' },
            });
            await createExecutionArchive(tourId);
            return result;
        },
        auditAction: 'TOUR_COMPLETED',
        auditBefore: snapshotRecord(request),
        auditAfter: (result) => snapshotRecord(result),
        notification: async () => {
            if (request.assignedGuideId) {
                await createDomainNotification({
                    userId: request.assignedGuideId,
                    domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tours/${tourId}`,
                    type: 'TOUR_COMPLETED',
                    title: 'Tour Completed',
                    message: `Tour "${request.title}" completed successfully.`,
                    relatedId: tourId,
                });
            }
        },
        ipAddress,
    });
}

// ══════════════════════════════════════════════════════════════════════
// SEGMENT CREATION — Simple Mutation
// ══════════════════════════════════════════════════════════════════════

interface CreateSegmentsInput {
    tourId: string;
    actorId: string;
    segments: { title: string; type: string; plannedStartTime?: string; orderIndex: number }[];
}

export async function createSegments(input: CreateSegmentsInput) {
    const { tourId, actorId, segments } = input;

    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, operatorId: true, status: true },
    });

    if (!tour) throw new Error('Tour not found');
    if (tour.operatorId !== actorId) throw new Error('Only the tour operator can create segments');

    if (['IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(tour.status)) {
        throw new Error('Cannot modify segments after tour has started');
    }

    // Delete existing segments and create new ones atomically
    return executeSimpleMutation({
        entityName: 'TourSegment',
        entityId: tourId,
        actorId,
        actorRole: 'OPERATOR',
        auditAction: 'SEGMENTS_CREATED',
        metadata: { segmentCount: segments.length },
        atomicMutation: async (tx) => {
            await (tx as any).tourSegment.deleteMany({ where: { tourId } });

            const created = await Promise.all(
                segments.map((seg) =>
                    (tx as any).tourSegment.create({
                        data: {
                            tourId,
                            title: seg.title,
                            type: seg.type,
                            plannedStartTime: seg.plannedStartTime ? new Date(seg.plannedStartTime) : null,
                            orderIndex: seg.orderIndex,
                        },
                    })
                )
            );

            return created;
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// BULK OPERATIONS — Accept applications / Close tours
// ══════════════════════════════════════════════════════════════════════

interface BulkAcceptInput {
    operatorId: string;
    applicationIds: string[];
}

export async function bulkAcceptApplications(input: BulkAcceptInput) {
    const { operatorId, applicationIds } = input;
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const appId of applicationIds) {
        try {
            await executeSimpleMutation({
                entityName: 'GuideApplication',
                entityId: appId,
                actorId: operatorId,
                actorRole: 'OPERATOR',
                auditAction: 'BULK_ACCEPT_APPLICATION',
                metadata: { applicationId: appId },
                atomicMutation: async (tx) => {
                    const application = await tx.guideApplication.findUnique({
                        where: { id: appId },
                        include: { request: true },
                    });
                    if (!application || application.request.operatorId !== operatorId) {
                        throw new Error('Application not found or unauthorized');
                    }
                    if (application.status !== 'APPLIED') {
                        throw new Error(`Application in ${application.status} state`);
                    }
                    await tx.serviceRequest.update({
                        where: { id: application.requestId },
                        data: { status: TOUR_STATUS.ASSIGNED, assignedGuideId: application.guideId },
                    });
                    await tx.guideApplication.update({
                        where: { id: appId },
                        data: { status: 'ACCEPTED' },
                    });

                    return { requestId: application.requestId, guideId: application.guideId };
                },
                notification: async () => {
                    // Emit guide assigned event
                    const application = await prisma.guideApplication.findUnique({
                        where: { id: appId },
                        select: { requestId: true, guideId: true },
                    });
                    if (application) {
                        await emitEvent('GUIDE_ASSIGNED', {
                            tourId: application.requestId,
                            actorId: operatorId,
                            targetUserId: application.guideId,
                            timestamp: new Date(),
                        });
                    }
                },
            });
            results.successful++;
        } catch (err: any) {
            results.failed++;
            results.errors.push(`${appId}: ${err.message}`);
        }
    }
    return results;
}

interface BulkCloseInput {
    operatorId: string;
    tourIds: string[];
}

export async function bulkCloseTours(input: BulkCloseInput) {
    const { operatorId, tourIds } = input;
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const tourId of tourIds) {
        try {
            const tour = await prisma.tour.findUnique({
                where: { id: tourId },
                include: {
                    incidents: { where: { status: 'OPEN' } },
                    feedback: { where: { severity: { not: 'OK' } } },
                },
            });
            if (!tour || tour.operatorId !== operatorId) throw new Error('Tour not found or unauthorized');
            if (tour.status !== TOUR_STATUS.COMPLETED) throw new Error(`Tour in ${tour.status} state`);
            if (tour.incidents.length > 0) throw new Error('Tour has open incidents');

            await executeSimpleMutation({
                entityName: 'ServiceRequest',
                entityId: tourId,
                actorId: operatorId,
                actorRole: 'OPERATOR',
                auditAction: 'BULK_CLOSE_TOUR',
                metadata: { method: 'COMMAND_CENTER' },
                atomicMutation: async (tx) => {
                    await tx.serviceRequest.update({
                        where: { id: tourId },
                        data: { status: TOUR_STATUS.CLOSED, operatorClosedAt: new Date(), closeReason: 'CONFIRMED' },
                    });

                    return { ok: true };
                },
            });
            results.successful++;
        } catch (err: any) {
            results.failed++;
            results.errors.push(`${tourId}: ${err.message}`);
        }
    }
    return results;
}
