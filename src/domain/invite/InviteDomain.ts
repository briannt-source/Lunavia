/**
 * InviteDomain — Guide Invite Flow
 *
 * Operators invite guides to tours. Guides accept or decline.
 * All mutations through executeSimpleMutation kernel.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import {
    createDomainNotification,
    NotificationDomain,
    NotificationType,
} from '@/domain/notification/NotificationService';
import { AvailabilityDomain } from '@/domain/availability/AvailabilityDomain';

// Default invite expiration: 48 hours
const INVITE_EXPIRY_HOURS = 48;

/**
 * Create an invite from operator to guide for a specific tour
 */
async function createInvite(params: {
    tourId: string;
    guideId: string;
    operatorId: string;
    message?: string;
}) {
    const { tourId, guideId, operatorId, message } = params;

    // Validation
    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        select: { id: true, operatorId: true, status: true, title: true, startTime: true, assignedGuideId: true },
    });

    if (!tour) throw new Error('Tour not found');
    if (tour.operatorId !== operatorId) throw new Error('Not your tour');
    if (!['DRAFT', 'PUBLISHED', 'OPEN'].includes(tour.status)) {
        throw new Error('Tour is not in a state that allows invitations');
    }
    if (tour.assignedGuideId) throw new Error('Tour already has an assigned guide');

    // Check if guide exists and is a TOUR_GUIDE
    const guide = await prisma.user.findUnique({
        where: { id: guideId },
        select: { id: true, role: { select: { name: true } }, name: true },
    });
    if (!guide) throw new Error('Guide not found');
    if (guide.role.name !== 'TOUR_GUIDE') throw new Error('User is not a guide');

    // Check guide availability on tour date
    const isAvailable = await AvailabilityDomain.isAvailableOn(guideId, tour.startTime);
    if (!isAvailable) {
        throw new Error('Guide is not available on the tour date');
    }

    // Check for duplicate invite
    const existing = await prisma.guideInvite.findUnique({
        where: { tourId_guideId: { tourId, guideId } },
    });
    if (existing) throw new Error('Guide has already been invited to this tour');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITE_EXPIRY_HOURS);

    return executeSimpleMutation({
        entityName: 'GuideInvite',
        actorId: operatorId,
        actorRole: 'TOUR_OPERATOR',
        atomicMutation: async (tx) => {
            return tx.guideInvite.create({
                data: {
                    tourId,
                    guideId,
                    operatorId,
                    message: message || null,
                    expiresAt,
                    status: 'PENDING',
                },
            });
        },
        auditAction: 'GUIDE_INVITE_CREATED',
        notification: async () => {
            await createDomainNotification({
                userId: guideId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/guide/invites`,
                type: NotificationType.GUIDE_INVITE_RECEIVED,
                title: 'New Tour Invitation',
                message: `You've been invited to "${tour.title}". Review and respond within 48 hours.`,
                relatedId: tourId,
            });
        },
    });
}

/**
 * Accept an invite — assigns guide to tour
 */
