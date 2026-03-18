/**
 * ExecutionDomain — Tour Lifecycle Mutations
 *
 * All tour state transitions live here:
 * start, check-in, return, confirm, reopen, reassign,
 * cancel (direct), cancel/propose, cancel/reject, cancel/force,
 * create, update.
 */

import { prisma } from '@/lib/prisma';
import { executeGovernedMutation } from '@/domain/governance/executeGovernedMutation';
import { createTourEvent, TOUR_EVENT_TYPES, ACTOR_ROLES } from '@/lib/tour-events';
import { createDomainNotification, createDomainNotificationTx, NotificationDomain } from '@/domain/notification/NotificationService';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';
import { canOperatorStart, TOUR_STATUS } from '@/lib/tour-lifecycle';
import {
    CancellationType, getCancellationTiming,
    CANCELLATION_STATUSES, canProposeCancel, canForceCancel,
    isValidForceCancelReason, ForceCancelReason,
    CancellationTiming, getMutualTrustImpact,
} from '@/lib/cancellation';


// ══════════════════════════════════════════════════════════════════════
// START TOUR (Operator)
// ══════════════════════════════════════════════════════════════════════

interface StartTourInput { tourId: string; userId: string; actorRole?: string; }

async function startTour(input: StartTourInput) {
    const { tourId, userId, actorRole } = input;

    const request = await prisma.serviceRequest.findUnique({ where: { id: tourId } });
    if (!request) throw new Error('NOT_FOUND');

    // Allow either the Operator or the assigned Guide to start the tour
    const isOperator = request.operatorId === userId;
    const isGuide = request.assignedGuideId === userId;
    if (!isOperator && !isGuide) throw new Error('FORBIDDEN');
    if (!request.assignedGuideId) throw new Error('NO_GUIDE');

    const canStart = canOperatorStart({
        startTime: request.startTime,
        status: request.status,
        guideCheckedInAt: request.guideCheckedInAt,
    });
    if (!canStart.allowed) throw new Error(`CANNOT_START:${canStart.reason}`);

    const now = new Date();
    const startedBy = isOperator ? 'OPERATOR' : 'GUIDE';

    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: startedBy,
        auditAction: isOperator ? 'OPERATOR_START_TOUR' : 'GUIDE_START_TOUR',
        auditBefore: { status: request.status },
        auditAfter: () => ({ status: TOUR_STATUS.IN_PROGRESS, startedAt: now.toISOString() }),
        metadata: { tourTitle: request.title, startedBy },
        atomicMutation: async (tx) => {
            const updated = await tx.serviceRequest.update({
                where: { id: tourId },
                data: { status: TOUR_STATUS.IN_PROGRESS, operatorStartedAt: now },
            });

            return updated;
        },
        notification: async () => {
            await createTourEvent({
                tourId, actorId: userId, actorRole: isOperator ? ACTOR_ROLES.OPERATOR : ACTOR_ROLES.GUIDE,
                eventType: TOUR_EVENT_TYPES.TOUR_STARTED_BY_OPERATOR,
            });

            // Cross-notification: notify the other party
            if (isOperator && request.assignedGuideId) {
                await createDomainNotification({
                    userId: request.assignedGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tours/${tourId}/execute`,
                    type: 'TOUR_STARTED', title: '🚀 Tour Started',
                    message: `"${request.title}" has been started by the operator. Begin your duties!`,
                    relatedId: tourId,
                });
            } else if (isGuide && request.operatorId) {
                await createDomainNotification({
                    userId: request.operatorId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/operator/tours/${tourId}/live`,
                    type: 'TOUR_STARTED', title: '🚀 Tour Started by Guide',
                    message: `Guide has started "${request.title}". Track progress live.`,
                    relatedId: tourId,
                });
            }

            // Auto-toggle guide availability when tour starts
            if (request.assignedGuideId) {
                await prisma.user.update({
                    where: { id: request.assignedGuideId },
                    data: { isAvailable: false } as any,
                }).catch((err: any) => console.warn('[startTour] Guide availability toggle failed:', err));
            }
        },
    });

    return { request: result, startedAt: now };
}

// ══════════════════════════════════════════════════════════════════════
// GUIDE CHECK-IN
// ══════════════════════════════════════════════════════════════════════

interface GuideCheckInInput { tourId: string; userId: string; }

