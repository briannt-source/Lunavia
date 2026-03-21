import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * CheckinDomain — Segment Check-In & Tour Side-Effect Mutations
 *
 * Handles segment check-in creation, updates, audit, notifications,
 * bonus creation, guide assignment audit, document upload audit, and boost audit.
 */

import { AUDIT_ACTIONS, ENTITY_TYPES } from '@/domain/governance/AuditService';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

// ── Create Segment Check-In ────────────────────────────────────────

interface CreateCheckinInput {
    segmentId: string; tourId: string; guideId: string;
    status: string; location?: any; notes?: string;
    photoUrl?: string;
    operatorId: string;
}

async function createSegmentCheckin(input: CreateCheckinInput) {
    const now = new Date();

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.SEGMENT_CHECKIN,
        actorId: input.guideId,
        actorRole: 'TOUR_GUIDE',
        auditAction: AUDIT_ACTIONS.SEGMENT_CHECKIN_CREATED,
        auditAfter: (r: any) => ({ checkinId: r.checkIn.id }),
        metadata: { segmentId: input.segmentId, tourId: input.tourId },
        atomicMutation: async (tx) => {
            const checkIn = await tx.segmentCheckIn.create({
                data: {
                    segmentId: input.segmentId,
                    guideId: input.guideId,
                    status: input.status || 'ARRIVED',
                    checkInTime: now,
                    note: input.notes || null,
                    photoUrl: input.photoUrl || null,
                },
            });

            return { checkIn };
        },
        notification: async () => {
            const isSkipped = input.status === 'SKIPPED';
            const isCompleted = input.status === 'COMPLETED';
            const title = isSkipped ? '⚠ Segment Skipped' :
                isCompleted ? 'Segment Completed' :
                    'Guide Checked In to Segment';
            const message = isSkipped ? `Guide skipped a segment during your tour.` :
                isCompleted ? `Guide completed a segment for your tour.` :
                    `Guide checked in to a segment for your tour.`;

            await createDomainNotification({
                userId: input.operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours/${input.tourId}/live`,
                type: isSkipped ? 'SEGMENT_SKIPPED' : 'SEGMENT_CHECKIN',
                title,
                message,
                relatedId: input.tourId,
            });
        },
    });
}

// ── Update Segment Check-In ────────────────────────────────────────

interface UpdateCheckinInput {
    checkinId: string; tourId: string; guideId: string;
    data: any; operatorId: string;
}

async function updateSegmentCheckin(input: UpdateCheckinInput) {
    return executeSimpleMutation({
        entityName: ENTITY_TYPES.SEGMENT_CHECKIN,
        entityId: input.checkinId,
        actorId: input.guideId,
        actorRole: 'TOUR_GUIDE',
        auditAction: AUDIT_ACTIONS.SEGMENT_CHECKIN_EDITED,
        metadata: { tourId: input.tourId },
        atomicMutation: async (tx) => {
            const updated = await tx.segmentCheckIn.update({
                where: { id: input.checkinId },
                data: input.data,
            });

            return { updated };
        },
        notification: async () => {
            await createDomainNotification({
                userId: input.operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/request/${input.tourId}`,
                type: 'SEGMENT_CHECKIN_UPDATED',
                title: 'Segment Check-In Updated',
                message: `A segment check-in was updated for your tour.`,
                relatedId: input.tourId,
            });
        },
    });
}

// ── Create Tour Event (Bonus) ──────────────────────────────────────

interface CreateBonusInput {
    tourId: string; actorId: string; amount: number;
    reason: string; guideId: string; originalPayout: number | null; tourTitle: string;
}

