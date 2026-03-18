/**
 * AdminMutations — Mutation Boundary for Admin Operations
 *
 * ALL admin mutations (plan changes, downgrades, permissions, verif approvals)
 * MUST go through this service. Route layer calls these functions only.
 */

import { prisma } from '@/lib/prisma';
import { snapshotRecord } from '@/domain/governance/AuditService';
import { executeGovernedMutation } from '@/domain/governance/executeGovernedMutation';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';
import { PrismaVerificationRepository } from '@/infrastructure/repositories/PrismaVerificationRepository';

// ══════════════════════════════════════════════════════════════════════
// PLAN CHANGE
// ══════════════════════════════════════════════════════════════════════

interface ChangePlanInput {
    targetUserId: string;
    actorId: string;
    actorRole: string;
    plan: string;
    planExpiresAt?: string | null;
    reason: string;
    ipAddress: string;
}

export async function changeUserPlan(input: ChangePlanInput) {
    const { targetUserId, actorId, actorRole, plan, planExpiresAt, reason, ipAddress } = input;

    const currentUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { plan: true },
    });
    if (!currentUser) throw new Error('User not found');

    const beforeState = snapshotRecord(currentUser);

    const result = await executeGovernedMutation({
        entityName: 'User',
        entityId: targetUserId,
        actorId,
        actorRole,
        auditAction: 'PLAN_CHANGED',
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord(r),
        metadata: { reason, previousPlan: currentUser.plan, newPlan: plan },
        ipAddress,
        atomicMutation: async (tx) => {
            const user = await tx.user.update({
                where: { id: targetUserId },
                data: {
                    plan,
                    planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
                },
            });

            await tx.userPlanHistory.create({
                data: {
                    userId: targetUserId,
                    oldPlan: currentUser.plan,
                    newPlan: plan,
                    reason,
                    actorId,
                },
            });

            return user;
        },
        notification: async () => {
            await createDomainNotification({
                userId: targetUserId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard/account/subscription',
                type: 'PLAN_CHANGED',
                title: 'Plan Updated',
                message: `Your plan has been changed to ${plan}.`,
            });
        },
    });

    return result;
}

// ══════════════════════════════════════════════════════════════════════
// DOWNGRADE
// ══════════════════════════════════════════════════════════════════════

interface DowngradeInput {
    targetUserId: string;
    actorId: string;
    reason: string;
}

export async function downgradeUser(input: DowngradeInput) {
    const { targetUserId, actorId, reason } = input;

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, plan: true },
    });
    if (!user) throw new Error('User not found');
    if (user.plan === 'FREE') throw new Error('User is already on FREE plan');

    const oldPlan = user.plan;

    await executeGovernedMutation({
        entityName: 'User',
        entityId: targetUserId,
        actorId,
        actorRole: 'ADMIN',
        auditAction: 'USER_DOWNGRADED',
        auditBefore: { plan: oldPlan },
        auditAfter: () => ({ plan: 'FREE' }),
        metadata: { fromPlan: oldPlan, toPlan: 'FREE', reason },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: targetUserId },
                data: { plan: 'FREE', planStartAt: null, planExpiresAt: null },
            });

            await tx.userPlanHistory.create({
                data: {
                    userId: targetUserId,
                    oldPlan,
                    newPlan: 'FREE',
                    reason,
                    actorId,
                },
            });

            return { previousPlan: oldPlan };
        },
    });

    return { previousPlan: oldPlan };
}

// ══════════════════════════════════════════════════════════════════════
// VERIFICATION APPROVE
// ══════════════════════════════════════════════════════════════════════

interface VerificationApproveInput {
    submissionId: string;
    actorId: string;
    actorRole: string;
    notes: string;
    updatedMeta?: Record<string, any> | null;
}

