/**
 * GuideReplacementDomain — Guide Replacement Control
 *
 * Core principle: Platform is an intermediary.
 * System NEVER auto-assigns guides. Operator always decides.
 *
 * Flow:
 *   Guide cannot attend → requests replacement → Operator decides
 *   Operator: approve (tour → OPEN) | reject (guide stays) | cancel tour
 *
 * Timing rules:
 *   >3h before start → normal replacement
 *   <3h before start → emergency replacement → OPS alert
 *
 * Abandonment:
 *   If guide fails to show without requesting replacement → trust penalty
 */

import { prisma } from '@/lib/prisma';
import { executeGovernedMutation } from '@/domain/governance/executeGovernedMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';

// ── Constants ─────────────────────────────────────────────────────────

const EMERGENCY_THRESHOLD_HOURS = 3;

const REPLACEMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

const TIMELINE_EVENTS = {
    REPLACEMENT_REQUESTED: 'GUIDE_REPLACEMENT_REQUESTED',
    REPLACED: 'GUIDE_REPLACED',
    ABANDONED: 'GUIDE_ABANDONED_TOUR',
    EMERGENCY_REPLACEMENT: 'EMERGENCY_REPLACEMENT',
} as const;

// ── Guide Requests Replacement ────────────────────────────────────────

interface RequestReplacementInput {
    tourId: string;
    guideId: string;
    reason: string;
    suggestedReplacementId?: string;
}