async function createBonus(input: CreateBonusInput) {
    return executeSimpleMutation({
        entityName: 'TourEvent',
        entityId: input.tourId,
        actorId: input.actorId,
        actorRole: 'OPERATOR',
        auditAction: 'BONUS_ADDED',
        auditAfter: () => ({ amount: input.amount, reason: input.reason, guideId: input.guideId }),
        metadata: { amount: input.amount, reason: input.reason, guideId: input.guideId, tourTitle: input.tourTitle },
        atomicMutation: async (tx) => {
            await tx.tourEvent.create({
                data: {
                    tourId: input.tourId,
                    actorId: input.actorId,
                    actorRole: 'OPERATOR',
                    eventType: 'BONUS_ADDED',
                    metadata: JSON.stringify({
                        amount: input.amount,
                        reason: input.reason,
                        guideId: input.guideId,
                        originalPayout: input.originalPayout,
                    }),
                },
            });

            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: input.guideId,
                domain: NotificationDomain.REVENUE,
                targetUrl: `/dashboard/guide/earnings`,
                type: 'BONUS_RECEIVED',
                title: 'Bonus Added!',
                message: `You received a bonus of ${input.amount.toLocaleString()} VND for tour "${input.tourTitle}". ${input.reason ? `Reason: ${input.reason}` : ''}`,
                relatedId: input.tourId,
            });
        },
    });
}

// ── Log Assign Side Effects ────────────────────────────────────────

interface LogAssignInput {
    tourId: string; actorId: string; guideId: string;
    tourTitle?: string; autoCancelledCount?: number;
}

async function logAssignSideEffects(input: LogAssignInput) {
    const { createTourEvent, TOUR_EVENT_TYPES, ACTOR_ROLES } = await import('@/lib/tour-events');

    return executeSimpleMutation({
        entityName: 'Tour',
        entityId: input.tourId,
        actorId: input.actorId,
        actorRole: 'OPERATOR',
        auditAction: 'GUIDE_ASSIGNED',
        metadata: { guideId: input.guideId, tourTitle: input.tourTitle, autoCancelledApplications: input.autoCancelledCount },
        atomicMutation: async () => {
            return { ok: true };
        },
        notification: async () => {
            await createTourEvent({
                tourId: input.tourId,
                actorId: input.actorId,
                actorRole: ACTOR_ROLES.OPERATOR,
                eventType: TOUR_EVENT_TYPES.GUIDE_ASSIGNED,
                metadata: { guideId: input.guideId },
            });

            await createDomainNotification({
                userId: input.guideId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/guide/tours/${input.tourId}`,
                type: 'TOUR_ASSIGNED',
                title: 'You have been assigned to a tour!',
                message: `An operator has assigned you to the tour "${input.tourTitle || 'New Tour'}".`,
                relatedId: input.tourId,
            });
        },
    });
}

// ── Log Document Upload Side Effects ───────────────────────────────

interface LogDocumentUploadInput {
    tourId: string; actorId: string; actorRole: string;
    documentId: string; tourTitle: string; assignedGuideId?: string | null;
}

async function logDocumentUpload(input: LogDocumentUploadInput) {
    return executeSimpleMutation({
        entityName: 'Tour',
        entityId: input.tourId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        auditAction: 'TOUR_DOCUMENT_UPLOADED',
        metadata: { documentId: input.documentId, tourTitle: input.tourTitle },
        atomicMutation: async () => {
            return { ok: true };
        },
        notification: async () => {
            if (input.assignedGuideId && input.assignedGuideId !== input.actorId) {
                await createDomainNotification({
                    userId: input.assignedGuideId,
                    domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tour/${input.tourId}`,
                    type: 'TOUR_DOCUMENT_ADDED',
                    title: 'New Tour Document',
                    message: `A new document was uploaded for "${input.tourTitle}".`,
                    relatedId: input.tourId,
                });
            }
        },
    });
}

// ── Boost Audit ────────────────────────────────────────────────────

interface LogBoostInput {
    actorId: string; actorRole: string; tourId: string; tourTitle: string;
    budgetUsed: number; remainingBudget: number;
}

async function logBoost(input: LogBoostInput) {
    return executeSimpleMutation({
        entityName: ENTITY_TYPES.TOUR_SEGMENT,
        entityId: input.tourId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        auditAction: AUDIT_ACTIONS.BOOST_PURCHASED,
        metadata: {
            tourTitle: input.tourTitle,
            budgetUsed: input.budgetUsed,
            remainingBudget: input.remainingBudget,
        },
        atomicMutation: async () => {
            return { ok: true };
        },
    });
}

export const CheckinDomain = {
    createSegmentCheckin,
    updateSegmentCheckin,
    createBonus,
    logAssignSideEffects,
    logDocumentUpload,
    logBoost,
};