export async function approveVerification(input: VerificationApproveInput) {
    const { submissionId, actorId, actorRole, notes, updatedMeta } = input;

    const repo = new PrismaVerificationRepository(prisma);
    const submission = await repo.findById(submissionId);

    if (!submission || submission.status !== 'PENDING') {
        throw new Error('Not pending');
    }
    if (submission.userId === actorId) {
        throw new Error('Cannot approve own verification');
    }

    await executeGovernedMutation({
        entityName: 'VerificationSubmission',
        entityId: submissionId,
        actorId,
        actorRole,
        auditAction: 'VERIFICATION_APPROVED',
        auditBefore: { status: 'PENDING' },
        auditAfter: () => ({ status: 'APPROVED' }),
        metadata: { notes, updatedMeta, userId: submission.userId },
        atomicMutation: async (tx) => {
            await tx.verificationSubmission.update({
                where: { id: submissionId },
                data: { status: 'APPROVED', reviewedAt: new Date(), reviewNotes: notes },
            });

            const statusField = submission.type === 'KYB' ? 'kybStatus' : 'kycStatus';
            let finalMetadata: Record<string, any> = {};
            if (submission.data) finalMetadata = submission.data as Record<string, any>;

            const user = await tx.user.findUnique({ where: { id: submission.userId } });
            if (user?.roleMetadata) {
                try {
                    const existing = JSON.parse(user.roleMetadata);
                    finalMetadata = { ...existing, ...finalMetadata };
                } catch { /* ignore */ }
            }
            if (updatedMeta) finalMetadata = { ...finalMetadata, ...updatedMeta };

            await tx.user.update({
                where: { id: submission.userId },
                data: {
                    verificationStatus: 'APPROVED',
                    [statusField]: 'APPROVED',
                    roleMetadata: JSON.stringify(finalMetadata),
                },
            });

            return { ok: true };
        },
        notification: async () => {
            await PrismaUserTrustRepo.appendEvent(submission.userId, 'VERIFICATION_APPROVED', 100, actorId);

            await createDomainNotification({
                userId: submission.userId,
                domain: NotificationDomain.VERIFICATION,
                targetUrl: '/dashboard/verification/status',
                type: 'VERIFICATION_APPROVED',
                title: 'Verification Approved',
                message: 'Your verification has been approved.',
            });
        },
    });

    return { ok: true };
}

// ══════════════════════════════════════════════════════════════════════
// PERMISSIONS UPDATE
// ══════════════════════════════════════════════════════════════════════

interface UpdatePermissionsInput {
    targetUserId: string;
    actorId: string;
    actorRole: string;
    permissions: string[];
    ipAddress: string;
}

export async function updatePermissions(input: UpdatePermissionsInput) {
    const { targetUserId, actorId, actorRole, permissions, ipAddress } = input;

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, userPermissions: true },
    });
    if (!user) throw new Error('User not found');

    const beforeState = snapshotRecord(user);

    const result = await executeGovernedMutation({
        entityName: 'User',
        entityId: targetUserId,
        actorId,
        actorRole,
        auditAction: 'PERMISSION_UPDATED',
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord(r),
        metadata: { permissions },
        ipAddress,
        atomicMutation: async (tx) => {
            return tx.user.update({
                where: { id: targetUserId },
                data: { userPermissions: permissions as any },
            });
        },
    });

    return result;
}

// ══════════════════════════════════════════════════════════════════════
// VOUCHER REDEMPTION
// ══════════════════════════════════════════════════════════════════════

interface RedeemVoucherInput {
    userId: string;
    code: string;
}