async function acceptInvite(params: {
    inviteId: string;
    guideId: string;
}) {
    const { inviteId, guideId } = params;

    const invite = await prisma.guideInvite.findUnique({
        where: { id: inviteId },
        include: {
            tour: { select: { id: true, title: true, startTime: true, assignedGuideId: true, operatorId: true } },
        },
    });

    if (!invite) throw new Error('Invite not found');
    if (invite.guideId !== guideId) throw new Error('Not your invite');
    if (invite.status !== 'PENDING') throw new Error(`Invite is already ${invite.status}`);
    if (new Date() > invite.expiresAt) throw new Error('Invite has expired');
    if (invite.tour.assignedGuideId) throw new Error('Tour already has an assigned guide');

    // Re-check availability
    const isAvailable = await AvailabilityDomain.isAvailableOn(guideId, invite.tour.startTime);
    if (!isAvailable) {
        throw new Error('You are no longer available on the tour date');
    }

    return executeSimpleMutation({
        entityName: 'GuideInvite',
        entityId: inviteId,
        actorId: guideId,
        actorRole: 'TOUR_GUIDE',
        atomicMutation: async (tx) => {
            // Update invite status
            const updated = await tx.guideInvite.update({
                where: { id: inviteId },
                data: { status: 'ACCEPTED' },
            });

            // Assign guide to tour
            await tx.serviceRequest.update({
                where: { id: invite.tourId },
                data: {
                    assignedGuideId: guideId,
                    assignmentType: 'FREELANCE',
                    status: 'ASSIGNED',
                },
            });

            // Decline all other pending invites for this tour
            await tx.guideInvite.updateMany({
                where: {
                    tourId: invite.tourId,
                    id: { not: inviteId },
                    status: 'PENDING',
                },
                data: { status: 'DECLINED' },
            });

            return updated;
        },
        auditAction: 'GUIDE_INVITE_ACCEPTED',
        notification: async () => {
            await createDomainNotification({
                userId: invite.tour.operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/request/${invite.tourId}`,
                type: NotificationType.GUIDE_INVITE_ACCEPTED,
                title: 'Invite Accepted',
                message: `Your guide invitation for "${invite.tour.title}" has been accepted!`,
                relatedId: invite.tourId,
            });
        },
    });
}

/**
 * Decline an invite
 */
async function declineInvite(params: {
    inviteId: string;
    guideId: string;
}) {
    const { inviteId, guideId } = params;

    const invite = await prisma.guideInvite.findUnique({
        where: { id: inviteId },
        include: {
            tour: { select: { id: true, title: true, operatorId: true } },
        },
    });

    if (!invite) throw new Error('Invite not found');
    if (invite.guideId !== guideId) throw new Error('Not your invite');
    if (invite.status !== 'PENDING') throw new Error(`Invite is already ${invite.status}`);

    return executeSimpleMutation({
        entityName: 'GuideInvite',
        entityId: inviteId,
        actorId: guideId,
        actorRole: 'TOUR_GUIDE',
        atomicMutation: async (tx) => {
            return tx.guideInvite.update({
                where: { id: inviteId },
                data: { status: 'DECLINED' },
            });
        },
        auditAction: 'GUIDE_INVITE_DECLINED',
        notification: async () => {
            await createDomainNotification({
                userId: invite.tour.operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/request/${invite.tourId}`,
                type: NotificationType.GUIDE_INVITE_DECLINED,
                title: 'Invite Declined',
                message: `Your guide invitation for "${invite.tour.title}" was declined.`,
                relatedId: invite.tourId,
            });
        },
    });
}

/**
 * Expire all past-due invites (for cron job)
 */
async function expireInvites() {
    const now = new Date();

    return executeSimpleMutation({
        entityName: 'GuideInvite',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        atomicMutation: async (tx) => {
            const result = await tx.guideInvite.updateMany({
                where: {
                    status: 'PENDING',
                    expiresAt: { lt: now },
                },
                data: { status: 'EXPIRED' },
            });
            return { expiredCount: result.count };
        },
        auditAction: 'GUIDE_INVITES_EXPIRED',
    });
}

/**
 * Get pending invites for a guide
 */
async function getGuideInvites(guideId: string) {
    return prisma.guideInvite.findMany({
        where: { guideId },
        include: {
            tour: {
                select: {
                    id: true, title: true, location: true, province: true,
                    startTime: true, endTime: true, language: true, totalPayout: true,
                    currency: true, status: true,
                },
            },
            operator: {
                select: {
                    id: true, name: true, avatarUrl: true, trustScore: true,
                    roleMetadata: true, verificationStatus: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Get invites sent by an operator
 */
async function getOperatorInvites(operatorId: string) {
    return prisma.guideInvite.findMany({
        where: { operatorId },
        include: {
            tour: {
                select: { id: true, title: true, startTime: true, status: true },
            },
            guide: {
                select: {
                    id: true, name: true, avatarUrl: true, trustScore: true,
                    roleMetadata: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export const InviteDomain = {
    createInvite,
    acceptInvite,
    declineInvite,
    expireInvites,
    getGuideInvites,
    getOperatorInvites,
};
