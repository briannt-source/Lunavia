/**
 * PaymentDomain — Subscription and Tour Payment Mutations
 *
 * Handles subscription payment requests, proof uploads, rejection,
 * plan pricing CRUD, payment disputes, and cron jobs.
 */

import { prisma } from '@/lib/prisma';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { createDomainNotification, createBulkDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';

// ── Create Subscription Payment Request ─────────────────────────────

interface CreatePaymentRequestInput {
    userId: string; requestedPlan: string; durationDays: number; amount: number;
}

async function createSubscriptionPaymentRequest(input: CreatePaymentRequestInput) {
    return prisma.subscriptionPaymentRequest.create({
        data: {
            userId: input.userId,
            requestedPlan: input.requestedPlan,
            durationDays: input.durationDays,
            amount: input.amount,
            status: 'PENDING',
        },
    });
}

// ── Upload Payment Proof ────────────────────────────────────────────

async function uploadPaymentProof(requestId: string, proofImageUrl: string) {
    return prisma.subscriptionPaymentRequest.update({
        where: { id: requestId },
        data: { proofImageUrl },
    });
}

// ── Reject Subscription Payment ─────────────────────────────────────

interface RejectPaymentInput {
    requestId: string; adminId: string; reason: string;
    userId: string; requestedPlan: string;
}

async function rejectSubscriptionPayment(input: RejectPaymentInput) {
    return executeSimpleMutation({
        entityName: 'PaymentRequest',
        entityId: input.requestId,
        actorId: input.adminId,
        actorRole: 'ADMIN',
        auditAction: 'PAYMENT_REJECTED',
        metadata: { targetUserId: input.userId, plan: input.requestedPlan, reason: input.reason },
        atomicMutation: async (tx) => {
            await tx.subscriptionPaymentRequest.update({
                where: { id: input.requestId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: input.reason,
                    approvedBy: input.adminId,
                    approvedAt: new Date(),
                },
            });

            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: input.userId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard/account/subscription',
                type: 'SUBSCRIPTION_REJECTED',
                title: 'Subscription Request Rejected',
                message: `Your upgrade to ${input.requestedPlan} was not approved. Reason: ${input.reason}`,
                relatedId: input.requestId,
            });
        },
    });
}

// ── Update Tour Payment Request ─────────────────────────────────────

async function updateTourPaymentRequest(requestId: string, data: any) {
    return prisma.tourPaymentRequest.update({ where: { id: requestId }, data });
}

// ── Create Plan Pricing ─────────────────────────────────────────────

interface CreatePlanPricingInput {
    plan: string; roleType: string; price: number; currency: string;
    period: string; description?: string; features?: any; tourLimit?: number;
    adminId: string;
}

async function createPlanPricing(input: CreatePlanPricingInput) {
    return executeSimpleMutation({
        entityName: 'PlanPricing',
        actorId: input.adminId,
        actorRole: 'ADMIN',
        auditAction: 'PLAN_PRICING_CREATED',
        metadata: { plan: input.plan, roleType: input.roleType, price: input.price, currency: input.currency },
        atomicMutation: async (tx) => {
            return (tx as any).planPricing.create({
                data: {
                    plan: input.plan, roleType: input.roleType, price: input.price,
                    currency: input.currency, period: input.period,
                    description: input.description || null,
                    features: input.features ? JSON.stringify(input.features) : null,
                    tourLimit: input.tourLimit ?? -1, active: true,
                },
            });
        },
    });
}

// ── Update Plan Pricing ─────────────────────────────────────────────

interface UpdatePlanPricingInput {
    pricingId: string; updateData: any; adminId: string;
    existingPlan: string; existingRoleType: string;
}

async function updatePlanPricing(input: UpdatePlanPricingInput) {
    return executeSimpleMutation({
        entityName: 'PlanPricing',
        entityId: input.pricingId,
        actorId: input.adminId,
        actorRole: 'ADMIN',
        auditAction: 'PLAN_PRICING_UPDATED',
        metadata: { plan: input.existingPlan, roleType: input.existingRoleType, changes: input.updateData },
        atomicMutation: async (tx) => {
            return (tx as any).planPricing.update({ where: { id: input.pricingId }, data: input.updateData });
        },
    });
}

// ── Deactivate Plan Pricing ─────────────────────────────────────────

async function deactivatePlanPricing(pricingId: string, adminId: string, plan: string, roleType: string) {
    return executeSimpleMutation({
        entityName: 'PlanPricing',
        entityId: pricingId,
        actorId: adminId,
        actorRole: 'ADMIN',
        auditAction: 'PLAN_PRICING_DEACTIVATED',
        metadata: { plan, roleType },
        atomicMutation: async (tx) => {
            await (tx as any).planPricing.update({ where: { id: pricingId }, data: { active: false } });
            return { ok: true };
        },
    });
}

// ── Create Operator Wallet ──────────────────────────────────────────

async function ensureOperatorWallet(operatorId: string) {
    return prisma.operatorWallet.create({
        data: { operatorId, availableBalance: 0, currency: 'VND' },
    });
}

// ── Create Escrow Top-Up Request ────────────────────────────────────

interface CreateTopUpRequestInput {
    operatorId: string; amount: number; walletId: string;
}

