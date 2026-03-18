/**
 * ProfileDomain — Profile, Portfolio & Payment Info Mutations
 *
 * All user profile/preference updates live here.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';

// ══════════════════════════════════════════════════════════════════════
// UPDATE PROFILE
// ══════════════════════════════════════════════════════════════════════

interface UpdateProfileInput {
    userId: string;
    updateData: Record<string, unknown>;
}

async function updateProfile(input: UpdateProfileInput) {
    const { userId, updateData } = input;
    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    return { user: updatedUser };
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE PORTFOLIO
// ══════════════════════════════════════════════════════════════════════

interface UpdatePortfolioInput {
    userId: string;
    bio?: string; languages?: any; skills?: any; workHistory?: any;
    experienceYears?: number; name?: string; avatarUrl?: string;
}

async function updatePortfolio(input: UpdatePortfolioInput) {
    const { userId, ...fields } = input;
    const updateData: any = {};
    if (fields.bio !== undefined) updateData.bio = fields.bio;
    if (fields.languages !== undefined) updateData.languages = typeof fields.languages === 'string' ? fields.languages : JSON.stringify(fields.languages);
    if (fields.skills !== undefined) updateData.skills = typeof fields.skills === 'string' ? fields.skills : JSON.stringify(fields.skills);
    if (fields.workHistory !== undefined) updateData.workHistory = typeof fields.workHistory === 'string' ? fields.workHistory : JSON.stringify(fields.workHistory);
    if (fields.experienceYears !== undefined) updateData.experienceYears = Number(fields.experienceYears);
    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.avatarUrl !== undefined) updateData.avatarUrl = fields.avatarUrl;

    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    return { user: updatedUser };
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE AVATAR (simple)
// ══════════════════════════════════════════════════════════════════════

async function updateAvatar(userId: string, avatarUrl: string) {
    await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    return { avatarUrl };
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE PAYMENT INFO (Operator — settings)
// ══════════════════════════════════════════════════════════════════════

interface UpdatePaymentInfoInput {
    userId: string;
    bankName: string; accountNumber: string; accountName: string; notes?: string;
}

async function updatePaymentInfo(input: UpdatePaymentInfoInput) {
    const { userId, bankName, accountNumber, accountName, notes } = input;
    const paymentInfo = JSON.stringify({ bankName, accountNumber, accountName, notes });
    await prisma.user.update({ where: { id: userId }, data: { paymentInfo } });
    return { success: true };
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE GUIDE PAYMENT INFO
// ══════════════════════════════════════════════════════════════════════

interface UpdateGuidePaymentInfoInput {
    userId: string;
    bankName: string; accountNumber: string; accountName: string; notes?: string;
}

async function updateGuidePaymentInfo(input: UpdateGuidePaymentInfoInput) {
    const { userId, bankName, accountNumber, accountName, notes } = input;
    const paymentInfo = { bankName, accountNumber, accountName, notes: notes || '' };

    return executeSimpleMutation({
        entityName: 'User',
        entityId: userId,
        actorId: userId,
        actorRole: 'TOUR_GUIDE',
        auditAction: 'GUIDE_PAYMENT_INFO_UPDATED',
        metadata: { bankName, hasAccountNumber: !!accountNumber },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { paymentInfo: JSON.stringify(paymentInfo) },
            });

            return { paymentInfo };
        },
    });
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE ACCOUNT PAYMENT (alternative endpoint)
// ══════════════════════════════════════════════════════════════════════

interface UpdateAccountPaymentInput {
    userId: string;
    bankName: string; accountNumber: string; accountName: string;
}

async function updateAccountPayment(input: UpdateAccountPaymentInput) {
    const { userId, bankName, accountNumber, accountName } = input;
    const paymentInfo = JSON.stringify({ bankName, accountNumber, accountName, updatedAt: new Date().toISOString() });
    await prisma.user.update({ where: { id: userId }, data: { paymentInfo } });
    return { success: true };
}

// ══════════════════════════════════════════════════════════════════════
// UPDATE ACCOUNT AVATAR (with file upload DB record)
// ══════════════════════════════════════════════════════════════════════

async function updateAccountAvatar(userId: string, avatarUrl: string) {
    await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    return { avatarUrl };
}


export const ProfileDomain = {
    updateProfile,
    updatePortfolio,
    updateAvatar,
    updatePaymentInfo,
    updateGuidePaymentInfo,
    updateAccountPayment,
    updateAccountAvatar,
};
