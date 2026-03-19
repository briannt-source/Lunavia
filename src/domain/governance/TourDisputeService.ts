// ══════════════════════════════════════════════════════════════════════
// TourDisputeService — Tour-level dispute resolution
//
// Opens disputes, collects evidence, resolves with escrow actions,
// creates timeline events, and applies trust penalties.
// ══════════════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';
import type { DisputeStatus } from '@prisma/client';
import { NotificationDomain, NotificationType, withRouteDomain } from '@/domain/notification/NotificationService';

// ── Types ────────────────────────────────────────────────────────────

export type ResolutionAction =
    | 'RELEASE_TO_GUIDE'
    | 'PARTIAL_PAYMENT'
    | 'REFUND_OPERATOR'
    | 'WARN_GUIDE'
    | 'WARN_OPERATOR'
    | 'TRUST_PENALTY_GUIDE'
    | 'TRUST_PENALTY_OPERATOR';

interface OpenDisputeParams {
    tourId: string;
    openedById: string;
    reason: string;
    description: string;
    evidenceUrl?: string;
    isSimulation?: boolean;
}

interface ResolveDisputeParams {
    disputeId: string;
    resolvedById: string;
    resolution: string;
    action: ResolutionAction;
    partialAmount?: number;
    trustAction?: 'NEUTRAL_REFUND' | 'FAULT_GUIDE' | 'FAULT_OPERATOR';
    trustAmount?: number;
}

interface DisputeFilters {
    status?: DisputeStatus;
    tourId?: string;
    userId?: string;
    isSimulation?: boolean;
}

// ── Service ──────────────────────────────────────────────────────────

export class TourDisputeService {