async function createTopUpRequest(input: CreateTopUpRequestInput) {
    return executeSimpleMutation({
        entityName: 'EscrowTopUpRequest',
        actorId: input.operatorId,
        actorRole: 'OPERATOR',
        auditAction: 'ESCROW_TOPUP_REQUESTED',
        metadata: { amount: input.amount },
        atomicMutation: async (tx) => {
            return tx.escrowTopUpRequest.create({
                data: {
                    operatorId: input.operatorId,
                    amount: input.amount,
                    status: 'PENDING',
                    currency: 'VND',
                },
            });
        },
        notification: async () => {
            const internalUsers = await prisma.user.findMany({
                where: { role: { name: { in: ['SUPER_ADMIN', 'FINANCE'] } } },
                select: { id: true },
            });

            for (const user of internalUsers) {
                await createDomainNotification({
                    userId: user.id,
                    domain: NotificationDomain.REVENUE,
                    targetUrl: '/dashboard/admin/finance/escrow/topups',
                    type: 'ESCROW_TOPUP_REQUEST',
                    title: 'New Escrow Top-Up Request',
                    message: `Operator requested ${input.amount.toLocaleString()} VND escrow top-up.`,
                });
            }
        },
    });
}

// ── Reconciliation Audit ────────────────────────────────────────────

interface ReconciliationAuditInput {
    alerts: any[]; results: any;
}

async function logReconciliationAudit(input: ReconciliationAuditInput) {
    return executeSimpleMutation({
        entityName: 'SYSTEM',
        entityId: 'reconciliation',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        auditAction: 'FINANCIAL_RECONCILIATION',
        metadata: { alertCount: input.alerts.length, alerts: input.alerts, results: input.results },
        atomicMutation: async (tx) => {
            await tx.auditLog.create({
                data: {
                    userId: 'SYSTEM',
                    action: 'FINANCIAL_RECONCILIATION',
                    targetType: 'SYSTEM',
                    targetId: 'reconciliation',
                    meta: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        alertCount: input.alerts.length,
                        metadata: { alerts: input.alerts, results: input.results },
                        ipAddress: 'cron',
                    }),
                },
            });

            return { ok: true };
        },
        notification: async () => {
            const admins = await prisma.user.findMany({
                where: { role: { name: { in: ['SUPER_ADMIN', 'FINANCE'] } } },
                select: { id: true },
            });

            if (admins.length > 0) {
                await createBulkDomainNotification({
                    userIds: admins.map(a => a.id),
                    domain: NotificationDomain.SYSTEM,
                    targetUrl: '/dashboard/admin/pilot',
                    type: 'SYSTEM_ALERT',
                    title: 'Financial Reconciliation Alert',
                    message: `${input.alerts.length} issue(s) found during nightly reconciliation.`,
                });
            }
        },
    });
}

// ── Document Reminder Notification ──────────────────────────────────

async function sendDocumentReminder(operatorId: string, tourId: string, tourTitle: string) {
    return executeSimpleMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        atomicMutation: async () => {
            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/request/${tourId}`,
                type: 'DOCUMENT_REMINDER',
                title: 'Document Reminder',
                message: `Please ensure all required documents are uploaded for "${tourTitle}" before departure.`,
                relatedId: tourId,
            });
        },
    });
}

// ── Guide Application Notification ──────────────────────────────────

async function notifyGuideApplication(operatorId: string, tourId: string, tourTitle: string) {
    return executeSimpleMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        atomicMutation: async () => {
            return { ok: true };
        },
        notification: async () => {
            await createDomainNotification({
                userId: operatorId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/request/${tourId}`,
                type: 'NEW_APPLICATION',
                title: 'New Guide Application',
                message: `A guide has applied to your tour "${tourTitle}".`,
                relatedId: tourId,
            });
        },
    });
}

// ── Bulk Onboard Referral Mutations ─────────────────────────────────

async function bulkOnboardCreateReferral(referrerId: string, referredEmail: string) {
    return prisma.referral.create({
        data: { referrerId, referredEmail, rewardType: 'TEAM_AFFILIATION', status: 'PENDING' },
    });
}

async function bulkOnboardRefreshReferral(referralId: string) {
    return prisma.referral.update({
        where: { id: referralId },
        data: { createdAt: new Date(), status: 'PENDING' },
    });
}

async function bulkOnboardNotifyInternal(pendingCount: number, declarationType: string) {
    return executeSimpleMutation({
        entityName: 'SYSTEM',
        entityId: 'bulk-onboard',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        atomicMutation: async () => {
            return { ok: true };
        },
        notification: async () => {
            const internalUsers = await prisma.user.findMany({
                where: { role: { name: { in: ['OPS', 'SUPER_ADMIN'] } } },
                select: { id: true },
            });

            for (const user of internalUsers) {
                await createDomainNotification({
                    userId: user.id,
                    domain: NotificationDomain.GOVERNANCE,
                    targetUrl: '/dashboard/admin/governance',
                    type: 'BULK_CONTRACT_REVIEW',
                    title: 'Bulk Onboarding Review Required',
                    message: `Operator requested bulk onboarding of ${pendingCount} guides. Declaration type: ${declarationType}`,
                });
            }
        },
    });
}

export const PaymentDomain = {
    createSubscriptionPaymentRequest,
    uploadPaymentProof,
    rejectSubscriptionPayment,
    updateTourPaymentRequest,
    createPlanPricing,
    updatePlanPricing,
    deactivatePlanPricing,
    ensureOperatorWallet,
    createTopUpRequest,
    logReconciliationAudit,
    sendDocumentReminder,
    notifyGuideApplication,
    bulkOnboardCreateReferral,
    bulkOnboardRefreshReferral,
    bulkOnboardNotifyInternal,
};