export async function redeemVoucher(input: RedeemVoucherInput) {
    const { userId, code } = input;

    const voucher = await prisma.voucher.findUnique({
        where: { code: code.toUpperCase() },
        include: { redemptions: true },
    });

    if (!voucher) throw new Error('Invalid voucher code');
    if (voucher.status !== 'ACTIVE') throw new Error('This voucher is no longer active');
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) throw new Error('This voucher has expired');
    if (voucher.maxRedemptions && voucher.currentRedemptions >= voucher.maxRedemptions) {
        throw new Error('This voucher has reached its maximum redemptions');
    }
    if (voucher.redemptions.find((r) => r.userId === userId)) {
        throw new Error('You have already redeemed this voucher');
    }

    let redemptionExpiresAt: Date;
    if (voucher.durationType === 'DAYS') {
        redemptionExpiresAt = new Date();
        redemptionExpiresAt.setDate(redemptionExpiresAt.getDate() + voucher.durationValue);
    } else {
        redemptionExpiresAt = new Date('2099-12-31');
    }

    await executeGovernedMutation({
        entityName: 'Voucher',
        entityId: voucher.id,
        actorId: userId,
        actorRole: 'USER',
        auditAction: 'VOUCHER_REDEEMED',
        auditBefore: { currentRedemptions: voucher.currentRedemptions },
        auditAfter: () => ({ currentRedemptions: voucher.currentRedemptions + 1 }),
        metadata: { code: voucher.code, plan: voucher.plan, expiresAt: redemptionExpiresAt.toISOString() },
        atomicMutation: async (tx) => {
            await tx.voucherRedemption.create({
                data: { voucherId: voucher.id, userId, expiresAt: redemptionExpiresAt },
            });

            await tx.voucher.update({
                where: { id: voucher.id },
                data: { currentRedemptions: { increment: 1 } },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    plan: voucher.plan,
                    planExpiresAt: redemptionExpiresAt,
                },
            });

            await tx.userPlanHistory.create({
                data: {
                    userId,
                    oldPlan: 'FREE', // Simplification, could be fetched
                    newPlan: voucher.plan,
                    reason: `Redeemed voucher: ${voucher.code}`,
                    actorId: userId,
                },
            });

            return { plan: voucher.plan, expiresAt: redemptionExpiresAt };
        },
    });

    return { plan: voucher.plan, expiresAt: redemptionExpiresAt };
}

// ══════════════════════════════════════════════════════════════════════
// ROLE PERMISSION UPDATE
// ══════════════════════════════════════════════════════════════════════

interface UpdateRolePermissionsInput {
    roleId: string;
    permissionCodes: string[];
    actorId: string;
}

export async function updateRolePermissions(input: UpdateRolePermissionsInput) {
    const { roleId, permissionCodes, actorId } = input;

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new Error('Role not found');

    const permissions = await prisma.permission.findMany({
        where: { code: { in: permissionCodes } },
    });

    const validCodes = permissions.map((p) => p.code);
    const invalidCodes = permissionCodes.filter((c) => !validCodes.includes(c));
    if (invalidCodes.length > 0) {
        throw new Error(`Unknown permission codes: ${invalidCodes.join(', ')}`);
    }

    const currentPerms = await prisma.rolePermission.findMany({
        where: { roleId },
        include: { permission: true },
    });
    const currentCodes = currentPerms.map((rp) => rp.permission.code);

    const added = permissionCodes.filter((c) => !currentCodes.includes(c));
    const removed = currentCodes.filter((c) => !permissionCodes.includes(c));

    return executeSimpleMutation({
        entityName: 'Role',
        entityId: roleId,
        actorId,
        actorRole: 'ADMIN',
        auditAction: 'ROLE_PERMISSIONS_UPDATED',
        metadata: { roleName: role.name, added, removed, totalPermissions: permissionCodes.length },
        atomicMutation: async (tx) => {
            await tx.rolePermission.deleteMany({ where: { roleId } });

            for (const p of permissions) {
                await tx.rolePermission.create({
                    data: { roleId, permissionId: p.id },
                });
            }

            return { roleName: role.name, added: added.length, removed: removed.length };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// ROLE ASSIGNMENT
// ══════════════════════════════════════════════════════════════════════

interface AssignRoleInput {
    targetUserId: string;
    roleName: string;
    actorId: string;
}

export async function assignRole(input: AssignRoleInput) {
    const { targetUserId, roleName, actorId } = input;

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role '${roleName}' not found`);

    return executeSimpleMutation({
        entityName: 'User',
        entityId: targetUserId,
        actorId,
        actorRole: 'ADMIN',
        auditAction: 'ROLE_ASSIGNED',
        metadata: { roleName },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: targetUserId },
                data: { roleId: role.id },
            });

            return { roleName };
        },
    });
}