    /**
     * Open a new dispute for a completed/active tour.
     * Locks escrow if currently HELD.
     */
    static async openDispute(params: OpenDisputeParams) {
        const { tourId, openedById, reason, description, evidenceUrl, isSimulation = false } = params;

        // Verify tour exists
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { id: true, operatorId: true, assignedGuideId: true, escrowStatus: true },
        });
        if (!tour) throw new Error('Tour not found');

        // Verify opener is involved in the tour
        if (tour.operatorId !== openedById && tour.assignedGuideId !== openedById) {
            throw new Error('You are not involved in this tour');
        }

        // Check for existing open dispute on this tour
        const existing = await prisma.tourDispute.findFirst({
            where: { tourId, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
        });
        if (existing) throw new Error('An active dispute already exists for this tour');

        // Create dispute with evidence if provided
        const dispute = await prisma.tourDispute.create({
            data: {
                tourId,
                openedById,
                reason,
                status: 'OPEN',
                isSimulation,
                evidence: {
                    create: [
                        {
                            uploadedBy: openedById,
                            type: 'NOTE',
                            message: description,
                            fileUrl: evidenceUrl || null,
                        }
                    ]
                }
            },
        });

        // Lock escrow if currently held
        if (tour.escrowStatus === 'HELD') {
            await prisma.tour.update({
                where: { id: tourId },
                data: { escrowStatus: 'HELD' }, // Keep held — prevent release
            });
        }

        // Create timeline event
        await prisma.tourTimelineEvent.create({
            data: {
                tourId,
                actorId: openedById,
                actorRole: tour.operatorId === openedById ? 'OPERATOR' : 'GUIDE',
                eventType: 'DISPUTE_OPENED',
                title: 'Dispute Opened',
                description: `${reason}: ${description.slice(0, 100)}${description.length > 100 ? '...' : ''}`,
                metadata: JSON.stringify({ disputeId: dispute.id, isSimulation, hasEvidence: !!evidenceUrl }),
            },
        });

        const notify = withRouteDomain(NotificationDomain.GOVERNANCE);
        const counterpartId = openedById === tour.operatorId ? tour.assignedGuideId : tour.operatorId;
        const counterpartRole = openedById === tour.operatorId ? 'guide' : 'operator';
        
        // Notify counterpart
        if (counterpartId) {
            await notify.create({
                userId: counterpartId,
                targetUrl: `/dashboard/${counterpartRole}/tours/${tourId}`,
                type: NotificationType.DISPUTE_OPENED,
                title: 'Tour Dispute Opened',
                message: `A dispute has been opened for tour ID ${tourId.split('-')[0]}. Escrow funds are frozen.`,
                relatedId: dispute.id,
            });
        }

        // Notify Admins
        const admins = await prisma.user.findMany({
            where: { role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'OPS'] } } },
            select: { id: true }
        });
        
        if (admins.length > 0) {
            await notify.createBulk({
                userIds: admins.map(a => a.id),
                targetUrl: `/dashboard/admin/tours/${tourId}`,
                type: NotificationType.DISPUTE_OPENED,
                title: 'New Tour Dispute',
                message: `A dispute was opened for tour ID ${tourId.split('-')[0]}. Please review.`,
                relatedId: dispute.id,
            });
        }

        return dispute;
    }

    /**
     * Submit evidence for an open dispute.
     */
    static async submitEvidence(params: {
        disputeId: string;
        uploadedBy: string;
        type: 'PHOTO' | 'DOCUMENT' | 'CHAT' | 'NOTE';
        fileUrl?: string;
        message?: string;
    }) {
        const dispute = await prisma.tourDispute.findUnique({
            where: { id: params.disputeId },
            select: { id: true, status: true, tourId: true, tour: { select: { operatorId: true, assignedGuideId: true } } },
        });
        if (!dispute) throw new Error('Dispute not found');
        if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
            throw new Error('Cannot submit evidence for a closed dispute');
        }

        // Verify submitter is involved
        const { operatorId, assignedGuideId } = dispute.tour;
        const isAdmin = !([operatorId, assignedGuideId].includes(params.uploadedBy));
        // Allow admin, operator, or guide
        if (!isAdmin && operatorId !== params.uploadedBy && assignedGuideId !== params.uploadedBy) {
            throw new Error('You are not authorized to submit evidence');
        }

        return prisma.disputeEvidence.create({
            data: {
                disputeId: params.disputeId,
                uploadedBy: params.uploadedBy,
                type: params.type,
                fileUrl: params.fileUrl || null,
                message: params.message || null,
            },
        });
    }

    /**
     * Admin resolves a dispute with an action.
     */
    static async resolveDispute(params: ResolveDisputeParams) {
        const { disputeId, resolvedById, resolution, action, trustAction, trustAmount } = params;

        const dispute = await prisma.tourDispute.findUnique({
            where: { id: disputeId },
            select: { id: true, status: true, tourId: true, openedById: true, tour: { select: { operatorId: true, assignedGuideId: true } } },
        });
        if (!dispute) throw new Error('Dispute not found');
        if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
            throw new Error('Dispute is already closed');
        }

        // Update dispute
        const resolved = await prisma.tourDispute.update({
            where: { id: disputeId },
            data: {
                status: 'RESOLVED',
                resolution,
                resolvedById,
                resolvedAt: new Date(),
            },
        });

        // Apply trust adjustments if specified (Neutral Refund or Fault Penalty)
        if (trustAction && trustAmount && trustAmount > 0) {
            const operatorId = dispute.tour.operatorId;
            const guideId = dispute.tour.assignedGuideId;

            if (trustAction === 'NEUTRAL_REFUND') {
                // Add trust back to both
                const targets = [operatorId, guideId].filter(Boolean) as string[];
                for (const targetId of targets) {
                    await prisma.trustRecord.create({
                        data: {
                            userId: targetId,
                            type: 'DISPUTE_RESOLUTION',
                            delta: trustAmount,
                            newScore: 0,
                            description: `Dispute neutral resolution: ${resolution.slice(0, 100)}`,
                        },
                    });
                    await prisma.user.update({
                        where: { id: targetId },
                        data: { trustScore: { increment: trustAmount } },
                    });
                }
            } else if (trustAction === 'FAULT_GUIDE' || trustAction === 'FAULT_OPERATOR') {
                const targetId = trustAction === 'FAULT_GUIDE' ? guideId : operatorId;
                if (targetId) {
                    await prisma.trustRecord.create({
                        data: {
                            userId: targetId,
                            type: 'DISPUTE_RESOLUTION',
                            delta: -trustAmount,
                            newScore: 0,
                            description: `Dispute penalty: ${resolution.slice(0, 100)}`,
                        },
                    });
                    await prisma.user.update({
                        where: { id: targetId },
                        data: { trustScore: { decrement: trustAmount } },
                    });
                }
            }
        }

        // Log operator risk event if operator lost
        if (action === 'REFUND_OPERATOR' || action === 'TRUST_PENALTY_OPERATOR' || action === 'WARN_OPERATOR') {
            // Operator was at fault — no risk event needed since they won
        }
        if (action === 'RELEASE_TO_GUIDE' || action === 'TRUST_PENALTY_GUIDE' || action === 'WARN_GUIDE') {
            // Guide was at fault or operator won
        }
        if (action === 'REFUND_OPERATOR') {
            // Log risk event for operator losing
            const { OperatorRiskEventService } = await import('./OperatorRiskEventService');
            await OperatorRiskEventService.logEvent(dispute.tour.operatorId, 'DISPUTE_LOST', `Dispute resolved against operator: ${resolution}`);
        }

        // Create timeline event
        await prisma.tourTimelineEvent.create({
            data: {
                tourId: dispute.tourId,
                actorId: resolvedById,
                actorRole: 'ADMIN',
                eventType: 'DISPUTE_RESOLVED',
                title: 'Dispute Resolved',
                description: `Resolution: ${resolution} | Action: ${action}`,
                metadata: JSON.stringify({ disputeId, action, trustAction, trustAmount }),
            },
        });

        return resolved;
    }

    /**
     * List disputes with filters.
     */
    static async listDisputes(filters: DisputeFilters = {}) {
        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.tourId) where.tourId = filters.tourId;
        if (filters.isSimulation !== undefined) where.isSimulation = filters.isSimulation;
        if (filters.userId) {
            where.OR = [
                { openedById: filters.userId },
                { tour: { operatorId: filters.userId } },
                { tour: { assignedGuideId: filters.userId } },
            ];
        }

        return prisma.tourDispute.findMany({
            where,
            include: {
                tour: { select: { id: true, title: true, operatorId: true, assignedGuideId: true } },
                openedBy: { select: { id: true, name: true, email: true } },
                resolvedBy: { select: { id: true, name: true } },
                _count: { select: { evidence: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get dispute with full evidence.
     */
    static async getDisputeWithEvidence(disputeId: string) {
        return prisma.tourDispute.findUnique({
            where: { id: disputeId },
            include: {
                tour: { select: { id: true, title: true, operatorId: true, assignedGuideId: true, totalPayout: true, escrowStatus: true } },
                openedBy: { select: { id: true, name: true, email: true } },
                resolvedBy: { select: { id: true, name: true } },
                evidence: { orderBy: { createdAt: 'asc' } },
            },
        });
    }

    /**
     * Move dispute to UNDER_REVIEW status.
     */
    static async startReview(disputeId: string) {
        return prisma.tourDispute.update({
            where: { id: disputeId },
            data: { status: 'UNDER_REVIEW' },
        });
    }
}
