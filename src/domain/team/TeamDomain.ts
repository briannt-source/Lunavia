/**
 * TeamDomain — Team Invitation Mutations
 *
 * Handles team invitation creation, expiration, deletion, and audit.
 */

import { prisma } from '@/lib/prisma';

async function expirePendingInvites(operatorId: string, email: string) {
    return prisma.companyInvitation.updateMany({
        where: { operatorId, email, status: 'PENDING' },
        data: { status: 'EXPIRED' },
    });
}

interface CreateInviteInput {
    email: string; operatorId: string; token: string; expiresAt: Date;
}

async function createInvitation(input: CreateInviteInput) {
    return prisma.companyInvitation.create({
        data: {
            email: input.email,
            invitedBy: input.operatorId,
            operatorId: input.operatorId,
            token: input.token,
            expiresAt: input.expiresAt,
            status: 'PENDING',
            role: 'TOUR_GUIDE',
            guideMode: 'IN_HOUSE',
        },
    });
}

async function deleteInvitation(invitationId: string) {
    return prisma.companyInvitation.delete({ where: { id: invitationId } });
}

async function logInviteAudit(input: { operatorId: string; invitationId: string; email: string; operatorName: string }) {
    return prisma.auditLog.create({
        data: {
            userId: input.operatorId,
            action: 'TEAM_INVITE_SENT',
            targetId: input.invitationId,
            targetType: 'TeamInvitation',
            meta: JSON.stringify({ email: input.email, operatorName: input.operatorName }),
        },
    });
}

async function expireInvitation(invitationId: string) {
    return prisma.companyInvitation.update({ where: { id: invitationId }, data: { status: 'EXPIRED' } });
}

async function createReferral(input: { referrerId: string; referredEmail: string }) {
    return prisma.referral.create({
        data: { referrerId: input.referrerId, referredEmail: input.referredEmail, rewardType: 'TEAM_AFFILIATION', status: 'PENDING' },
    });
}

async function refreshReferral(referralId: string) {
    return prisma.referral.update({ where: { id: referralId }, data: { createdAt: new Date(), status: 'PENDING' } });
}

export const TeamDomain = {
    expirePendingInvites, createInvitation, deleteInvitation,
    logInviteAudit, expireInvitation, createReferral, refreshReferral,
};