async function requestReplacement(input: RequestReplacementInput) {
    const { tourId, guideId, reason, suggestedReplacementId } = input;

    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, title: true, operatorId: true, assignedGuideId: true, status: true, startTime: true },
    });

    if (!tour) throw new Error('NOT_FOUND');
    if (tour.assignedGuideId !== guideId) throw new Error('NOT_ASSIGNED');
    if (!['ASSIGNED', 'READY'].includes(tour.status)) throw new Error('INVALID_STATE');

    // Check for existing pending request
    const existing = await (prisma as any).guideReplacementRequest.findFirst({
        where: { tourId, guideId, status: REPLACEMENT_STATUS.PENDING },
    });
    if (existing) throw new Error('REPLACEMENT_ALREADY_PENDING');

    // Determine if this is an emergency (<3h before start)
    const hoursUntilStart = (tour.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const isEmergency = hoursUntilStart < EMERGENCY_THRESHOLD_HOURS;

    const request = await executeGovernedMutation({
        entityName: 'GuideReplacementRequest',
        entityId: tourId,
        actorId: guideId,
        actorRole: 'GUIDE',
        auditAction: 'GUIDE_REQUEST_REPLACEMENT',
        auditBefore: { assignedGuideId: guideId },
        auditAfter: () => ({ status: 'PENDING', isEmergency }),
        metadata: { reason, suggestedReplacementId, isEmergency, hoursUntilStart: Math.round(hoursUntilStart) },
        atomicMutation: async (tx) => {
            // Create replacement request
            const req = await (tx as any).guideReplacementRequest.create({
                data: {
                    tourId,
                    guideId,
                    reason,
                    suggestedReplacementId: suggestedReplacementId || null,
                    isEmergency,
                },
            });

            // Create timeline event
            await (tx as any).tourTimelineEvent.create({
                data: {
                    tourId,
                    actorId: guideId,
                    actorRole: 'GUIDE',
                    eventType: isEmergency ? TIMELINE_EVENTS.EMERGENCY_REPLACEMENT : TIMELINE_EVENTS.REPLACEMENT_REQUESTED,
                    title: isEmergency ? 'Emergency Replacement Requested' : 'Replacement Requested',
                    description: `Guide requested replacement: ${reason}`,
                    metadata: JSON.stringify({ requestId: req.id, isEmergency, suggestedReplacementId }),
                },
            });

            return req;
        },
        notification: async () => {
            // Notify operator
            await createDomainNotification({
                userId: tour.operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours/${tourId}`,
                type: isEmergency ? 'EMERGENCY_REPLACEMENT_REQUEST' : 'REPLACEMENT_REQUEST',
                title: isEmergency ? '🚨 Emergency Replacement Request' : 'Guide Replacement Request',
                message: `Guide requesting replacement for "${tour.title}": ${reason}`,
                relatedId: tourId,
            });

            // If emergency, also create operational alert
            if (isEmergency) {
                await (prisma as any).operationalAlert.create({
                    data: {
                        tourId,
                        alertType: 'EMERGENCY_REPLACEMENT',
                        severity: 'CRITICAL',
                        message: `Emergency replacement request for "${tour.title}" — ${Math.round(hoursUntilStart)}h before start.`,
                        metadata: { guideId, reason, hoursUntilStart: Math.round(hoursUntilStart) },
                    },
                });
            }
        },
    });

    return { request, isEmergency };
}

// ── Operator Approves Replacement ─────────────────────────────────────

interface OperatorDecisionInput {
    requestId: string;
    operatorId: string;
    decision: 'APPROVE_REPLACEMENT' | 'REJECT' | 'CANCEL_TOUR';
    note?: string;
}

async function handleOperatorDecision(input: OperatorDecisionInput) {
    const { requestId, operatorId, decision, note } = input;

    const request = await (prisma as any).guideReplacementRequest.findUnique({
        where: { id: requestId },
        include: { tour: { select: { id: true, title: true, operatorId: true, assignedGuideId: true, status: true } } },
    });

    if (!request) throw new Error('NOT_FOUND');
    if (request.tour.operatorId !== operatorId) throw new Error('FORBIDDEN');
    if (request.status !== REPLACEMENT_STATUS.PENDING) throw new Error('ALREADY_DECIDED');

    if (decision === 'APPROVE_REPLACEMENT') {
        return approveReplacement(request, operatorId, note);
    } else if (decision === 'REJECT') {
        return rejectReplacement(request, operatorId, note);
    } else if (decision === 'CANCEL_TOUR') {
        return cancelFromReplacement(request, operatorId, note);
    }

    throw new Error('INVALID_DECISION');
}

async function approveReplacement(request: any, operatorId: string, note?: string) {
    const tourId = request.tourId;
    const guideId = request.guideId;
    const tourTitle = request.tour.title;

    return executeGovernedMutation({
        entityName: 'GuideReplacementRequest',
        entityId: request.id,
        actorId: operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'OPERATOR_APPROVE_REPLACEMENT',
        auditBefore: { status: 'PENDING' },
        auditAfter: () => ({ status: 'APPROVED', tourStatus: 'OPEN' }),
        metadata: { tourId, guideId, note },
        atomicMutation: async (tx) => {
            // Update replacement request
            await (tx as any).guideReplacementRequest.update({
                where: { id: request.id },
                data: { status: REPLACEMENT_STATUS.APPROVED, operatorDecision: 'APPROVE_REPLACEMENT', operatorNote: note || null, decidedAt: new Date() },
            });

            // Remove guide assignment, tour → OPEN
            await tx.serviceRequest.update({
                where: { id: tourId },
                data: { assignedGuideId: null, status: 'OPEN' },
            });

            // Mark TourTeamMember as REPLACED if exists
            try {
                await (tx as any).tourTeamMember.updateMany({
                    where: { tourId, userId: guideId, status: 'ACTIVE' },
                    data: { status: 'REPLACED', removedAt: new Date() },
                });
            } catch { /* team member record may not exist yet */ }

            // Timeline event
            await (tx as any).tourTimelineEvent.create({
                data: {
                    tourId,
                    actorId: operatorId,
                    actorRole: 'OPERATOR',
                    eventType: TIMELINE_EVENTS.REPLACED,
                    title: 'Guide Replaced',
                    description: `Operator approved guide replacement. Tour is now OPEN for new assignment.`,
                    metadata: JSON.stringify({ replacedGuideId: guideId, note }),
                },
            });

            return { status: 'APPROVED', tourStatus: 'OPEN' };
        },
        notification: async () => {
            // Notify replaced guide
            await createDomainNotification({
                userId: guideId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard/guide/tours',
                type: 'REPLACEMENT_APPROVED',
                title: 'Replacement Approved',
                message: `Your replacement request for "${tourTitle}" was approved. You are no longer assigned.`,
                relatedId: tourId,
            });
        },
    });
}

async function rejectReplacement(request: any, operatorId: string, note?: string) {
    return executeGovernedMutation({
        entityName: 'GuideReplacementRequest',
        entityId: request.id,
        actorId: operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'OPERATOR_REJECT_REPLACEMENT',
        auditBefore: { status: 'PENDING' },
        auditAfter: () => ({ status: 'REJECTED' }),
        metadata: { tourId: request.tourId, guideId: request.guideId, note },
        atomicMutation: async (tx) => {
            await (tx as any).guideReplacementRequest.update({
                where: { id: request.id },
                data: { status: REPLACEMENT_STATUS.REJECTED, operatorDecision: 'REJECT', operatorNote: note || null, decidedAt: new Date() },
            });

            // Timeline event
            await (tx as any).tourTimelineEvent.create({
                data: {
                    tourId: request.tourId,
                    actorId: operatorId,
                    actorRole: 'OPERATOR',
                    eventType: 'REPLACEMENT_REJECTED',
                    title: 'Replacement Rejected',
                    description: `Operator rejected guide replacement. Guide must continue with the tour.${note ? ` Note: ${note}` : ''}`,
                },
            });

            return { status: 'REJECTED' };
        },
        notification: async () => {
            await createDomainNotification({
                userId: request.guideId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/guide/tours/${request.tourId}`,
                type: 'REPLACEMENT_REJECTED',
                title: 'Replacement Rejected',
                message: `Your replacement request for "${request.tour.title}" was rejected. You are still assigned to this tour.${note ? ` Note: ${note}` : ''}`,
                relatedId: request.tourId,
            });
        },
    });
}