async function guideCheckIn(input: GuideCheckInInput) {
    const { tourId, userId } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, status: true, startTime: true, assignedGuideId: true, guideCheckedInAt: true, title: true, operatorId: true },
    });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.assignedGuideId !== userId) throw new Error('NOT_ASSIGNED');
    if (!['ASSIGNED', 'READY'].includes(tour.status)) throw new Error(`INVALID_STATE:${tour.status}`);
    if (tour.guideCheckedInAt) throw new Error('ALREADY_CHECKED_IN');

    const now = new Date();
    const startTime = new Date(tour.startTime);
    const windowStart = new Date(startTime.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(startTime.getTime() + 15 * 60 * 1000); // Allow check-in up to 15 min late
    if (now < windowStart) throw new Error(`TOO_EARLY:${windowStart.toISOString()}`);
    if (now > windowEnd) throw new Error('WINDOW_CLOSED');

    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: 'GUIDE',
        auditAction: 'GUIDE_CHECK_IN',
        auditBefore: { status: tour.status },
        auditAfter: () => ({ status: 'READY', checkedInAt: now.toISOString() }),
        metadata: { tourTitle: tour.title },
        atomicMutation: async (tx) => {
            return tx.serviceRequest.update({
                where: { id: tourId },
                data: { guideCheckedInAt: now, status: 'READY' },
            });
        },
        notification: async () => {
            await createTourEvent({
                tourId, actorId: userId, actorRole: ACTOR_ROLES.GUIDE,
                eventType: TOUR_EVENT_TYPES.GUIDE_CHECKED_IN,
            });

            // Notify operator that guide has checked in and is ready
            if (tour.operatorId) {
                await createDomainNotification({
                    userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/operator/tours/${tourId}/live`,
                    type: 'GUIDE_CHECKED_IN', title: '📍 Guide Checked In',
                    message: `Guide has checked in for "${tour.title}" and is ready. You can now start the tour.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { checkedInAt: now, status: result.status };
}

// ══════════════════════════════════════════════════════════════════════
// RETURN TOUR (Guide completes)
// ══════════════════════════════════════════════════════════════════════

interface ReturnTourInput {
    tourId: string; userId: string;
    completionStatus: string; notes?: string; incidentSummary?: string;
}

async function returnTour(input: ReturnTourInput) {
    const { tourId, userId, completionStatus, notes, incidentSummary } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, status: true, startTime: true, endTime: true, assignedGuideId: true, guideReturnedAt: true, title: true, operatorId: true },
    });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.assignedGuideId !== userId) throw new Error('NOT_ASSIGNED');
    if (tour.status !== 'IN_PROGRESS') throw new Error(`INVALID_STATE:${tour.status}`);
    if (tour.guideReturnedAt) throw new Error('ALREADY_RETURNED');

    // ── Guest Headcount Validation ───────────────────────────────
    const { getGuestHeadcount } = await import('@/domain/execution/GuestDomain');
    const headcount = await getGuestHeadcount(tourId);
    if (headcount.total > 0 && !headcount.allAccountedFor) {
        throw new Error(`GUESTS_NOT_ACCOUNTED:${headcount.pending} guests still pending. Check in, mark as no-show, or note early leave before returning.`);
    }

    const now = new Date();
    const endTime = new Date(tour.endTime);
    // No TOO_EARLY guard — guide can return anytime while IN_PROGRESS
    // Operator confirmation is the real gatekeeper
    const windowEnd = new Date(endTime.getTime() + 60 * 60 * 1000);
    const isLateReturn = now > windowEnd;

    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: 'GUIDE',
        auditAction: 'GUIDE_RETURN_TOUR',
        auditBefore: { status: 'IN_PROGRESS' },
        auditAfter: () => ({ status: 'COMPLETED', returnedAt: now.toISOString(), isLateReturn }),
        metadata: {
            tourTitle: tour.title, completionStatus, isLateReturn, hasIncidentSummary: !!incidentSummary,
            guestHeadcount: headcount.total > 0 ? headcount : undefined,
        },
        atomicMutation: async (tx) => {
            const updatedTour = await tx.serviceRequest.update({
                where: { id: tourId },
                data: { guideReturnedAt: now, returnStatus: completionStatus, returnNotes: notes || null, status: 'COMPLETED' },
            });

            if (incidentSummary) {
                await tx.incident.create({
                    data: { requestId: tourId, reporterId: userId, description: `[GUIDE_REPORT] ${incidentSummary}`, status: 'OPEN', severity: 'MEDIUM' },
                });
            }

            return updatedTour;
        },
        notification: async () => {
            await createTourEvent({ tourId, actorId: userId, actorRole: ACTOR_ROLES.GUIDE, eventType: TOUR_EVENT_TYPES.TOUR_RETURNED, metadata: { isLateReturn, completionStatus } });
            await createTourEvent({ tourId, actorId: userId, actorRole: ACTOR_ROLES.GUIDE, eventType: TOUR_EVENT_TYPES.TOUR_COMPLETED });

            // Notify operator — this is the "buzz" to review and confirm
            if (tour.operatorId) {
                await createDomainNotification({
                    userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/operator/tours/${tourId}/live`,
                    type: 'TOUR_RETURNED', title: '📤 Tour Returned — Action Required',
                    message: `Guide has returned "${tour.title}". Please review the report and confirm or dispute the tour completion.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { returnedAt: now, status: result.status, isLateReturn };
}

// ══════════════════════════════════════════════════════════════════════
// CONFIRM TOUR (Operator confirm/reject completed tour)
// ══════════════════════════════════════════════════════════════════════

interface ConfirmTourInput {
    tourId: string; userId: string;
    action: 'CONFIRM' | 'REJECT'; reason?: string; notes?: string;
}

async function confirmTour(input: ConfirmTourInput) {
    const { tourId, userId, action, reason, notes } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, status: true, operatorId: true, assignedGuideId: true, title: true },
    });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== userId) throw new Error('FORBIDDEN');
    if (tour.status !== 'COMPLETED') throw new Error(`INVALID_STATE:${tour.status}`);

    const now = new Date();

    if (action === 'CONFIRM') {
        const result = await executeGovernedMutation({
            entityName: 'ServiceRequest',
            entityId: tourId,
            actorId: userId,
            actorRole: 'OPERATOR',
            auditAction: 'OPERATOR_CONFIRM_TOUR',
            auditBefore: { status: 'COMPLETED' },
            auditAfter: () => ({ status: 'CLOSED', action: 'CONFIRM' }),
            metadata: { tourTitle: tour.title, action: 'CONFIRM' },
            atomicMutation: async (tx) => {
                return tx.serviceRequest.update({
                    where: { id: tourId },
                    data: { operatorClosedAt: now, closeReason: 'CONFIRMED', closeNotes: notes || null, status: 'CLOSED' },
                });
            },
            notification: async () => {
                if (tour.assignedGuideId) {
                    await createDomainNotification({
                        userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                        targetUrl: `/dashboard/guide/tours/${tourId}`,
                        type: 'TOUR_CONFIRMED', title: 'Tour Confirmed',
                        message: `Your tour "${tour.title}" has been confirmed by the operator.`,
                        relatedId: tourId,
                    });
                    await PrismaUserTrustRepo.appendEvent(tour.assignedGuideId, 'TOUR_CONFIRMED', 1, tourId);
                }
            },
        });

        // Release escrow (commission + payout) after successful confirmation
        try {
            const { releaseEscrow } = await import('@/domain/finance/FinanceDomain');
            await releaseEscrow({
                tourId,
                actorId: userId,
                actorRole: 'OPERATOR',
                notes: 'Auto-released on tour confirmation',
                ipAddress: 'system-automated',
            });
        } catch (err) {
            // Escrow release may fail if tour has no escrow (INTERNAL settlement) — that's OK
            console.warn(`[confirmTour] Escrow release skipped/failed for ${tourId}:`, err);
        }

        // Auto-restore guide availability
        if (tour.assignedGuideId) {
            try {
                await prisma.user.update({
                    where: { id: tour.assignedGuideId },
                    data: { isAvailable: true } as any,
                });
            } catch (err) {
                console.warn(`[confirmTour] Guide availability restore failed:`, err);
            }
        }

        return { closedAt: now, status: result.status, closeReason: result.closeReason };
    }

    // REJECT → Create dispute instead of silently closing
    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: 'OPERATOR',
        auditAction: 'OPERATOR_REJECT_TOUR',
        auditBefore: { status: 'COMPLETED' },
        auditAfter: () => ({ status: 'DISPUTED', reason }),
        metadata: { tourTitle: tour.title, action: 'REJECT', reason },
        atomicMutation: async (tx) => {
            // Set tour to DISPUTED — requires OPS resolution
            const updated = await tx.serviceRequest.update({
                where: { id: tourId },
                data: { status: 'DISPUTED', closeReason: reason, closeNotes: notes || null },
            });

            // Create incident for dispute resolution
            await tx.incident.create({
                data: {
                    requestId: tourId,
                    reporterId: userId,
                    description: `Operator rejected completed tour: ${reason}${notes ? ` — ${notes}` : ''}`,
                    severity: 'MEDIUM',
                    status: 'INVESTIGATING',
                    internalNotes: 'Auto-created from operator tour rejection. Requires OPS review.',
                },
            });

            return updated;
        },
        notification: async () => {
            if (tour.assignedGuideId) {
                await createDomainNotification({
                    userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tours/${tourId}`,
                    type: 'TOUR_DISPUTED', title: 'Tour Under Dispute',
                    message: `Your tour "${tour.title}" was disputed by the operator. Reason: ${reason}${notes ? ` - ${notes}` : ''}. Our team will review.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { closedAt: null, status: 'DISPUTED', closeReason: reason };
}

// ══════════════════════════════════════════════════════════════════════
// REOPEN TOUR (Internal roles)
// ══════════════════════════════════════════════════════════════════════

interface ReopenTourInput { tourId: string; userId: string; userRole: string; reason: string; notes?: string; }

async function reopenTour(input: ReopenTourInput) {
    const { tourId, userId, userRole, reason, notes } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, status: true, operatorId: true, assignedGuideId: true, title: true, closeReason: true },
    });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.status !== 'CLOSED') throw new Error(`INVALID_STATE:${tour.status}`);

    const now = new Date();

    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: userRole,
        auditAction: 'INTERNAL_REOPEN_TOUR',
        auditBefore: { status: 'CLOSED', closeReason: tour.closeReason },
        auditAfter: () => ({ status: 'REOPENED', reopenedAt: now.toISOString() }),
        metadata: { tourTitle: tour.title, reason, notes, previousCloseReason: tour.closeReason },
        atomicMutation: async (tx) => {
            return tx.serviceRequest.update({
                where: { id: tourId },
                data: { status: 'REOPENED' },
            });
        },
        notification: async () => {
            await createDomainNotification({
                userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours/${tourId}`,
                type: 'TOUR_REOPENED', title: 'Tour Reopened',
                message: `Tour "${tour.title}" has been reopened for investigation by ${userRole}.`,
                relatedId: tourId,
            });

            if (tour.assignedGuideId) {
                await createDomainNotification({
                    userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tours/${tourId}`,
                    type: 'TOUR_REOPENED', title: 'Tour Reopened',
                    message: `Tour "${tour.title}" has been reopened for investigation.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { status: result.status, reopenedAt: now };
}

// ══════════════════════════════════════════════════════════════════════
// REASSIGN GUIDE (Operator, in-house only)
// ══════════════════════════════════════════════════════════════════════

interface ReassignGuideInput { tourId: string; operatorId: string; newGuideId: string; }

async function reassignGuide(input: ReassignGuideInput) {
    const { tourId, operatorId, newGuideId } = input;

    const request = await prisma.serviceRequest.findUnique({ where: { id: tourId } });
    if (!request) throw new Error('NOT_FOUND');
    if (request.operatorId !== operatorId) throw new Error('FORBIDDEN');
    if (!['ASSIGNED', 'IN_PROGRESS'].includes(request.status)) throw new Error('INACTIVE');
    if (request.status === 'FORCE_CANCEL_PENDING_REVIEW') throw new Error('LOCKED');

    const oldGuideId = request.assignedGuideId;
    if (!oldGuideId) throw new Error('NO_CURRENT_GUIDE');

    const oldGuide = await prisma.user.findUnique({ where: { id: oldGuideId } });
    if (!oldGuide) throw new Error('CURRENT_GUIDE_NOT_FOUND');

    let isOldAffiliated = false;
    isOldAffiliated = oldGuide.guideMode === 'IN_HOUSE' && oldGuide.affiliatedOperatorId === operatorId;
    if (!isOldAffiliated) {
        // Fallback for older data inside roleMetadata
        try {
            const oldMeta = oldGuide.roleMetadata ? JSON.parse(oldGuide.roleMetadata) : {};
            isOldAffiliated = oldMeta.type === 'inhouse' && oldMeta.affiliatedOperatorId === operatorId;
        } catch { /* ignore */ }
    }
    if (!isOldAffiliated) throw new Error('CURRENT_GUIDE_NOT_AFFILIATED');

    const newGuide = await prisma.user.findUnique({ where: { id: newGuideId } });
    if (!newGuide) throw new Error('GUIDE_NOT_FOUND');

    let isAffiliated = false;
    isAffiliated = newGuide.guideMode === 'IN_HOUSE' && newGuide.affiliatedOperatorId === operatorId;
    if (!isAffiliated) {
        try {
            const meta = newGuide.roleMetadata ? JSON.parse(newGuide.roleMetadata) : {};
            isAffiliated = meta.type === 'inhouse' && meta.affiliatedOperatorId === operatorId;
        } catch { /* ignore */ }
    }
    if (!isAffiliated) throw new Error('NEW_GUIDE_NOT_AFFILIATED');

    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'OPERATOR_REASSIGN_INHOUSE',
        auditBefore: { assignedGuideId: oldGuideId },
        auditAfter: () => ({ assignedGuideId: newGuideId }),
        metadata: { oldGuideId, newGuideId, reason: 'In-house operational reassignment' },
        atomicMutation: async (tx) => {
            return tx.serviceRequest.update({
                where: { id: tourId },
                data: { assignedGuideId: newGuideId },
            });
        },
        notification: async () => {
            await createDomainNotification({
                userId: newGuideId, domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/guide/tours/${tourId}`,
                type: 'TOUR_ASSIGNED', title: 'New Assignment (Reassigned)',
                message: `You have been reassigned to: ${request.title}`,
                relatedId: tourId,
            });

            if (oldGuideId) {
                await createDomainNotification({
                    userId: oldGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: '/dashboard/guide/tours',
                    type: 'TOUR_CANCELLED', title: 'Assignment Removed',
                    message: `You have been removed from: ${request.title} (Operational Reassignment)`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { request: result };
}

// ══════════════════════════════════════════════════════════════════════
// CANCEL TOUR (Direct — Operator or Guide)
// ══════════════════════════════════════════════════════════════════════

interface CancelTourInput {
    tourId: string; userId: string; userRole: string;
    reason: string; explanation?: string;
}

async function cancelTour(input: CancelTourInput) {
    const { tourId, userId, userRole, reason, explanation } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        include: { applications: true, escrowTransaction: true },
    });
    if (!tour) throw new Error('NOT_FOUND');

    if (userRole === 'TOUR_OPERATOR' && tour.operatorId !== userId) throw new Error('FORBIDDEN');
    if (userRole === 'TOUR_GUIDE' && tour.assignedGuideId !== userId) throw new Error('FORBIDDEN');
    if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(tour.status)) throw new Error('INVALID_STATE');

    const isForceMajeure = reason === 'FORCE_MAJEURE';
    const isGuideNoShow = reason === 'GUIDE_NO_SHOW';
    const hasEscrowHeld = tour.escrowStatus === 'HELD' && tour.escrowTransaction;

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: userRole,
        auditAction: userRole === 'TOUR_OPERATOR' ? 'OPERATOR_CANCEL_TOUR' : 'GUIDE_WITHDRAW_TOUR',
        auditBefore: { status: tour.status },
        auditAfter: () => ({ status: userRole === 'TOUR_OPERATOR' ? 'CANCELLED' : 'OPEN', reason }),
        metadata: { reason, explanation, isForceMajeure, isGuideNoShow, tourTitle: tour.title },
        atomicMutation: async (tx) => {
            if (userRole === 'TOUR_OPERATOR') {
                await tx.serviceRequest.update({
                    where: { id: tourId },
                    data: { status: 'CANCELLED', closeReason: reason, closeNotes: explanation, operatorClosedAt: new Date() },
                });

                if (isForceMajeure) {
                    await tx.incident.create({
                        data: { requestId: tourId, reporterId: userId, description: `Tour Cancelled due to Force Majeure: ${explanation}`, severity: 'HIGH', status: 'INVESTIGATING', internalNotes: 'System flagged for review. Verify proof (weather/etc).' },
                    });
                }
            } else if (userRole === 'TOUR_GUIDE') {
                await tx.serviceRequest.update({
                    where: { id: tourId },
                    data: { status: 'OPEN', assignedGuideId: null },
                });
            }
            return { cancelled: true };
        },
        notification: async () => {
            if (userRole === 'TOUR_OPERATOR') {
                // If it's a GUIDE_NO_SHOW, penalize the guide, NOT the operator
                if (isGuideNoShow && tour.assignedGuideId) {
                    await PrismaUserTrustRepo.appendEvent(tour.assignedGuideId, 'NO_SHOW', -30, tourId);
                } 
                // Only penalize operator if a guide was already assigned AND it's not Force Majeure/Guide No Show
                else if (!isForceMajeure && tour.assignedGuideId) {
                    await PrismaUserTrustRepo.appendEvent(userId, 'TOUR_CANCELLED', -50, tourId);
                }
                
                if (tour.assignedGuideId) {
                    await createDomainNotification({
                        userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                        targetUrl: '/dashboard/guide/tours',
                        type: 'TOUR_CANCELLED', title: 'Tour Cancelled',
                        message: `The tour "${tour.title}" was cancelled by the operator. Reason: ${reason}`,
                        relatedId: tourId,
                    });
                }
            } else if (userRole === 'TOUR_GUIDE') {
                if (!isForceMajeure) {
                    await PrismaUserTrustRepo.appendEvent(userId, 'TOUR_CANCELLED', -30, tourId);
                }
                await createDomainNotification({
                    userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/operator/tours/${tourId}`,
                    type: 'GUIDE_WITHDREW', title: 'Guide Withdrew',
                    message: `Guide withdrew from "${tour.title}". Reason: ${reason}. Tour is now OPEN again.`,
                    relatedId: tourId,
                });
            }
        },
    });

    // Trigger escrow refund if escrow was held (prevent locked funds)
    if (userRole === 'TOUR_OPERATOR' && hasEscrowHeld) {
        try {
            const { refundEscrow } = await import('@/domain/finance/FinanceDomain');
            await refundEscrow({
                tourId,
                actorId: userId,
                actorRole: 'OPERATOR',
                reason: isForceMajeure ? 'FORCE_MAJEURE' : 'OPERATOR_CANCELLED',
                ipAddress: 'system-automated',
            });
        } catch (err) {
            console.error(`[cancelTour] Escrow refund failed for tour ${tourId}:`, err);
            // Cancellation succeeded but refund failed — alert OPS for manual resolution
        }
    }

    // Return actual DB status (not a misleading 'UNDER_REVIEW')
    const actualStatus = userRole === 'TOUR_OPERATOR' ? 'CANCELLED' : 'OPEN';
    return { status: actualStatus, escrowRefunded: userRole === 'TOUR_OPERATOR' && hasEscrowHeld };
}

// ══════════════════════════════════════════════════════════════════════
// PROPOSE MUTUAL CANCELLATION
// ══════════════════════════════════════════════════════════════════════

interface ProposeMutualCancelInput { tourId: string; userId: string; reason?: string; }

async function proposeMutualCancel(input: ProposeMutualCancelInput) {
    const { tourId, userId, reason } = input;

    const tour = await prisma.serviceRequest.findUnique({ where: { id: tourId } });
    if (!tour) throw new Error('NOT_FOUND');

    const isOperator = tour.operatorId === userId;
    const isGuide = tour.assignedGuideId === userId;
    if (!isOperator && !isGuide) throw new Error('FORBIDDEN');

    const cancellableStatuses = ['PUBLISHED', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS'];
    if (!cancellableStatuses.includes(tour.status)) throw new Error(`INVALID_STATE:${tour.status}`);
    if (tour.status === CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL) throw new Error('ALREADY_PENDING');

    const spamCheck = canProposeCancel((tour as any).cancellationProposalRejectedAt);
    if (!spamCheck.allowed) throw new Error(`COOLDOWN:${spamCheck.reason}`);

    const timing = getCancellationTiming(tour.startTime);

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: isOperator ? 'OPERATOR' : 'GUIDE',
        auditAction: 'MUTUAL_CANCEL_PROPOSED',
        auditBefore: { status: tour.status },
        auditAfter: () => ({ status: CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL, timing }),
        metadata: { timing, reason, initiatorRole: isOperator ? 'OPERATOR' : 'GUIDE' },
        atomicMutation: async (tx) => {
            return tx.serviceRequest.update({
                where: { id: tourId },
                data: {
                    status: CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL,
                    cancellationType: CancellationType.MUTUAL,
                    cancellationTiming: timing,
                    cancellationInitiator: userId,
                    cancellationNotes: reason || null,
                    updatedAt: new Date(),
                },
            });
        },
        notification: async () => {
            const otherPartyId = isOperator ? tour.assignedGuideId : tour.operatorId;
            const initiatorLabel = isOperator ? 'The operator' : 'The assigned guide';
            if (otherPartyId) {
                await createDomainNotification({
                    userId: otherPartyId, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: isOperator ? `/dashboard/guide/tours/${tourId}` : `/dashboard/operator/request/${tourId}`,
                    type: 'CANCELLATION_PROPOSED', title: 'Cancellation Request',
                    message: `${initiatorLabel} has proposed to cancel "${tour.title}". Please review and respond.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { timing, waitingFor: isOperator ? 'guide' : 'operator' };
}

// ══════════════════════════════════════════════════════════════════════
// REJECT MUTUAL CANCELLATION
// ══════════════════════════════════════════════════════════════════════

interface RejectMutualCancelInput { tourId: string; userId: string; }

async function rejectMutualCancel(input: RejectMutualCancelInput) {
    const { tourId, userId } = input;

    const tour = await prisma.serviceRequest.findUnique({ where: { id: tourId } });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.status !== CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL) throw new Error('NO_PENDING');
    if (tour.cancellationInitiator === userId) throw new Error('CANNOT_REJECT_OWN');

    const isOperator = tour.operatorId === userId;
    const isGuide = tour.assignedGuideId === userId;
    if (!isOperator && !isGuide) throw new Error('FORBIDDEN');

    const previousStatus = tour.assignedGuideId ? 'ASSIGNED' : 'PUBLISHED';

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: isOperator ? 'OPERATOR' : 'GUIDE',
        auditAction: 'MUTUAL_CANCEL_REJECTED',
        auditBefore: { status: CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL },
        auditAfter: () => ({ status: previousStatus }),
        metadata: { restoredStatus: previousStatus },
        atomicMutation: async (tx) => {
            return tx.serviceRequest.update({
                where: { id: tourId },
                data: {
                    status: previousStatus, cancellationType: null, cancellationTiming: null,
                    cancellationInitiator: null, cancellationNotes: null, updatedAt: new Date(),
                },
            });
        },
        notification: async () => {
            const rejecterLabel = isOperator ? 'The operator' : 'The assigned guide';
            if (tour.cancellationInitiator) {
                await createDomainNotification({
                    userId: tour.cancellationInitiator, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: isOperator ? `/dashboard/guide/tours/${tourId}` : `/dashboard/operator/request/${tourId}`,
                    type: 'CANCELLATION_REJECTED', title: 'Cancellation Rejected',
                    message: `${rejecterLabel} has rejected your cancellation request for "${tour.title}". The tour remains active.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { restoredStatus: previousStatus };
}

// ══════════════════════════════════════════════════════════════════════
// APPROVE GUIDE WITHDRAWAL (Operator Only)
// ══════════════════════════════════════════════════════════════════════

interface ApproveGuideWithdrawalInput { tourId: string; operatorId: string; }

async function approveGuideWithdrawal(input: ApproveGuideWithdrawalInput) {
    const { tourId, operatorId } = input;
    
    const tour = await prisma.serviceRequest.findUnique({ where: { id: tourId } });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== operatorId) throw new Error('FORBIDDEN');
    if (tour.status !== CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL) throw new Error('NO_PENDING');
    if (tour.cancellationInitiator !== tour.assignedGuideId) throw new Error('NOT_GUIDE_INITIATED');

    const timing = tour.cancellationTiming as CancellationTiming;
    // Guide is initiator, operator is not initiator. Tour was assigned.
    const trustImpact = getMutualTrustImpact(timing, false, true); 
    const oldGuideId = tour.assignedGuideId;

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'OPERATOR_APPROVED_WITHDRAWAL',
        auditBefore: { status: tour.status, assignedGuideId: oldGuideId },
        auditAfter: () => ({ status: 'OPEN', assignedGuideId: null }),
        metadata: { timing, trustImpact },
        atomicMutation: async (tx) => {
            await tx.serviceRequest.update({
                where: { id: tourId },
                data: {
                    status: 'OPEN',
                    assignedGuideId: null,
                    cancellationType: null,
                    cancellationTiming: null,
                    cancellationInitiator: null,
                    cancellationNotes: null,
                    updatedAt: new Date()
                }
            });

            // Trust impact for guide if late (-1)
            if (trustImpact.guideDelta !== 0 && oldGuideId) {
                const guide = await tx.user.findUnique({ where: { id: oldGuideId }, select: { trustScore: true } });
                if (guide) {
                    const newScore = Math.max(0, Math.min(100, (guide.trustScore || 0) + trustImpact.guideDelta));
                    await tx.user.update({ where: { id: oldGuideId }, data: { trustScore: newScore } });
                    await tx.trustEvent.create({
                        data: {
                            userId: oldGuideId,
                            changeValue: trustImpact.guideDelta,
                            newScore,
                            type: 'MUTUAL_CANCEL_LATE_INITIATOR',
                            description: `Initiated late mutual withdrawal: ${tour.title}`,
                            relatedRequestId: tourId
                        }
                    });
                }
            }

            return { withdrawn: true };
        },
        notification: async () => {
             if (oldGuideId) {
                await createDomainNotification({
                    userId: oldGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: '/dashboard/guide/tours',
                    type: 'TOUR_CANCELLED', title: 'Withdrawal Approved',
                    message: `Operator approved your withdrawal request for "${tour.title}".`,
                    relatedId: tourId
                });
             }
        }
    });

    return { success: true };
}

// ══════════════════════════════════════════════════════════════════════
// CLAIM FORCE CANCELLATION
// ══════════════════════════════════════════════════════════════════════

interface ClaimForceCancelInput {
    tourId: string; userId: string;
    reason: string; evidenceUrl: string;
}

async function claimForceCancel(input: ClaimForceCancelInput) {
    const { tourId, userId, reason, evidenceUrl } = input;

    const tour = await prisma.serviceRequest.findUnique({ where: { id: tourId } });
    if (!tour) throw new Error('NOT_FOUND');

    const isOperator = tour.operatorId === userId;
    const isGuide = tour.assignedGuideId === userId;
    if (!isOperator && !isGuide) throw new Error('FORBIDDEN');

    const cancellableStatuses = ['PUBLISHED', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS'];
    if (!cancellableStatuses.includes(tour.status)) throw new Error(`INVALID_STATE:${tour.status}`);
    if (tour.status === CANCELLATION_STATUSES.FORCE_CANCEL_PENDING_REVIEW) throw new Error('ALREADY_PENDING');

    const forceCancelCheck = canForceCancel(tour.startTime, tour.status);
    if (!forceCancelCheck.allowed) throw new Error(`BLOCKED:${forceCancelCheck.reason}`);

    const timing = getCancellationTiming(tour.startTime);

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: isOperator ? 'OPERATOR' : 'GUIDE',
        auditAction: 'FORCE_CANCEL_CLAIMED',
        auditBefore: { status: tour.status },
        auditAfter: () => ({ status: CANCELLATION_STATUSES.FORCE_CANCEL_PENDING_REVIEW, timing }),
        metadata: { reason, evidenceUrl, timing, claimantRole: isOperator ? 'OPERATOR' : 'GUIDE' },
        atomicMutation: async (tx) => {
            return tx.serviceRequest.update({
                where: { id: tourId },
                data: {
                    status: CANCELLATION_STATUSES.FORCE_CANCEL_PENDING_REVIEW,
                    cancellationType: CancellationType.FORCE,
                    cancellationTiming: timing,
                    cancellationReason: reason,
                    cancellationInitiator: userId,
                    cancellationEvidence: evidenceUrl,
                    updatedAt: new Date(),
                },
            });
        },
        notification: async () => {
            const otherPartyId = isOperator ? tour.assignedGuideId : tour.operatorId;
            const claimantLabel = isOperator ? 'The operator' : 'The assigned guide';
            if (otherPartyId) {
                await createDomainNotification({
                    userId: otherPartyId, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: `/dashboard/operator/tours/${tourId}`,
                    type: 'FORCE_CANCEL_CLAIMED', title: 'Force Cancellation Claimed',
                    message: `${claimantLabel} has claimed force cancellation for "${tour.title}". Reason: ${reason}. This is under review by Lunavia Ops.`,
                    relatedId: tourId,
                });
            }

            // Notify OPS
            const opsUsers = await prisma.user.findMany({
                where: { role: { name: { in: ['SUPER_ADMIN', 'OPS'] } } },
                select: { id: true },
            });
            for (const ops of opsUsers) {
                await createDomainNotification({
                    userId: ops.id, domain: NotificationDomain.INCIDENT,
                    targetUrl: `/dashboard/admin/governance`,
                    type: 'FORCE_CANCEL_REVIEW_NEEDED', title: '🚨 Force Cancel Review Required',
                    message: `Force cancellation claimed for "${tour.title}". Reason: ${reason}. Please review.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return { reason, timing, status: CANCELLATION_STATUSES.FORCE_CANCEL_PENDING_REVIEW };
}

// ══════════════════════════════════════════════════════════════════════
// FORCE RESOLVE DISPUTE (Admin Only)
// ══════════════════════════════════════════════════════════════════════

interface ForceResolveDisputeInput {
    tourId: string; adminId: string;
    resolution: 'COMPLETE_TOUR' | 'CANCEL_TOUR';
    notes: string;
}

async function forceResolveDispute(input: ForceResolveDisputeInput) {
    const { tourId, adminId, resolution, notes } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        include: { escrowTransaction: true },
    });
    if (!tour) throw new Error('NOT_FOUND');
    
    // We only resolve tours that are actively DISPUTED 
    if (tour.status !== 'DISPUTED') throw new Error(`INVALID_STATE:${tour.status}`);

    const hasEscrowHeld = tour.escrowStatus === 'HELD' && tour.escrowTransaction;

    let targetStatus = 'CLOSED';
    if (resolution === 'CANCEL_TOUR') targetStatus = 'CANCELLED';
    
    // Get Admin User for audit
    const adminUser = await prisma.user.findUnique({ where: { id: adminId }, select: { email: true } });
    const adminName = adminUser?.email?.split('@')[0] || 'Admin';

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: adminId,
        actorRole: 'ADMIN',
        auditAction: 'ADMIN_FORCE_RESOLVE_DISPUTE',
        auditBefore: { status: 'DISPUTED' },
        auditAfter: () => ({ status: targetStatus, resolution }),
        metadata: { resolution, notes, adminId },
        atomicMutation: async (tx) => {
            // 1. Update Tour Status
            await tx.serviceRequest.update({
                where: { id: tourId },
                data: {
                    status: targetStatus,
                    operatorClosedAt: new Date(),
                    closeReason: `ADMIN_${resolution}`,
                    closeNotes: `Admin Resolution: ${notes}`,
                },
            });

            // 2. Close all OPEN incidents for this tour
            await tx.incident.updateMany({
                where: { requestId: tourId, status: 'OPEN' },
                data: {
                    status: 'RESOLVED',
                    resolution: `Admin forced resolution: ${resolution}`,
                    internalNotes: `Resolver: ${adminId}`
                }
            });
            await tx.incident.updateMany({
                where: { requestId: tourId, status: 'INVESTIGATING' },
                data: {
                    status: 'RESOLVED',
                    resolution: `Admin forced resolution: ${resolution}`,
                    internalNotes: `Resolver: ${adminId}`
                }
            });

            return { resolved: true, targetStatus };
        },
        notification: async () => {
            // Notify both parties
            if (tour.operatorId) {
                await createDomainNotification({
                    userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/operator/tours/${tourId}`,
                    type: 'SYSTEM_ALERT', title: 'Dispute Resolved',
                    message: `Admin has resolved the dispute for "${tour.title}". Result: ${resolution === 'COMPLETE_TOUR' ? 'Tour Completed & Paid' : 'Tour Cancelled & Refunded'}.`,
                    relatedId: tourId,
                });
            }
            if (tour.assignedGuideId) {
                await createDomainNotification({
                    userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tours/${tourId}`,
                    type: 'SYSTEM_ALERT', title: 'Dispute Resolved',
                    message: `Admin has resolved the dispute for "${tour.title}". Result: ${resolution === 'COMPLETE_TOUR' ? 'Tour Completed & Paid' : 'Tour Cancelled & Refunded'}.`,
                    relatedId: tourId,
                });
                
                // If the admin forcefully completes it, it restores the guide's availability
                if (resolution === 'COMPLETE_TOUR') {
                     await prisma.user.update({
                        where: { id: tour.assignedGuideId },
                        data: { isAvailable: true } as any,
                    }).catch(() => {});
                }
            }
        },
    });

    // 3. Handle Escrow 
    if (hasEscrowHeld) {
        if (resolution === 'COMPLETE_TOUR') {
            // Pay the guide
            try {
                const { releaseEscrow } = await import('@/domain/finance/FinanceDomain');
                await releaseEscrow({
                    tourId,
                    actorId: adminId,
                    actorRole: 'ADMIN',
                    notes: `Admin Force Release: ${notes}`,
                    ipAddress: 'admin-action',
                });
            } catch (err) {
                console.error(`[forceResolveDispute] Escrow release failed for tour ${tourId}:`, err);
            }
        } else if (resolution === 'CANCEL_TOUR') {
            // Refund the operator
            try {
                const { refundEscrow } = await import('@/domain/finance/FinanceDomain');
                await refundEscrow({
                    tourId,
                    actorId: adminId,
                    actorRole: 'ADMIN',
                    reason: 'ADMIN_DECISION',
                    ipAddress: 'admin-action',
                });
            } catch (err) {
                console.error(`[forceResolveDispute] Escrow refund failed for tour ${tourId}:`, err);
            }
        }
    }

    return { status: targetStatus, resolution };
}

// ══════════════════════════════════════════════════════════════════════
// CREATE SERVICE REQUEST
// ══════════════════════════════════════════════════════════════════════

interface CreateServiceRequestInput {
    operatorId: string;
    data: {
        title?: string; description?: string; location?: string; province?: string;
        startTime?: string; endTime?: string; language?: string; visibility?: string;
        itinerary?: string; inclusion?: string; exclusion?: string; eligibilityNotes?: string;
        rolesNeeded?: any; rolesInfo?: string; totalPayout?: number; currency?: string;
        paymentMethod?: string; groupSize?: number; category?: string; market?: string;
    };
}

async function createServiceRequest(input: CreateServiceRequestInput) {
    const { operatorId, data: body } = input;

    const request = await prisma.serviceRequest.create({
        data: {
            operatorId,
            title: body.title?.trim() || 'Untitled Tour',
            description: body.description?.trim() || null,
            location: body.location?.trim() || '',
            province: body.province || null,
            startTime: body.startTime ? new Date(body.startTime) : new Date(),
            endTime: body.endTime ? new Date(body.endTime) : new Date(),
            language: body.language || 'EN',
            visibility: body.visibility || 'PUBLIC',
            itinerary: body.itinerary?.trim() || null,
            inclusion: body.inclusion?.trim() || null,
            exclusion: body.exclusion?.trim() || null,
            eligibilityNotes: body.eligibilityNotes?.trim() || null,
            rolesNeeded: body.rolesNeeded ? JSON.stringify(body.rolesNeeded) : null,
            rolesInfo: body.rolesInfo?.trim() || null,
            totalPayout: body.totalPayout ? Number(body.totalPayout) : null,
            currency: body.currency || 'VND',
            paymentMethod: body.paymentMethod || 'CASH',
            groupSize: body.groupSize ? Number(body.groupSize) : null,
            category: body.category || null,
            market: (body.market as any) || 'DOMESTIC',
            status: 'DRAFT',
        },
    });

    return { request };
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE SERVICE REQUEST (Metadata — PATCH)
// ══════════════════════════════════════════════════════════════════════

interface UpdateServiceRequestInput {
    tourId: string; userId: string;
    updateData: any;
    changedFields: string[];
    createChangeNotice: boolean;
    affectedGuideIds: string[];
    existingTitle: string;
    assignedGuideId: string | null;
}

async function updateServiceRequest(input: UpdateServiceRequestInput) {
    const { tourId, userId, updateData, changedFields, createChangeNotice, affectedGuideIds, existingTitle, assignedGuideId } = input;

    // Change notice notifications (if critical fields changed on published tour)
    if (createChangeNotice) {
        for (const guideId of affectedGuideIds) {
            await createDomainNotification({
                userId: guideId, domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/guide/available`,
                type: 'TOUR_CHANGED', title: 'Tour Changed',
                message: `The tour "${existingTitle}" has been modified. Please review the changes and your application.`,
                relatedId: tourId,
            });
        }

        const { executeSimpleMutation: execMutation } = await import('@/domain/governance/executeSimpleMutation');
        await execMutation({
            entityName: 'ServiceRequest',
            entityId: tourId,
            actorId: userId,
            actorRole: 'OPERATOR',
            auditAction: 'TOUR_UPDATED',
            metadata: { tourTitle: existingTitle, changedFields, affectedGuides: affectedGuideIds.length },
            atomicMutation: async () => ({ ok: true }),
        });
    }

    // Notify assigned guide of ANY changes
    if (changedFields.length > 0 && assignedGuideId) {
        updateData.hasChanges = true;
        updateData.lastChangedAt = new Date();

        await createDomainNotification({
            userId: assignedGuideId, domain: NotificationDomain.SYSTEM,
            targetUrl: `/dashboard/guide/assigned`,
            type: 'TOUR_CHANGED', title: 'Tour Updated',
            message: `The tour "${existingTitle}" has been updated. Changed: ${changedFields.join(', ')}. Please review.`,
            relatedId: tourId,
        });
    }

    const updated = await prisma.serviceRequest.update({
        where: { id: tourId },
        data: updateData,
    });

    return { request: updated, createChangeNotice };
}


// ══════════════════════════════════════════════════════════════════════
//  EXECUTION AUTHORITY — Only assigned + verified guides can execute
// ══════════════════════════════════════════════════════════════════════

/**
 * Role-based execution permissions.
 * LEAD_GUIDE: full execution control
 * ASSISTANT_GUIDE: check-in segments, add notes, report issues
 * INTERN_GUIDE: view only
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
    LEAD_GUIDE: ['START_PICKUP', 'CONFIRM_DEPARTURE', 'START_TOUR', 'CHECKIN_SEGMENT', 'COMPLETE_TOUR', 'REPORT_INCIDENT', 'ADD_NOTES'],
    ASSISTANT_GUIDE: ['CHECKIN_SEGMENT', 'ADD_NOTES', 'REPORT_INCIDENT'],
    INTERN_GUIDE: ['VIEW_EXECUTION', 'VIEW_TIMELINE'],
    DRIVER: ['CONFIRM_PICKUP_ARRIVAL', 'CONFIRM_TRANSPORT_MILESTONE', 'ADD_NOTES'],
    PHOTOGRAPHER: ['ADD_NOTES', 'VIEW_EXECUTION', 'VIEW_TIMELINE'],
    BOAT_CREW: ['CONFIRM_TRANSPORT_MILESTONE', 'ADD_NOTES', 'VIEW_EXECUTION'],
};

/**
 * Assert that a guide is authorized to execute actions on a tour.
 * Checks: 1) Guide is assigned, 2) Guide is verified (selfie check), 3) Role permits action.
 * Throws GUIDE_NOT_VERIFIED if verification is missing for execution actions.
 */
async function assertExecutionAuthority(
    tourId: string,
    guideId: string,
    requiredAction?: string
): Promise<{ authorized: boolean; role: string; verified: boolean }> {
    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, assignedGuideId: true, status: true },
    });

    if (!tour) throw new Error('NOT_FOUND');

    // Check 1: Is this guide assigned to the tour?
    const isMainGuide = tour.assignedGuideId === guideId;
    const teamAssignment = await (prisma as any).tourTeamMember.findFirst({
        where: { tourId, userId: guideId, status: 'ACTIVE' },
    });

    if (!isMainGuide && !teamAssignment) {
        throw new Error('EXECUTION_DENIED: Not assigned to this tour');
    }

    const role = teamAssignment?.role || (isMainGuide ? 'LEAD_GUIDE' : 'ASSISTANT_GUIDE');

    // Check 2: Is identity verified?
    const verification = await (prisma as any).tourTeamVerification.findUnique({
        where: { tourId_guideId: { tourId, guideId } },
    });

    const verified = !!verification;

    // ENFORCEMENT: Execution actions are LOCKED until verification is complete.
    // View-only actions (VIEW_EXECUTION, VIEW_TIMELINE) are exempt.
    const VIEW_ONLY_ACTIONS = ['VIEW_EXECUTION', 'VIEW_TIMELINE'];
    if (requiredAction && !VIEW_ONLY_ACTIONS.includes(requiredAction) && !verified) {
        throw new Error('GUIDE_NOT_VERIFIED');
    }

    // Check 3: Does the role have permission for the requested action?
    if (requiredAction) {
        const permissions = ROLE_PERMISSIONS[role] || [];
        if (!permissions.includes(requiredAction)) {
            throw new Error(`EXECUTION_DENIED: ${role} cannot perform ${requiredAction}`);
        }
    }

    return { authorized: true, role, verified };
}

/**
 * Verify guide identity via selfie before execution.
 * Execution actions are locked until this is completed.
 */
async function verifyGuideIdentity(input: {
    tourId: string;
    guideId: string;
    selfieUrl: string;
}) {
    const { tourId, guideId, selfieUrl } = input;

    // Ensure guide is assigned to tour
    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, assignedGuideId: true, title: true },
    });
    if (!tour) throw new Error('NOT_FOUND');

    const isMainGuide = tour.assignedGuideId === guideId;
    const teamAssignment = await (prisma as any).tourTeamMember.findFirst({
        where: { tourId, userId: guideId, status: 'ACTIVE' },
    });
    if (!isMainGuide && !teamAssignment) throw new Error('NOT_ASSIGNED');

    const role = teamAssignment?.role || 'LEAD_GUIDE';

    // Check if already verified
    const existing = await (prisma as any).tourTeamVerification.findUnique({
        where: { tourId_guideId: { tourId, guideId } },
    });
    if (existing) return { alreadyVerified: true, verification: existing };

    // Create verification record
    const verification = await (prisma as any).tourTeamVerification.create({
        data: { tourId, guideId, selfieUrl },
    });

    // Timeline event
    await (prisma as any).tourTimelineEvent.create({
        data: {
            tourId,
            actorId: guideId,
            actorRole: 'GUIDE',
            eventType: 'GUIDE_IDENTITY_VERIFIED',
            title: 'Guide Identity Verified',
            description: `${role === 'LEAD_GUIDE' ? 'Lead guide' : role === 'ASSISTANT_GUIDE' ? 'Assistant guide' : 'Intern guide'} completed identity verification.`,
            metadata: JSON.stringify({ role, verificationId: verification.id }),
        },
    });

    return { alreadyVerified: false, verification };
}

/**
 * Get guide's execution permissions for a tour.
 */
function getGuideExecutionPermissions(role: string): string[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Assign a guide to the tour team with a specific role.
 */
async function assignGuideToTeam(input: {
    tourId: string;
    guideId: string;
    role: string; // LEAD_GUIDE | ASSISTANT_GUIDE | INTERN_GUIDE
    operatorId: string;
}) {
    const { tourId, guideId, role, operatorId } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, operatorId: true, title: true },
    });
    if (!tour) throw new Error('NOT_FOUND');
    if (tour.operatorId !== operatorId) throw new Error('FORBIDDEN');

    const assignment = await (prisma as any).tourTeamMember.upsert({
        where: { tourId_userId: { tourId, userId: guideId } },
        create: { tourId, userId: guideId, role },
        update: { role, status: 'ACTIVE', removedAt: null },
    });

    // Timeline event
    await (prisma as any).tourTimelineEvent.create({
        data: {
            tourId,
            actorId: operatorId,
            actorRole: 'OPERATOR',
            eventType: 'TEAM_MEMBER_ASSIGNED',
            title: `${role.replace(/_/g, ' ')} Assigned`,
            description: `Guide assigned to tour team as ${role.replace(/_/g, ' ').toLowerCase()}.`,
            metadata: JSON.stringify({ guideId, role }),
        },
    });

    return assignment;
}

// ══════════════════════════════════════════════════════════════════════
//  Exported namespace
// ══════════════════════════════════════════════════════════════════════

export const ExecutionDomain = {
    startTour,
    guideCheckIn,
    returnTour,
    confirmTour,
    reopenTour,
    reassignGuide,
    cancelTour,
    proposeMutualCancel,
    rejectMutualCancel,
    approveGuideWithdrawal,
    claimForceCancel,
    forceResolveDispute,
    createServiceRequest,
    updateServiceRequest,
    // Tour Operations Management v2
    assertExecutionAuthority,
    verifyGuideIdentity,
    getGuideExecutionPermissions,
    assignGuideToTeam,
    ROLE_PERMISSIONS,
};
