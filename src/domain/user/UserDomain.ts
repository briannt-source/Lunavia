/**
 * UserDomain — Identity, Auth & Admin User Mutations
 *
 * All user identity mutations live here:
 * signup, password change, admin user updates, verification reset,
 * plan extension, contract review, governance, staff creation,
 * suspend/reactivate, team accept, contract submit, bulk onboard.
 */

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { PrismaUserTrustRepo } from '@/infrastructure/repositories/PrismaUserTrustRepo';
import { AUDIT_ACTIONS, ENTITY_TYPES, snapshotRecord } from '@/domain/governance/AuditService';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import crypto from 'crypto';

// ══════════════════════════════════════════════════════════════════════
// CREATE USER (Signup)
// ══════════════════════════════════════════════════════════════════════

interface CreateUserInput {
    fullName: string; email: string; password: string;
    role: string; roleMetadata?: any; referralCode?: string;
    systemMode?: string;
}

async function createUser(input: CreateUserInput) {
    const { fullName, email, password, role, roleMetadata, referralCode, systemMode } = input;

    const passwordHash = await hashPassword(password);
    const newReferralCode = crypto.randomBytes(4).toString('hex');

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) throw new Error('INVALID_ROLE');

    return executeSimpleMutation({
        entityName: 'User',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        auditAction: 'USER_CREATED',
        metadata: { email, role },
        atomicMutation: async (tx) => {
            // Determine default plan based on role + system mode
            let defaultPlan = 'FREE'; // Marketplace operators
            let defaultPlanExpiry: Date | null = null;
            if (role === 'TOUR_GUIDE') {
                defaultPlan = 'GUIDE_FREE';
            } else if (systemMode === 'INTERNAL_OPERATOR_MODE') {
                defaultPlan = 'OPS_STARTER';
                defaultPlanExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            }

            // Handle in-house guide direct affiliation via code
            let finalGuideMode: string | null = null;
            let finalAffiliatedOperatorId: string | null = null;
            let directAffiliationReferrerId: string | null = null;

            if (role === 'TOUR_GUIDE' && roleMetadata?.guideType === 'association' && referralCode) {
                // Try looking up the operator by referralCode or exact ID
                const operator = await tx.user.findFirst({
                    where: { OR: [{ referralCode: referralCode }, { id: referralCode }] },
                    select: { id: true, role: { select: { name: true } } }
                });

                if (operator && operator.role.name === 'TOUR_OPERATOR') {
                    finalGuideMode = 'IN_HOUSE';
                    finalAffiliatedOperatorId = operator.id;
                    directAffiliationReferrerId = operator.id; // Mark so we skip the standard 7-day PRO logic
                    console.log(`[Signup] Auto-affiliated guide to operator ${operator.id} via code ${referralCode}`);
                }
            }

            const user = await tx.user.create({
                data: {
                    name: fullName.trim(),
                    email,
                    passwordHash,
                    roleId: roleRecord.id,
                    roleMetadata: roleMetadata ? JSON.stringify(roleMetadata) : null,
                    kycStatus: 'NOT_STARTED',
                    kybStatus: 'NOT_STARTED',
                    referralCode: newReferralCode,
                    plan: defaultPlan,
                    ...(defaultPlanExpiry ? { planExpiresAt: defaultPlanExpiry } : {}),
                    ...(systemMode ? { systemMode: systemMode as any } : {}),
                    ...(finalGuideMode ? { guideMode: finalGuideMode as any } : {}),
                    ...(finalAffiliatedOperatorId ? { affiliatedOperatorId: finalAffiliatedOperatorId } : {}),
                },
            });

            await PrismaUserTrustRepo.appendEvent(user.id, 'INITIAL_SIGNUP', 0, 'SYSTEM', tx);

            // Handle referral reward (PRO plan only — no auto-affiliation)
            // NOTE: In-house guide onboarding is a SEPARATE flow via Team Invite
            // (/api/operator/team/invite → /invite/accept). Referral codes
            // are purely for rewarding both parties with 7-day PRO.
            let referralApplied = false;
            if (referralCode) {
                try {
                    const referrer = await tx.user.findFirst({
                        where: { referralCode },
                        select: { id: true, plan: true, role: { select: { name: true } } },
                    });

                    if (referrer && referrer.id !== user.id) {
                        await tx.userReferral.create({
                            data: { referrerUserId: referrer.id, referredUserId: user.id, rewardApplied: true },
                        });

                        // Only grant 7-day PRO reward if this wasn't a direct affiliation linking step
                        // (we don't want associate guides getting PRO and marketplace access just for linking)
                        if (!directAffiliationReferrerId || directAffiliationReferrerId !== referrer.id) {
                            const isGuide = role === 'TOUR_GUIDE';
                            const basePlan = isGuide ? 'GUIDE_FREE' : 'FREE';
                            const upgradePlan = isGuide ? 'GUIDE_PRO' : 'PRO';
                            if (user.plan === basePlan) {
                                await tx.user.update({
                                    where: { id: user.id },
                                    data: { plan: upgradePlan, planStartAt: new Date(), planExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                                });
                                referralApplied = true;
                            }
    
                            await tx.auditLog.create({
                                data: {
                                    userId: user.id, action: 'REFERRAL_REWARD_APPLIED',
                                    targetId: referrer.id, targetType: 'User',
                                    meta: JSON.stringify({ reward: '7_DAY_PRO', referralCode }),
                                },
                            });
                        }
                    }
                } catch (refError) {
                    console.error('Referral processing error:', refError);
                }
            }

            return { user, referralApplied };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD
// ══════════════════════════════════════════════════════════════════════

async function changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) throw new Error('NOT_FOUND');

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) throw new Error('INVALID_PASSWORD');

    const newHash = await hashPassword(newPassword);

    return executeSimpleMutation({
        entityName: 'User',
        entityId: userId,
        actorId: userId,
        actorRole: 'USER',
        auditAction: 'PASSWORD_CHANGED',
        atomicMutation: async (tx) => {
            await tx.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
            return { success: true };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// ADMIN UPDATE USER (roleMetadata)
// ══════════════════════════════════════════════════════════════════════

interface AdminUpdateUserInput {
    targetUserId: string;
    fields: Record<string, any>;
}

async function adminUpdateUser(input: AdminUpdateUserInput) {
    const { targetUserId, fields } = input;

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { roleMetadata: true, role: { select: { name: true } } },
    });
    if (!user) throw new Error('NOT_FOUND');

    let metadata: any = {};
    try { metadata = user.roleMetadata ? JSON.parse(user.roleMetadata) : {}; } catch { /* ignore */ }

    const userRoleName = (user.role as { name: string })?.name || '';

    if (fields.name !== undefined) metadata.name = fields.name;
    if (fields.phoneNumber !== undefined) metadata.phoneNumber = fields.phoneNumber.trim();
    if (fields.address !== undefined) metadata.address = fields.address;
    if (fields.bio !== undefined) metadata.bio = fields.bio;
    if (fields.companyName !== undefined && userRoleName === 'TOUR_OPERATOR') metadata.companyName = fields.companyName;
    if (fields.operatorType !== undefined && userRoleName === 'TOUR_OPERATOR') metadata.operatorType = fields.operatorType;
    if (fields.businessRegistrationNumber !== undefined && userRoleName === 'TOUR_OPERATOR') metadata.businessRegistrationNumber = fields.businessRegistrationNumber;
    if (fields.tourLicenseNumber !== undefined && userRoleName === 'TOUR_OPERATOR') metadata.tourLicenseNumber = fields.tourLicenseNumber;

    if (userRoleName === 'TOUR_GUIDE') {
        if (fields.guideType !== undefined) metadata.guideType = fields.guideType;
        if (fields.guideCardNumber !== undefined) metadata.guideCardNumber = fields.guideCardNumber;
        if (fields.affiliatedOperatorId !== undefined) metadata.affiliatedOperatorId = fields.affiliatedOperatorId;
    }

    const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { roleMetadata: JSON.stringify(metadata) },
    });

    return { user: updatedUser };
}

// ══════════════════════════════════════════════════════════════════════
// RESET VERIFICATION
// ══════════════════════════════════════════════════════════════════════

async function resetVerification(targetUserId: string, actorId: string, actorRole: string) {
    return executeSimpleMutation({
        entityName: ENTITY_TYPES.USER,
        entityId: targetUserId,
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.VERIFICATION_RESET,
        auditBefore: {},
        auditAfter: () => ({ verificationStatus: 'PENDING_SUBMISSION', kycStatus: 'NOT_SUBMITTED', kybStatus: 'NOT_SUBMITTED' }),
        metadata: { targetUserId },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: targetUserId },
                data: { verificationStatus: 'PENDING_SUBMISSION', kycStatus: 'NOT_SUBMITTED', kybStatus: 'NOT_SUBMITTED' },
            });

            return { success: true };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// EXTEND PLAN
// ══════════════════════════════════════════════════════════════════════

interface ExtendPlanInput {
    targetUserId: string; adminId: string; newExpiresAt: Date;
}

async function extendPlan(input: ExtendPlanInput) {
    const { targetUserId, adminId, newExpiresAt } = input;

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, plan: true, planExpiresAt: true },
    });
    if (!user) throw new Error('NOT_FOUND');
    if (user.plan === 'FREE') throw new Error('CANNOT_EXTEND_FREE');

    const oldExpiresAt = user.planExpiresAt;

    return executeSimpleMutation({
        entityName: 'User',
        entityId: targetUserId,
        actorId: adminId,
        actorRole: 'ADMIN',
        auditAction: 'PLAN_EXTENDED',
        metadata: { plan: user.plan, oldExpiresAt: oldExpiresAt?.toISOString() || null, newExpiresAt: newExpiresAt.toISOString() },
        atomicMutation: async (tx) => {
            await tx.user.update({ where: { id: targetUserId }, data: { planExpiresAt: newExpiresAt } });

            await tx.userPlanHistory.create({
                data: {
                    userId: targetUserId, oldPlan: user.plan, newPlan: user.plan,
                    reason: `Plan extended to ${newExpiresAt.toISOString().split('T')[0]}`, actorId: adminId,
                },
            });

            return { planExpiresAt: newExpiresAt };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// REVIEW CONTRACT (Admin approve/reject)
// ══════════════════════════════════════════════════════════════════════

interface ReviewContractInput {
    guideId: string; adminId: string; action: 'approve' | 'reject'; reason?: string;
}

async function reviewContract(input: ReviewContractInput) {
    const { guideId, adminId, action, reason } = input;

    const guide = await prisma.user.findUnique({
        where: { id: guideId },
        select: { id: true, email: true, role: { select: { name: true } }, contractStatus: true, affiliatedOperatorId: true },
    });
    if (!guide) throw new Error('NOT_FOUND');
    if ((guide.role as { name: string }).name !== 'TOUR_GUIDE') throw new Error('NOT_A_GUIDE');
    if (guide.contractStatus !== 'PENDING') throw new Error('NOT_PENDING');

    return executeSimpleMutation({
        entityName: 'User',
        entityId: guideId,
        actorId: adminId,
        actorRole: 'ADMIN',
        auditAction: action === 'approve' ? 'CONTRACT_APPROVED' : 'CONTRACT_REJECTED',
        metadata: { guideEmail: guide.email, operatorId: guide.affiliatedOperatorId, reason },
        atomicMutation: async (tx) => {
            if (action === 'approve') {
                await tx.user.update({
                    where: { id: guideId },
                    data: { guideMode: 'IN_HOUSE', contractStatus: 'APPROVED', contractReviewedAt: new Date(), contractReviewedBy: adminId },
                });
            } else {
                await tx.user.update({
                    where: { id: guideId },
                    data: { guideMode: 'MARKETPLACE', contractStatus: 'REJECTED', contractReviewedAt: new Date(), contractReviewedBy: adminId, affiliatedOperatorId: null, inhouseExitedAt: new Date() },
                });
            }

            return { action };
        },
        notification: async () => {
            if (action === 'approve') {
                await createDomainNotification({
                    userId: guide.id, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: '/dashboard/guide/profile',
                    type: 'CONTRACT_APPROVED', title: 'Contract Approved',
                    message: 'Your in-house contract has been approved. You are now affiliated with your operator.',
                });

                if (guide.affiliatedOperatorId) {
                    await createDomainNotification({
                        userId: guide.affiliatedOperatorId, domain: NotificationDomain.GOVERNANCE,
                        targetUrl: '/dashboard/operator/team',
                        type: 'TEAM_MEMBER_ADDED', title: 'New Team Member',
                        message: `${guide.email} has been approved and added to your in-house team.`,
                    });
                }
            } else {
                await createDomainNotification({
                    userId: guide.id, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: '/dashboard/guide/profile',
                    type: 'CONTRACT_REJECTED', title: 'Contract Rejected',
                    message: reason || 'Your in-house contract was not approved. You may continue as a marketplace guide.',
                });
            }
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE GOVERNANCE (mode/layers)
// ══════════════════════════════════════════════════════════════════════

interface UpdateGovernanceInput {
    adminId: string; adminRole: string;
    operatorId: string; updateData: Record<string, unknown>;
    changes: Record<string, unknown>; operatorName: string;
    isLayerChange: boolean;
}

async function updateGovernance(input: UpdateGovernanceInput) {
    const { adminId, adminRole, operatorId, updateData, changes, operatorName, isLayerChange } = input;

    return executeSimpleMutation({
        entityName: 'User',
        entityId: operatorId,
        actorId: adminId,
        actorRole: adminRole,
        auditAction: isLayerChange ? 'GOVERNANCE_LAYER_TOGGLED' : 'GOVERNANCE_MODE_CHANGED',
        metadata: { operatorName, ...changes },
        atomicMutation: async (tx) => {
            const updated = await tx.user.update({
                where: { id: operatorId }, data: updateData,
                select: { id: true, name: true, systemMode: true, enabledLayers: true },
            });

            return { operator: updated };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// CREATE STAFF USER
// ══════════════════════════════════════════════════════════════════════

interface CreateStaffInput {
    name: string; email: string; role: string; password: string;
    actorId: string; actorRole: string;
}

async function createStaffUser(input: CreateStaffInput) {
    const { name, email, role, password, actorId, actorRole } = input;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('EMAIL_EXISTS');

    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) throw new Error('ROLE_NOT_FOUND');

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.STAFF,
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.STAFF_CREATED,
        auditBefore: {},
        auditAfter: (r: any) => ({ email, role }),
        metadata: { staffEmail: email, staffRole: role },
        atomicMutation: async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email, roleId: roleRecord.id, passwordHash,
                    roleMetadata: JSON.stringify({ name }),
                    accountStatus: 'ACTIVE', verificationStatus: 'APPROVED', kycStatus: 'APPROVED',
                },
            });

            return { user: { id: newUser.id, email: newUser.email } };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// SUSPEND USER
// ══════════════════════════════════════════════════════════════════════

interface SuspendUserInput {
    targetUserId: string; actorId: string; actorRole: string; ipAddress: string;
}

async function suspendUser(input: SuspendUserInput) {
    const { targetUserId, actorId, actorRole, ipAddress } = input;

    const beforeUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    const beforeState = snapshotRecord(beforeUser);

    const { container } = await import('@/infrastructure/container');
    const useCase = await container.getSuspendUserUseCase();
    const result = await useCase.execute(actorId, targetUserId);

    if (!result.success) throw new Error(`SUSPEND_FAILED:${result.error}`);

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.USER,
        entityId: targetUserId,
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.USER_SUSPENDED,
        auditBefore: beforeState || {},
        auditAfter: () => snapshotRecord({ ...beforeUser, isActive: false }),
        metadata: { reason: 'Admin Action', adminId: actorId },
        ipAddress,
        atomicMutation: async () => {
            return { success: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: targetUserId, domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard', type: 'ACCOUNT_SUSPENDED',
                title: 'Account Suspended',
                message: 'Your account has been suspended. Please contact support for more information.',
                relatedId: targetUserId,
            });
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// REACTIVATE USER
// ══════════════════════════════════════════════════════════════════════

interface ReactivateUserInput {
    targetUserId: string; actorId: string; actorRole: string; ipAddress: string;
}

async function reactivateUser(input: ReactivateUserInput) {
    const { targetUserId, actorId, actorRole, ipAddress } = input;

    const beforeUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    const beforeState = snapshotRecord(beforeUser);

    const { container } = await import('@/infrastructure/container');
    const useCase = await container.getReactivateUserUseCase();
    const result = await useCase.execute(actorId, targetUserId);

    if (!result.success) throw new Error(`REACTIVATE_FAILED:${result.error}`);

    return executeSimpleMutation({
        entityName: ENTITY_TYPES.USER,
        entityId: targetUserId,
        actorId,
        actorRole,
        auditAction: AUDIT_ACTIONS.USER_REACTIVATED,
        auditBefore: beforeState || {},
        auditAfter: () => snapshotRecord({ ...beforeUser, isActive: true }),
        metadata: { adminId: actorId },
        ipAddress,
        atomicMutation: async () => {
            return { success: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: targetUserId, domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard', type: 'ACCOUNT_REACTIVATED',
                title: 'Account Reactivated',
                message: 'Your account has been reactivated. You can now use the platform normally.',
                relatedId: targetUserId,
            });
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// ACCEPT TEAM INVITE (Guide)
// ══════════════════════════════════════════════════════════════════════

interface AcceptTeamInviteInput {
    guideId: string; guideEmail: string; referralId: string;
}

async function acceptTeamInvite(input: AcceptTeamInviteInput) {
    const { guideId, guideEmail, referralId } = input;

    const referral = await prisma.referral.findFirst({
        where: { id: referralId, referredEmail: guideEmail, rewardType: 'TEAM_AFFILIATION', status: 'PENDING' },
    });
    if (!referral) throw new Error('NOT_FOUND');

    const guide = await prisma.user.findUnique({
        where: { id: guideId },
        select: { guideMode: true, affiliatedOperatorId: true },
    });
    if (guide?.guideMode === 'IN_HOUSE') throw new Error('ALREADY_AFFILIATED');

    return executeSimpleMutation({
        entityName: 'User',
        entityId: guideId,
        actorId: guideId,
        actorRole: 'TOUR_GUIDE',
        auditAction: 'TEAM_INVITE_ACCEPTED',
        metadata: { referralId, operatorId: referral.referrerId },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: guideId },
                data: { affiliatedOperatorId: referral.referrerId, contractStatus: 'PENDING' },
            });

            await tx.referral.update({
                where: { id: referral.id },
                data: { status: 'ACCEPTED' },
            });

            return { nextStep: 'UPLOAD_CONTRACT' };
        },
        notification: async () => {
            await createDomainNotification({
                userId: referral.referrerId, domain: NotificationDomain.GOVERNANCE,
                targetUrl: '/dashboard/operator/team',
                type: 'TEAM_ACCEPT', title: 'Guide Accepted Invitation',
                message: 'A guide has accepted your team invitation and is pending internal review.',
            });

            const internalUsers = await prisma.user.findMany({
                where: { role: { name: { in: ['OPS', 'SUPER_ADMIN'] } } },
                select: { id: true },
            });
            for (const user of internalUsers) {
                await createDomainNotification({
                    userId: user.id, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: '/dashboard/admin/governance',
                    type: 'CONTRACT_REVIEW_NEEDED', title: 'In-house Contract Review Required',
                    message: `Guide ${guideEmail} accepted team invite. Contract review pending.`,
                });
            }
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// SUBMIT CONTRACT (Guide)
// ══════════════════════════════════════════════════════════════════════

interface SubmitContractInput {
    guideId: string; guideEmail: string;
    documentUrl: string; contractType: string; operatorId: string;
}

async function submitContract(input: SubmitContractInput) {
    const { guideId, guideEmail, documentUrl, contractType, operatorId } = input;

    const operator = await prisma.user.findUnique({
        where: { id: operatorId },
        select: { id: true, role: { select: { name: true } } },
    });
    if (!operator || (operator.role as { name: string })?.name !== 'TOUR_OPERATOR') throw new Error('INVALID_OPERATOR');

    const pendingInvite = await prisma.referral.findFirst({
        where: { referrerId: operatorId, referredEmail: guideEmail, rewardType: 'TEAM_AFFILIATION', status: 'PENDING' },
    });
    if (!pendingInvite) throw new Error('NO_PENDING_INVITE');

    return executeSimpleMutation({
        entityName: 'User',
        entityId: guideId,
        actorId: guideId,
        actorRole: 'TOUR_GUIDE',
        auditAction: 'CONTRACT_SUBMITTED',
        metadata: { operatorId, contractType },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: guideId },
                data: { contractDocumentUrl: documentUrl, contractType, contractStatus: 'PENDING', affiliatedOperatorId: operatorId },
            });

            await tx.referral.update({
                where: { id: pendingInvite.id },
                data: { status: 'ACCEPTED' },
            });

            return { success: true };
        },
        notification: async () => {
            const admins = await prisma.user.findMany({
                where: { role: { name: { in: ['SUPER_ADMIN', 'OPS'] } } },
                select: { id: true },
            });
            for (const admin of admins) {
                await createDomainNotification({
                    userId: admin.id, domain: NotificationDomain.GOVERNANCE,
                    targetUrl: '/dashboard/admin/governance',
                    type: 'CONTRACT_REVIEW', title: 'Contract Review Required',
                    message: 'A guide has submitted a contract for in-house affiliation. Please review.',
                });
            }
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// BULK ONBOARD (Operator — Enterprise)
// ══════════════════════════════════════════════════════════════════════

interface BulkOnboardGuideInput {
    userId: string; operatorId: string;
    affiliatedOperatorId: string; declarationType: string;
}

async function bulkOnboardExistingGuide(input: BulkOnboardGuideInput) {
    const { userId, operatorId, affiliatedOperatorId, declarationType } = input;

    return executeSimpleMutation({
        entityName: 'User',
        entityId: userId,
        actorId: operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'BULK_ONBOARD',
        metadata: { affiliatedOperatorId, declarationType },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { affiliatedOperatorId, contractStatus: 'PENDING', contractType: declarationType },
            });

            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId, domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard/guide/tours',
                type: 'BULK_ONBOARD', title: 'In-house Onboarding',
                message: 'You have been added to an operator\'s team via bulk declaration. Pending internal review.',
            });
        },
    });
}


export const UserDomain = {
    createUser,
    changePassword,
    adminUpdateUser,
    resetVerification,
    extendPlan,
    reviewContract,
    updateGovernance,
    createStaffUser,
    suspendUser,
    reactivateUser,
    acceptTeamInvite,
    submitContract,
    bulkOnboardExistingGuide,
};