async function cancelFromReplacement(request: any, operatorId: string, note?: string) {
    // Mark replacement request as decided
    await (prisma as any).guideReplacementRequest.update({
        where: { id: request.id },
        data: { status: REPLACEMENT_STATUS.APPROVED, operatorDecision: 'CANCEL_TOUR', operatorNote: note || null, decidedAt: new Date() },
    });

    // Use existing cancel tour flow
    const { ExecutionDomain } = await import('@/domain/execution/ExecutionDomain');
    const result = await (ExecutionDomain.cancelTour as any)({
        tourId: request.tourId,
        userId: operatorId,
        userRole: 'TOUR_OPERATOR',
        reason: 'GUIDE_UNAVAILABLE',
        explanation: `Guide unavailable, operator chose to cancel. ${note || ''}`.trim(),
    });

    return { status: 'CANCELLED', cancelResult: result };
}

// ── Guide Abandonment Detection ───────────────────────────────────────

/**
 * If guide fails to show for a tour and never requested replacement,
 * this constitutes abandonment. Called by automation (NoShowPolicy).
 */
async function markGuideAbandoned(tourId: string, guideId: string) {
    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, title: true, operatorId: true },
    });
    if (!tour) return;

    // Check if there was a replacement request
    const hasReplacementRequest = await (prisma as any).guideReplacementRequest.findFirst({
        where: { tourId, guideId },
    });

    if (hasReplacementRequest) return; // Guide did request — not abandonment

    // Create abandonment event
    await (prisma as any).tourTimelineEvent.create({
        data: {
            tourId,
            actorId: guideId,
            actorRole: 'GUIDE',
            eventType: TIMELINE_EVENTS.ABANDONED,
            title: 'Guide Abandoned Tour',
            description: 'Guide failed to show without requesting replacement.',
        },
    });

    // Trust penalty
    await PrismaUserTrustRepo.appendEvent(guideId, 'GUIDE_ABANDONED_TOUR', -50, tourId);

    // Notify operator
    await createDomainNotification({
        userId: tour.operatorId,
        domain: NotificationDomain.SYSTEM,
        targetUrl: `/dashboard/operator/tours/${tourId}`,
        type: 'GUIDE_ABANDONED',
        title: '⚠️ Guide Abandoned Tour',
        message: `Guide abandoned "${tour.title}" without requesting replacement.`,
        relatedId: tourId,
    });

    // Create critical alert
    await (prisma as any).operationalAlert.create({
        data: {
            tourId,
            alertType: 'GUIDE_ABANDONED',
            severity: 'CRITICAL',
            message: `Guide abandoned "${tour.title}" without requesting replacement.`,
            metadata: { guideId },
        },
    });
}

// ── Suggest Available Guides (for operator) ───────────────────────────

async function suggestAvailableGuides(tourId: string, operatorId: string) {
    const tour = await prisma.serviceRequest.findUnique({
        where: { id: tourId },
        select: { id: true, startTime: true, endTime: true, province: true, language: true },
    });
    if (!tour) throw new Error('NOT_FOUND');

    // 1. Find in-house (affiliated) guides
    const affiliatedGuides = await prisma.user.findMany({
        where: {
            affiliatedOperatorId: operatorId,
            accountStatus: 'ACTIVE',
        },
        select: { id: true, name: true, trustScore: true, languages: true, skills: true, avatarUrl: true },
        take: 20,
    });

    // 2. Find marketplace guides with availability
    const availableGuides = await prisma.user.findMany({
        where: {
            role: { name: 'TOUR_GUIDE' },
            accountStatus: 'ACTIVE',
            affiliatedOperatorId: null, // Freelance only
            NOT: {
                operatorRequests: {
                    some: {
                        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
                        startTime: { lte: tour.endTime },
                        endTime: { gte: tour.startTime },
                    },
                },
            },
        },
        select: { id: true, name: true, trustScore: true, languages: true, skills: true, avatarUrl: true },
        orderBy: { trustScore: 'desc' },
        take: 20,
    });

    return {
        inhouse: affiliatedGuides,
        marketplace: availableGuides,
    };
}

// ── Get Replacement Requests ──────────────────────────────────────────

async function getReplacementRequests(tourId: string) {
    return (prisma as any).guideReplacementRequest.findMany({
        where: { tourId },
        orderBy: { createdAt: 'desc' },
    });
}

async function getPendingReplacementForGuide(tourId: string, guideId: string) {
    return (prisma as any).guideReplacementRequest.findFirst({
        where: { tourId, guideId, status: REPLACEMENT_STATUS.PENDING },
    });
}

// ── Exports ───────────────────────────────────────────────────────────

export const GuideReplacementDomain = {
    requestReplacement,
    handleOperatorDecision,
    markGuideAbandoned,
    suggestAvailableGuides,
    getReplacementRequests,
    getPendingReplacementForGuide,
    REPLACEMENT_STATUS,
    TIMELINE_EVENTS,
};
