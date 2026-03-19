import { findTourCompat, enrichTourCompat, getAssignedGuideId } from '@/lib/tour-compat';
/**
 * FinanceDomain — Mutation Boundary for ALL Financial Operations
 *
 * ALL financial mutations (topups, withdrawals, escrow, payments, wallet ops)
 * MUST go through this service. Route layer calls these functions only.
 *
 * Each function preserves the exact existing logic, invariants, and audit behavior.
 * Prisma is ONLY accessed inside this file.
 */

import { prisma } from '@/lib/prisma';
import { creditWallet, debitWallet, syncWalletBalances, getAvailableBalance } from '@/lib/ledger';
import { EscrowLedgerType } from '@prisma/client';
import { PAYMENT_REQUEST_MACHINE, WITHDRAW_REQUEST_MACHINE, ESCROW_MACHINE, TOUR_MACHINE } from '@/lib/state-machine';
import { AUDIT_ACTIONS, ENTITY_TYPES, snapshotRecord } from '@/domain/governance/AuditService';
import { executeGovernedMutation } from '@/domain/governance/executeGovernedMutation';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import { triggerPolicyNotification } from '@/domain/notification/NotificationPolicy';
import { createDomainNotification, createDomainNotificationTx, createBulkDomainNotification, NotificationDomain } from '@/domain/notification/NotificationService';
import { logFinancialAudit } from '@/lib/audit';
import { safeJsonParse } from '@/src/lib/safe-json';
import { assertWalletLedgerConsistency, assertEscrowReleaseIntegrity, assertCommissionIntegrity, assertEscrowHoldIntegrity } from '@/domain/finance/EscrowInvariant';
import { assertCanReleaseEscrow, assertCanRefundEscrow, assertCanHoldEscrow, assertCanApproveWithdraw } from '@/domain/finance/EscrowStateGuard';
import { calculateCommissionForOperator, persistCommission } from '@/domain/finance/CommissionService';
import { getTrustMax, computeComplianceLevel, isOperatorProfileComplete } from '@/domain/operator/OperatorGovernance';
import { getEffectiveLayers, getOperatorModeInfo, hasLayer, type OperatorModeInfo } from '@/domain/system-mode/system-mode';
import { evaluateOperatorRisk, persistRiskEvaluation } from '@/domain/risk/RiskEngine';
import { checkAdminMassApproval, checkWithdrawFrequency, checkSuspiciousAmount } from '@/lib/risk';
import { createTourEvent, TOUR_EVENT_TYPES, ACTOR_ROLES } from '@/lib/tour-events';
import {
    CancellationType, CancellationTiming, EscrowResolutionType,
    getMutualTrustImpact, buildCancellationContext,
    CANCELLATION_STATUSES, CANCELLATION_REFUND_REASONS,
    FaultParty, isValidFaultParty, requiresSupervisorApproval,
    getForceTrustImpact, getHarmedPartyId, SUPERHERO_MODE,
} from '@/lib/cancellation';
import {
    RefundReason, isValidRefundReason, requiresDualApproval, getTrustImpact, REFUND_TRUST_MATRIX,
} from '@/lib/escrow';

// Re-export from lib/escrow if needed
let _escrowLib: any = null;
async function getEscrowLib() {
    if (!_escrowLib) {
        _escrowLib = await import('@/lib/escrow');
    }
    return _escrowLib;
}

// ══════════════════════════════════════════════════════════════════════
// TOPUP APPROVE
// ══════════════════════════════════════════════════════════════════════

interface ApproveTopupInput {
    requestId: string;
    actorId: string;
    actorRole: string;
    ipAddress: string;
}

export async function approveTopup(input: ApproveTopupInput) {
    const { requestId, actorId, actorRole, ipAddress } = input;

    const request = await prisma.topUpRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');
    const beforeState = snapshotRecord(request);

    const result = await executeGovernedMutation({
        entityName: ENTITY_TYPES.TOPUP_REQUEST,
        entityId: requestId,
        actorId, actorRole,
        stateMachine: PAYMENT_REQUEST_MACHINE,
        fromState: request.status,
        toState: 'APPROVED',
        auditAction: AUDIT_ACTIONS.TOPUP_APPROVED,
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord({ ...r.updatedRequest, status: 'APPROVED' }),
        metadata: { amount: request.amount },
        ipAddress,
        atomicMutation: async (tx) => {
            let wallet = await tx.operatorWallet.findUnique({ where: { operatorId: request.operatorId } });
            if (!wallet) {
                wallet = await tx.operatorWallet.create({ data: { operatorId: request.operatorId } });
            }

            const updatedRequest = await tx.escrowTopUpRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED', reviewedBy: actorId, reviewedAt: new Date() },
            });

            const transaction = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id, type: 'TOP_UP', amount: request.amount, status: 'COMPLETED',
                    description: `Top-up Approved (Ref: ${request.paymentReference || 'N/A'})`,
                    metadata: JSON.stringify({ requestId: request.id, approvedBy: actorId }),
                },
            });

            await creditWallet(tx, {
                walletId: wallet.id, type: EscrowLedgerType.ESCROW_TOPUP,
                amount: request.amount, referenceId: requestId,
                metadata: { approvedBy: actorId },
            });

            await syncWalletBalances(tx, wallet.id);

            await tx.escrowTopUpRequest.update({
                where: { id: requestId },
                data: { transactionId: transaction.id },
            });

            return { updatedRequest, transaction };
        },
        notification: async () => {
            await triggerPolicyNotification('TOPUP_APPROVED', {
                operatorId: request.operatorId,
                amount: request.amount,
                requestId,
            });
        },
    });

    return { transactionId: result.transaction.id };
}

// ══════════════════════════════════════════════════════════════════════
// TOPUP REJECT
// ══════════════════════════════════════════════════════════════════════

interface RejectTopupInput {
    requestId: string;
    reason: string;
    actorId: string;
    actorRole: string;
    ipAddress: string;
}

export async function rejectTopup(input: RejectTopupInput) {
    const { requestId, reason, actorId, actorRole, ipAddress } = input;

    const request = await prisma.topUpRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');
    const beforeState = snapshotRecord(request);

    await executeGovernedMutation({
        entityName: ENTITY_TYPES.TOPUP_REQUEST,
        entityId: requestId,
        actorId, actorRole,
        stateMachine: PAYMENT_REQUEST_MACHINE,
        fromState: request.status,
        toState: 'REJECTED',
        auditAction: AUDIT_ACTIONS.TOPUP_REJECTED,
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord({ ...r, status: 'REJECTED' }),
        metadata: { amount: request.amount, reason, operatorId: request.operatorId },
        ipAddress,
        atomicMutation: async (tx) => {
            return tx.escrowTopUpRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED', rejectionReason: reason, reviewedBy: actorId, reviewedAt: new Date() },
            });
        },
        notification: async () => {
            await triggerPolicyNotification('TOPUP_REJECTED', {
                operatorId: request.operatorId, reason, requestId,
            });
        },
    });

    return {};
}

// ══════════════════════════════════════════════════════════════════════
// WITHDRAWAL APPROVE
// ══════════════════════════════════════════════════════════════════════

interface ApproveWithdrawalInput {
    requestId: string;
    proofUrl: string | null;
    actorId: string;
    actorRole: string;
    ipAddress: string;
}

export async function approveWithdrawal(input: ApproveWithdrawalInput) {
    const { requestId, proofUrl, actorId, actorRole, ipAddress } = input;

    const request = await prisma.withdrawalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');
    if (request.status !== 'PENDING') throw new Error('Request already processed');
    const beforeState = snapshotRecord(request);

    await executeGovernedMutation({
        entityName: ENTITY_TYPES.WITHDRAW_REQUEST,
        entityId: requestId,
        actorId, actorRole,
        auditAction: AUDIT_ACTIONS.WITHDRAW_APPROVED,
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord({ ...r, status: 'PAID' }),
        metadata: { amount: request.amount, operatorId: request.operatorId, proofUrl },
        ipAddress,
        invariants: [
            async (tx) => {
                const wallet = await tx.operatorWallet.findUnique({ where: { operatorId: request.operatorId } });
                if (wallet) await assertCanApproveWithdraw(tx, wallet.id);
            },
        ],
        atomicMutation: async (tx) => {
            const updatedRequest = await tx.escrowWithdrawRequest.update({
                where: { id: requestId },
                data: { status: 'PAID', proofUrl, reviewedBy: actorId, reviewedAt: new Date() },
            });

            if (request.transactionId) {
                await tx.walletTransaction.update({
                    where: { id: request.transactionId },
                    data: {
                        status: 'COMPLETED',
                        metadata: JSON.stringify({
                            approvedBy: actorId, approvedAt: new Date().toISOString(),
                            proofUrl: proofUrl || null,
                        }),
                    },
                });
            }

            return updatedRequest;
        },
        notification: async () => {
            await triggerPolicyNotification('WITHDRAW_APPROVED', {
                operatorId: request.operatorId,
                amount: request.amount,
                requestId: request.transactionId!,
            });
        },
    });

    return {};
}

// ══════════════════════════════════════════════════════════════════════
// WITHDRAWAL REJECT
// ══════════════════════════════════════════════════════════════════════

interface RejectWithdrawalInput {
    requestId: string;
    reason: string;
    actorId: string;
    actorRole: string;
    ipAddress: string;
}

export async function rejectWithdrawal(input: RejectWithdrawalInput) {
    const { requestId, reason, actorId, actorRole, ipAddress } = input;

    const request = await prisma.withdrawalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');
    const beforeState = snapshotRecord(request);

    await executeGovernedMutation({
        entityName: ENTITY_TYPES.WITHDRAW_REQUEST,
        entityId: requestId,
        actorId, actorRole,
        stateMachine: WITHDRAW_REQUEST_MACHINE,
        fromState: request.status,
        toState: 'REJECTED',
        auditAction: AUDIT_ACTIONS.WITHDRAW_REJECTED,
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord({ ...r, status: 'REJECTED' }),
        metadata: { amount: request.amount, reason, operatorId: request.operatorId },
        ipAddress,
        atomicMutation: async (tx) => {
            const updatedRequest = await tx.escrowWithdrawRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED', rejectionReason: reason, reviewedBy: actorId, reviewedAt: new Date() },
            });

            const wallet = await tx.operatorWallet.findUnique({ where: { operatorId: request.operatorId } });
            if (wallet) {
                await creditWallet(tx, {
                    walletId: wallet.id, type: EscrowLedgerType.SYSTEM_ADJUSTMENT,
                    amount: request.amount, referenceId: requestId,
                    metadata: { reason: 'WITHDRAWAL_REJECTED', rejectionReason: reason },
                });
                await syncWalletBalances(tx, wallet.id);
            }

            if (request.transactionId) {
                await tx.walletTransaction.update({
                    where: { id: request.transactionId },
                    data: {
                        status: 'FAILED',
                        description: `Withdrawal Rejected: ${reason}`,
                        metadata: JSON.stringify({
                            ...safeJsonParse((await tx.walletTransaction.findUnique({ where: { id: request.transactionId } }))?.metadata),
                            rejectionReason: reason, rejectedBy: actorId,
                        }),
                    },
                });
            }

            return updatedRequest;
        },
        notification: async () => {
            await triggerPolicyNotification('WITHDRAW_REJECTED', {
                operatorId: request.operatorId,
                amount: request.amount,
                reason, requestId: request.transactionId!,
            });
        },
    });

    return {};
}

// ══════════════════════════════════════════════════════════════════════
// CREATE WITHDRAWAL REQUEST (Operator)
// ══════════════════════════════════════════════════════════════════════

interface CreateWithdrawalInput {
    operatorId: string;
    operatorRole: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    ipAddress: string;
}

export async function createWithdrawalRequest(input: CreateWithdrawalInput) {
    const { operatorId, operatorRole, amount, bankName, accountNumber, accountName, ipAddress } = input;

    const wallet = await prisma.wallet.findUnique({ where: { operatorId } });
    if (!wallet) throw new Error('WALLET_NOT_FOUND');
    const beforeState = snapshotRecord(wallet);

    const result = await executeGovernedMutation({
        entityName: ENTITY_TYPES.WITHDRAW_REQUEST,
        entityId: 'new',
        actorId: operatorId,
        actorRole: operatorRole,
        auditAction: AUDIT_ACTIONS.WITHDRAW_REQUESTED,
        auditBefore: beforeState,
        auditAfter: (r: any) => snapshotRecord({ ...wallet, availableBalance: wallet.availableBalance - amount }),
        metadata: { amount, bankName },
        ipAddress,
        invariants: [
            async (tx) => {
                const dedupeWindow = new Date(Date.now() - 5_000);
                const duplicate = await tx.escrowWithdrawRequest.findFirst({
                    where: { operatorId, amount, createdAt: { gte: dedupeWindow } },
                    orderBy: { createdAt: 'desc' },
                });
                if (duplicate) throw new Error('DUPLICATE_REQUEST');
            },
        ],
        atomicMutation: async (tx) => {
            await debitWallet(tx, {
                walletId: wallet.id, type: EscrowLedgerType.ESCROW_WITHDRAW,
                amount, metadata: { bankName, accountNumber, accountName },
            });

            await syncWalletBalances(tx, wallet.id);

            const withdrawRequest = await tx.escrowWithdrawRequest.create({
                data: { operatorId, amount, bankName, accountNumber, accountName, status: 'PENDING' },
            });

            const transaction = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id, type: 'PAYOUT', amount: -amount, status: 'PENDING',
                    description: `Withdrawal to ${bankName} (${accountNumber})`,
                    metadata: JSON.stringify({ bankName, accountNumber, accountName, requestedAt: new Date().toISOString() }),
                },
            });

            await tx.escrowWithdrawRequest.update({
                where: { id: withdrawRequest.id },
                data: { transactionId: transaction.id },
            });

            await assertWalletLedgerConsistency(tx, wallet.id);

            return { wallet, withdrawRequest, transaction };
        },
        notification: async () => {
            const internalUsers = await prisma.user.findMany({
                where: { role: { name: { in: ['FINANCE', 'OPS', 'SUPER_ADMIN'] } } },
                select: { id: true },
            });
            if (internalUsers.length > 0) {
                await createBulkDomainNotification({
                    userIds: internalUsers.map(u => u.id),
                    domain: NotificationDomain.ESCROW,
                    targetUrl: '/dashboard/admin/finance/escrow/withdrawals',
                    type: 'WITHDRAWAL_REQUEST',
                    title: 'Withdrawal Request',
                    message: `Operator requested withdrawal of ${amount.toLocaleString()} VND.`,
                });
            }
            await checkWithdrawFrequency(operatorId);
            await checkSuspiciousAmount(operatorId, amount, 'WITHDRAW');
        },
    });

    return { transaction: result.transaction };
}

// ══════════════════════════════════════════════════════════════════════
// CANCEL WITHDRAWAL (Operator)
// ══════════════════════════════════════════════════════════════════════

interface CancelWithdrawalInput {
    requestId: string;
    operatorId: string;
    operatorRole: string;
    ipAddress: string;
}

export async function cancelWithdrawal(input: CancelWithdrawalInput) {
    const { requestId, operatorId, operatorRole, ipAddress } = input;

    let request = await prisma.withdrawalRequest.findFirst({ where: { transactionId: requestId } });
    if (!request) {
        request = await prisma.withdrawalRequest.findUnique({ where: { id: requestId } });
    }
    if (!request) throw new Error('REQUEST_NOT_FOUND');
    if (request.operatorId !== operatorId) throw new Error('FORBIDDEN');
    if (request.status !== 'PENDING') throw new Error('NOT_PENDING');

    await executeGovernedMutation({
        entityName: ENTITY_TYPES.WITHDRAW_REQUEST,
        entityId: requestId,
        actorId: operatorId,
        actorRole: operatorRole,
        auditAction: AUDIT_ACTIONS.WITHDRAW_CANCELLED,
        auditBefore: { status: 'PENDING' },
        auditAfter: () => ({ status: 'CANCELLED' }),
        metadata: { amount: request.amount, transactionId: request.transactionId },
        ipAddress,
        atomicMutation: async (tx) => {
            const updatedRequest = await tx.escrowWithdrawRequest.update({
                where: { id: request!.id },
                data: { status: 'CANCELLED', reviewedAt: new Date() },
            });

            const wallet = await tx.operatorWallet.findUnique({ where: { operatorId } });
            if (wallet) {
                await creditWallet(tx, {
                    walletId: wallet.id, type: EscrowLedgerType.SYSTEM_ADJUSTMENT,
                    amount: request!.amount, referenceId: requestId,
                    metadata: { reason: 'WITHDRAW_CANCELLED' },
                });
                await syncWalletBalances(tx, wallet.id);
            }

            if (request!.transactionId) {
                await tx.walletTransaction.update({
                    where: { id: request!.transactionId },
                    data: {
                        status: 'FAILED', description: `Withdrawal cancelled by operator`,
                        metadata: JSON.stringify({ cancelledBy: operatorId, cancelledAt: new Date().toISOString() }),
                    },
                });
            }

            return updatedRequest;
        },
        notification: async () => {
            await triggerPolicyNotification('WITHDRAW_CANCELLED', {
                operatorId, amount: request!.amount, requestId,
            });
        },
    });

    return {};
}

// ══════════════════════════════════════════════════════════════════════
// ADMIN WALLET TOP-UP (approve pending or direct)
// ══════════════════════════════════════════════════════════════════════

interface AdminWalletTopUpInput {
    walletId: string;
    actorId: string;
    actorRole: string;
    transactionId?: string;
    amount?: number;
    paymentReference?: string;
    notes?: string;
}

export async function adminWalletTopUp(input: AdminWalletTopUpInput) {
    const { walletId, actorId, actorRole, transactionId, amount, paymentReference, notes } = input;

    if (transactionId) {
        // Approving existing pending transaction
        const transaction = await prisma.walletTransaction.findUnique({
            where: { id: transactionId },
            include: { wallet: true },
        });
        if (!transaction) throw new Error('Transaction not found');
        if (transaction.status !== 'PENDING') throw new Error('Transaction already processed');

        await executeGovernedMutation({
            entityName: 'WalletTransaction',
            entityId: transactionId,
            actorId, actorRole,
            auditAction: AUDIT_ACTIONS.TOPUP_APPROVED,
            auditBefore: snapshotRecord(transaction),
            auditAfter: () => ({ status: 'COMPLETED', amount: transaction.amount }),
            metadata: { amount: transaction.amount, walletId: transaction.walletId, paymentReference },
            atomicMutation: async (tx) => {
                await tx.walletTransaction.update({
                    where: { id: transactionId },
                    data: {
                        status: 'COMPLETED', processedAt: new Date(), processedBy: actorId,
                        metadata: JSON.stringify({
                            ...safeJsonParse(transaction.metadata),
                            approvedBy: actorId, approvedAt: new Date().toISOString(), paymentReference,
                        }),
                    },
                });

                await creditWallet(tx, {
                    walletId: transaction.walletId, type: EscrowLedgerType.ESCROW_TOPUP,
                    amount: transaction.amount, referenceId: transactionId,
                    metadata: { paymentReference, approvedBy: actorId },
                });

                await syncWalletBalances(tx, transaction.walletId);
                return transaction;
            },
            notification: async () => {
                await createDomainNotification({
                    userId: transaction.wallet.operatorId,
                    domain: NotificationDomain.ESCROW,
                    targetUrl: '/dashboard/operator/wallet',
                    type: 'TOP_UP_APPROVED',
                    title: 'Wallet Top-up Confirmed',
                    message: `Your top-up of ${transaction.amount.toLocaleString()} VND has been confirmed.`,
                });
                await checkAdminMassApproval(actorId);
            },
        });

        return { message: `Top-up of ${transaction.amount.toLocaleString()} VND approved` };
    }

    // Direct top-up
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new Error('Valid amount required');
    }

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');

    await executeGovernedMutation({
        entityName: 'OperatorWallet',
        entityId: walletId,
        actorId, actorRole,
        auditAction: AUDIT_ACTIONS.TOPUP_APPROVED,
        auditBefore: snapshotRecord(wallet),
        auditAfter: () => ({ amount, paymentReference, directTopUp: true }),
        metadata: { amount, paymentReference },
        atomicMutation: async (tx) => {
            await tx.walletTransaction.create({
                data: {
                    walletId, type: 'TOP_UP', amount, status: 'COMPLETED',
                    description: `Admin top-up: ${amount.toLocaleString()} VND`,
                    processedAt: new Date(), processedBy: actorId,
                    metadata: JSON.stringify({ paymentReference, notes, directTopUp: true }),
                },
            });

            await creditWallet(tx, {
                walletId, type: EscrowLedgerType.ESCROW_TOPUP, amount,
                metadata: { paymentReference, notes, directTopUp: true },
            });

            await syncWalletBalances(tx, walletId);
            await assertWalletLedgerConsistency(tx, walletId);
            return wallet;
        },
        notification: async () => {
            await createDomainNotification({
                userId: wallet.operatorId,
                domain: NotificationDomain.ESCROW,
                targetUrl: '/dashboard/operator/wallet',
                type: 'TOP_UP_APPROVED',
                title: 'Wallet Credited',
                message: `${amount.toLocaleString()} VND has been added to your wallet.`,
            });
        },
    });

    return { message: `${amount.toLocaleString()} VND credited to wallet` };
}

// ══════════════════════════════════════════════════════════════════════
// PAYMENT APPROVE (Subscription Payment)
// ══════════════════════════════════════════════════════════════════════

interface ApprovePaymentInput {
    requestId: string;
    actorId: string;
    actorRole: string;
}

export async function approvePayment(input: ApprovePaymentInput) {
    const { requestId, actorId, actorRole } = input;

    const paymentRequest = await prisma.payment.findUnique({ where: { id: requestId } });
    if (!paymentRequest) throw new Error('Payment request not found');

    const user = await prisma.user.findUnique({ where: { id: paymentRequest.userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();
    const expiresAt = new Date(now.getTime() + paymentRequest.durationDays * 24 * 60 * 60 * 1000);
    const beforeState = snapshotRecord(paymentRequest);

    await executeGovernedMutation({
        entityName: 'SubscriptionPayment',
        entityId: requestId,
        actorId, actorRole,
        stateMachine: PAYMENT_REQUEST_MACHINE,
        fromState: paymentRequest.status,
        toState: 'APPROVED',
        auditAction: 'PAYMENT_APPROVED',
        auditBefore: beforeState,
        auditAfter: () => ({ status: 'APPROVED', plan: paymentRequest.requestedPlan, duration: paymentRequest.durationDays }),
        metadata: { userId: paymentRequest.userId, plan: paymentRequest.requestedPlan, amount: paymentRequest.amount },
        atomicMutation: async (tx) => {
            await tx.subscriptionPaymentRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED', approvedBy: actorId, approvedAt: now },
            });
            await tx.user.update({
                where: { id: paymentRequest.userId },
                data: { plan: paymentRequest.requestedPlan, planStartAt: now, planExpiresAt: expiresAt },
            });
            await tx.userPlanHistory.create({
                data: {
                    userId: paymentRequest.userId,
                    oldPlan: user.plan,
                    newPlan: paymentRequest.requestedPlan,
                    reason: `Payment approved (${paymentRequest.durationDays} days)`,
                    actorId,
                },
            });
            return { planExpiresAt: expiresAt };
        },
        notification: async () => {
            await createDomainNotification({
                userId: paymentRequest.userId,
                domain: NotificationDomain.SYSTEM,
                targetUrl: '/dashboard/account/subscription',
                type: 'SUBSCRIPTION_APPROVED',
                title: 'Subscription Approved',
                message: `Your upgrade to ${paymentRequest.requestedPlan} has been approved. Your new plan is now active.`,
                relatedId: requestId,
            });
        },
    });

    return { planExpiresAt: expiresAt };
}

// ══════════════════════════════════════════════════════════════════════
// PUBLISH TOUR (Escrow hold + status transition)
// ══════════════════════════════════════════════════════════════════════

interface PublishTourInput {
    requestId: string;
    userId: string;
    userRole: string;
    operatorModeInfo: { systemMode: string; enabledLayers: string[] };
}

export async function publishTour(input: PublishTourInput) {
    const { requestId, userId, userRole, operatorModeInfo } = input;

    const request = await findTourCompat({ id: requestId });
    if (!request) throw new Error('Request not found');
    if (request.operatorId !== userId) throw new Error('Forbidden');
    const beforeState = snapshotRecord(request);

    // Recalculate payout from rolesNeeded
    let payoutAmount = request.totalPayout;
    if (request.rolesNeeded) {
        try {
            const roles = JSON.parse(request.rolesNeeded);
            if (Array.isArray(roles) && roles.length > 0) {
                const recalculated = roles.reduce((sum: number, r: any) => sum + ((r.quantity || 0) * (r.rate || 0)), 0);
                if (recalculated !== payoutAmount) payoutAmount = recalculated;
            }
        } catch { /* ignore parse errors */ }
    }

    if (!payoutAmount || payoutAmount <= 0) {
        throw new Error('Payout amount is required before publishing');
    }

    const finalPayoutAmount: number = payoutAmount;
    const modeInfo: OperatorModeInfo = operatorModeInfo as any;
    const escrowRequired = hasLayer(modeInfo, 'ESCROW_ENABLED');

    const result = await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: requestId,
        actorId: userId,
        actorRole: userRole,
        stateMachine: TOUR_MACHINE,
        fromState: request.status,
        toState: 'PUBLISHED',
        auditAction: escrowRequired ? 'ESCROW_HELD' : 'INTERNAL_SETTLEMENT',
        auditBefore: beforeState,
        auditAfter: (r: any) => ({ status: 'PUBLISHED', escrowAmount: escrowRequired ? finalPayoutAmount : 0 }),
        metadata: { previousStatus: request.status, systemMode: modeInfo.systemMode, escrowRequired },
        invariants: escrowRequired ? [
            async (tx) => await assertCanHoldEscrow(tx, requestId),
        ] : [],
        atomicMutation: async (tx) => {
            if (escrowRequired) {
                let wallet = await tx.operatorWallet.findUnique({ where: { operatorId: userId } });
                if (!wallet) {
                    wallet = await tx.operatorWallet.create({ data: { operatorId: userId } });
                }

                const availBalance = await getAvailableBalance(tx, wallet.id);
                if (availBalance < finalPayoutAmount) {
                    throw new Error(`INSUFFICIENT_BALANCE:${finalPayoutAmount}:${availBalance}`);
                }

                const holdTransaction = await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id, type: 'HOLD', amount: finalPayoutAmount,
                        relatedTourId: requestId, status: 'COMPLETED',
                        description: `Escrow hold for tour: ${request.title}`,
                        processedAt: new Date(), metadata: JSON.stringify({ tourTitle: request.title }),
                    },
                });

                await debitWallet(tx, {
                    walletId: wallet.id, type: EscrowLedgerType.ESCROW_HOLD,
                    amount: finalPayoutAmount, referenceId: requestId,
                    metadata: { tourTitle: request.title, holdTransactionId: holdTransaction.id },
                });

                await syncWalletBalances(tx, wallet.id);

                const updated = await tx.serviceRequest.update({
                    where: { id: requestId },
                    data: {
                        status: 'PUBLISHED', settlementType: 'ESCROW',
                        escrowHoldId: holdTransaction.id, escrowStatus: 'HELD',
                        escrowHeldAt: new Date(), totalPayout: finalPayoutAmount, updatedAt: new Date(),
                    },
                });

                await assertEscrowHoldIntegrity(tx, requestId);
                await assertWalletLedgerConsistency(tx, wallet.id);

                return { holdTransaction, updated };
            } else {
                const updated = await tx.serviceRequest.update({
                    where: { id: requestId },
                    data: {
                        status: 'PUBLISHED', settlementType: 'INTERNAL',
                        escrowStatus: null, totalPayout: finalPayoutAmount, updatedAt: new Date(),
                    },
                });
                return { holdTransaction: null, updated };
            }
        },
        notification: async () => {
            await createTourEvent({
                tourId: requestId, actorId: userId, actorRole: ACTOR_ROLES.OPERATOR,
                eventType: TOUR_EVENT_TYPES.TOUR_PUBLISHED,
                metadata: { escrowHeld: escrowRequired ? finalPayoutAmount : 0, systemMode: modeInfo.systemMode },
            });
        },
    });

    return {
        updated: result.updated,
        holdTransaction: result.holdTransaction,
        escrowRequired,
        finalPayoutAmount,
    };
}

// ══════════════════════════════════════════════════════════════════════
// ESCROW RELEASE
// ══════════════════════════════════════════════════════════════════════

interface ReleaseEscrowInput {
    tourId: string;
    actorId: string;
    actorRole: string;
    notes?: string;
    ipAddress: string;
}

export async function releaseEscrow(input: ReleaseEscrowInput) {
    const { tourId, actorId, actorRole, notes, ipAddress } = input;

    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        include: {
            escrowTransaction: true,
            conflicts: { where: { status: { not: 'RESOLVED' } } },
            operator: {
                select: {
                    id: true, trustScore: true, plan: true,
                    operatorCategory: true, systemMode: true,
                    enabledLayers: true, kybStatus: true,
                },
            },
            applications: {
                where: { status: 'ACCEPTED' }, take: 1,
                include: { guide: { select: { id: true, guideMode: true, trustScore: true } } },
            },
        },
    }));

    const beforeState = snapshotRecord(tour);
    if (!tour) throw new Error('Tour not found');

    if (!['COMPLETED', 'CLOSED'].includes(tour.status)) {
        throw new Error('Cannot release: tour must be COMPLETED or CLOSED');
    }
    if (tour.conflicts.length > 0) {
        throw new Error(`Cannot release: ${tour.conflicts.length} unresolved conflict(s)`);
    }
    if (!tour.escrowTransaction) throw new Error('No escrow transaction found');

    const grossAmount = tour.escrowTransaction.amount;
    const wallet = await prisma.wallet.findUnique({ where: { id: tour.escrowTransaction.walletId } });
    if (!wallet) throw new Error('Wallet not found');

    // Layer consistency warning
    const operatorInfo = tour.operator;
    if (operatorInfo) {
        const modeInfo: OperatorModeInfo = { systemMode: operatorInfo.systemMode, enabledLayers: operatorInfo.enabledLayers };
        const effectiveLayers = getEffectiveLayers(modeInfo);
        if (!effectiveLayers.includes('ESCROW_ENABLED')) {
            console.warn(`[ESCROW_RELEASE] Layer inconsistency: operator ${tour.operatorId} no longer has ESCROW_ENABLED`);
        }
    }

    // Commission calculation
    const acceptedApp = (tour as any).applications?.[0];
    const guideMode = acceptedApp?.guide?.guideMode ?? null;
    const operatorPlan = operatorInfo?.plan || 'FREE';

    const commission = await calculateCommissionForOperator(grossAmount, operatorPlan, tour.operatorId, guideMode);
    const netAmount = grossAmount - commission.totalPlatformFee;

    // Commission Transparency Invariant
    const { assertCommissionTransparency } = await import('@/domain/finance/CommissionInvariant');
    assertCommissionTransparency({
        grossAmount, commissionRate: commission.commissionRate,
        commissionAmount: commission.totalPlatformFee, netPayout: netAmount, ledgerRefId: tour.id,
    });

    const result = await executeGovernedMutation({
        entityName: ENTITY_TYPES.ESCROW_HOLD,
        entityId: tour.id,
        actorId, actorRole,
        stateMachine: ESCROW_MACHINE,
        fromState: tour.escrowStatus || 'NONE',
        toState: 'RELEASED',
        auditAction: AUDIT_ACTIONS.ESCROW_RELEASED,
        auditBefore: beforeState,
        auditAfter: () => snapshotRecord({ ...tour, escrowStatus: 'RELEASED', escrowReleasedAt: new Date().toISOString() }),
        metadata: {
            grossAmount, netAmount, commission: commission.totalPlatformFee,
            commissionRate: commission.commissionRate, tourTitle: tour.title,
        },
        ipAddress,
        invariants: [
            async (tx) => await assertCanReleaseEscrow(tx, tour.id),
        ],
        atomicMutation: async (tx) => {
            const walletTx = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id, type: 'RELEASE', amount: netAmount,
                    relatedTourId: tour.id, status: 'COMPLETED',
                    description: `Escrow released for tour: ${tour.title}`,
                    processedAt: new Date(), processedBy: actorId,
                    metadata: JSON.stringify({
                        notes, holdTransactionId: tour.escrowHoldId, grossAmount,
                        commissionRate: commission.commissionRate,
                        platformCommission: commission.platformCommission,
                        vatOnCommission: commission.vatOnCommission,
                        totalPlatformFee: commission.totalPlatformFee, netAmount,
                    }),
                },
            });

            await creditWallet(tx, {
                walletId: wallet.id, type: EscrowLedgerType.ESCROW_RELEASE,
                amount: netAmount, referenceId: tour.id,
                metadata: { notes, tourTitle: tour.title, grossAmount, netAmount },
            });

            if (commission.totalPlatformFee > 0) {
                await persistCommission(tx, tour.id, tour.operatorId, tour.assignedGuideId, commission);
            }

            await syncWalletBalances(tx, wallet.id);

            await tx.serviceRequest.update({
                where: { id: tour.id },
                data: { escrowStatus: 'RELEASED', escrowReleasedAt: new Date() },
            });

            await assertEscrowReleaseIntegrity(tx, tour.id);
            await assertWalletLedgerConsistency(tx, wallet.id);
            await assertCommissionIntegrity(tx, tour.id);

            // Trust event for operator
            const opCategory = operatorInfo?.operatorCategory;
            const opTrustMax = getTrustMax(opCategory);
            const freshOp = await tx.user.findUnique({ where: { id: tour.operatorId }, select: { trustScore: true } });
            const currentOpTrust = freshOp?.trustScore ?? 0;
            const cappedOpTrust = Math.min(currentOpTrust + 3, opTrustMax);
            const opDelta = cappedOpTrust - currentOpTrust;

            if (opDelta > 0) {
                await tx.user.update({ where: { id: tour.operatorId }, data: { trustScore: cappedOpTrust } });
                await tx.trustEvent.create({
                    data: {
                        userId: tour.operatorId, changeValue: opDelta, newScore: cappedOpTrust,
                        type: 'PAYMENT_RELEASED', description: `Payment released for tour: ${tour.title}`,
                        relatedRequestId: tour.id,
                    },
                });
            }

            // Trust event for guide
            if (tour.assignedGuideId) {
                const freshGuide = await tx.user.findUnique({ where: { id: tour.assignedGuideId }, select: { trustScore: true } });
                const currentGuideTrust = freshGuide?.trustScore ?? 0;
                const cappedGuideTrust = Math.min(currentGuideTrust + 3, 100);
                const guideDelta = cappedGuideTrust - currentGuideTrust;

                if (guideDelta > 0) {
                    await tx.user.update({ where: { id: tour.assignedGuideId }, data: { trustScore: cappedGuideTrust } });
                    await tx.trustEvent.create({
                        data: {
                            userId: tour.assignedGuideId, changeValue: guideDelta, newScore: cappedGuideTrust,
                            type: 'PAYMENT_RECEIVED', description: `Payment released for completed tour: ${tour.title}`,
                            relatedRequestId: tour.id,
                        },
                    });
                }

                await createDomainNotificationTx(tx, {
                    userId: tour.assignedGuideId, domain: NotificationDomain.ESCROW,
                    targetUrl: '/dashboard/guide/earnings', type: 'PAYMENT_RELEASED',
                    title: 'Payment Released',
                    message: `Payment of ${netAmount.toLocaleString()} VND for "${tour.title}" has been released.`,
                    relatedId: tour.id,
                });
            }

            await createDomainNotificationTx(tx, {
                userId: tour.operatorId, domain: NotificationDomain.ESCROW,
                targetUrl: '/dashboard/operator/wallet', type: 'ESCROW_RELEASED',
                title: 'Escrow Released',
                message: `Escrow for "${tour.title}" has been released. Guide will receive payment.`,
                relatedId: tour.id,
            });

            // Risk recompute
            const riskResult = await evaluateOperatorRisk(tour.operatorId);
            const [completedTours, conflictCount, totalTours] = await Promise.all([
                tx.serviceRequest.count({ where: { operatorId: tour.operatorId, status: 'COMPLETED' } }),
                tx.conflict.count({ where: { OR: [{ filedById: tour.operatorId }, { receivedById: tour.operatorId }] } }),
                tx.serviceRequest.count({ where: { operatorId: tour.operatorId } }),
            ]);
            const disputeRate = totalTours > 0 ? conflictCount / totalTours : 0;
            const compLevel = computeComplianceLevel({
                kybStatus: operatorInfo?.kybStatus || 'NOT_STARTED', completedTours, disputeRate, riskLevel: riskResult.level,
            });
            await persistRiskEvaluation(tour.operatorId, riskResult.score, compLevel);

            return { walletTransactionId: walletTx.id };
        },
        notification: async () => {
            await checkAdminMassApproval(actorId);
        },
    });

    return { grossAmount, netAmount, commission };
}

// ══════════════════════════════════════════════════════════════════════
// ESCROW REFUND
// ══════════════════════════════════════════════════════════════════════

interface RefundEscrowInput {
    tourId: string;
    actorId: string;
    actorRole: string;
    reason: string;
    documentUrl?: string;
    secondApproverId?: string;
    ipAddress: string;
}

export async function refundEscrow(input: RefundEscrowInput) {
    const { tourId, actorId, actorRole, reason, documentUrl, secondApproverId, ipAddress } = input;

    const escrowLib = await getEscrowLib();
    const refundReason = reason as any;

    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        include: {
            escrowTransaction: true,
            operator: {
                select: {
                    id: true, trustScore: true, operatorCategory: true,
                    systemMode: true, enabledLayers: true, kybStatus: true,
                },
            },
        },
    }));

    const beforeState = snapshotRecord(tour);
    if (!tour) throw new Error('Tour not found');
    if (!tour.escrowTransaction) throw new Error('No escrow transaction found');

    const amount = tour.escrowTransaction.amount;
    const wallet = await prisma.wallet.findUnique({ where: { id: tour.escrowTransaction.walletId } });
    if (!wallet) throw new Error('Wallet not found');

    const trustImpact = getTrustImpact(refundReason);

    await executeGovernedMutation({
        entityName: ENTITY_TYPES.ESCROW_HOLD,
        entityId: tour.id,
        actorId, actorRole,
        stateMachine: ESCROW_MACHINE,
        fromState: tour.escrowStatus || 'NONE',
        toState: 'REFUNDED',
        auditAction: AUDIT_ACTIONS.ESCROW_REFUNDED,
        auditBefore: beforeState,
        auditAfter: () => snapshotRecord({ ...tour, escrowStatus: 'REFUNDED', escrowReleasedAt: new Date().toISOString() }),
        metadata: {
            amount, reason: refundReason, trustImpact,
            documentUrl: documentUrl || null, secondApproverId: secondApproverId || null,
            dualApprovalRequired: requiresDualApproval(refundReason),
        },
        ipAddress,
        invariants: [
            async (tx) => await assertCanRefundEscrow(tx, tour.id),
        ],
        atomicMutation: async (tx) => {
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id, type: 'REFUND', amount,
                    relatedTourId: tour.id, status: 'COMPLETED',
                    description: `Escrow refund: ${refundReason}`,
                    processedAt: new Date(), processedBy: actorId,
                    metadata: JSON.stringify({
                        reason: refundReason, documentUrl: documentUrl || null,
                        secondApproverId: secondApproverId || null,
                        trustImpact, holdTransactionId: tour.escrowHoldId,
                    }),
                },
            });

            await creditWallet(tx, {
                walletId: wallet.id, type: EscrowLedgerType.ESCROW_REFUND,
                amount, referenceId: tour.id,
                metadata: { reason: refundReason, tourTitle: tour.title },
            });

            await syncWalletBalances(tx, wallet.id);

            await tx.serviceRequest.update({
                where: { id: tour.id },
                data: { escrowStatus: 'REFUNDED', escrowReleasedAt: new Date() },
            });

            await assertWalletLedgerConsistency(tx, wallet.id);

            // Layer consistency warning
            const operatorInfo = tour.operator;
            if (operatorInfo) {
                const modeInfo: OperatorModeInfo = { systemMode: operatorInfo.systemMode, enabledLayers: operatorInfo.enabledLayers };
                const effectiveLayers = getEffectiveLayers(modeInfo);
                if (!effectiveLayers.includes('ESCROW_ENABLED')) {
                    console.warn(`[ESCROW_REFUND] Layer inconsistency: operator ${tour.operatorId} no longer has ESCROW_ENABLED`);
                }
            }

            // Trust impact - operator
            const opCategory = operatorInfo?.operatorCategory;
            const opTrustMax = getTrustMax(opCategory);

            if (trustImpact.operatorDelta !== 0) {
                const opData = await tx.user.findUnique({ where: { id: tour.operatorId }, select: { trustScore: true } });
                const currentOpScore = opData?.trustScore ?? 0;
                const newOpScore = Math.max(0, Math.min(opTrustMax, currentOpScore + trustImpact.operatorDelta));

                await tx.user.update({ where: { id: tour.operatorId }, data: { trustScore: newOpScore } });
                await tx.trustEvent.create({
                    data: {
                        userId: tour.operatorId, changeValue: newOpScore - currentOpScore, newScore: newOpScore,
                        type: `ESCROW_REFUNDED_${refundReason}`,
                        description: `${trustImpact.notes}: ${tour.title}`, relatedRequestId: tour.id,
                    },
                });
            }

            // Trust impact - guide
            if (trustImpact.guideDelta !== 0 && tour.assignedGuideId) {
                const guideData = await tx.user.findUnique({ where: { id: tour.assignedGuideId }, select: { trustScore: true } });
                const currentGuideScore = guideData?.trustScore ?? 0;
                const newGuideScore = Math.max(0, Math.min(100, currentGuideScore + trustImpact.guideDelta));

                await tx.user.update({ where: { id: tour.assignedGuideId }, data: { trustScore: newGuideScore } });
                await tx.trustEvent.create({
                    data: {
                        userId: tour.assignedGuideId, changeValue: newGuideScore - currentGuideScore, newScore: newGuideScore,
                        type: `ESCROW_REFUNDED_${refundReason}`,
                        description: `${trustImpact.notes}: ${tour.title}`, relatedRequestId: tour.id,
                    },
                });

                await createDomainNotificationTx(tx, {
                    userId: tour.assignedGuideId, domain: NotificationDomain.ESCROW,
                    targetUrl: '/dashboard/guide/earnings', type: 'ESCROW_REFUNDED',
                    title: 'Tour Escrow Refunded',
                    message: `Escrow for "${tour.title}" was refunded. Reason: ${refundReason}`,
                    relatedId: tour.id,
                });
            }

            // ESCROW_HELD reversal
            if (tour.status !== 'COMPLETED' && tour.status !== 'CLOSED') {
                const freshOp = await tx.user.findUnique({ where: { id: tour.operatorId }, select: { trustScore: true } });
                const currentOp = freshOp?.trustScore ?? 0;
                const reversedScore = Math.max(0, currentOp - 1);

                await tx.user.update({ where: { id: tour.operatorId }, data: { trustScore: reversedScore } });
                await tx.trustEvent.create({
                    data: {
                        userId: tour.operatorId, changeValue: -1, newScore: reversedScore,
                        type: 'ESCROW_HELD_REVERSED',
                        description: `Commitment signal reversed - tour did not complete: ${tour.title}`,
                        relatedRequestId: tour.id,
                    },
                });
            }

            await createDomainNotificationTx(tx, {
                userId: tour.operatorId, domain: NotificationDomain.ESCROW,
                targetUrl: '/dashboard/operator/wallet', type: 'ESCROW_REFUNDED',
                title: 'Escrow Refunded',
                message: `${amount.toLocaleString()} VND refunded for "${tour.title}". Reason: ${refundReason}`,
                relatedId: tour.id,
            });

            // Risk recompute
            const riskResult = await evaluateOperatorRisk(tour.operatorId);
            const [completedTours, conflictCount, totalTours] = await Promise.all([
                tx.serviceRequest.count({ where: { operatorId: tour.operatorId, status: 'COMPLETED' } }),
                tx.conflict.count({ where: { OR: [{ filedById: tour.operatorId }, { receivedById: tour.operatorId }] } }),
                tx.serviceRequest.count({ where: { operatorId: tour.operatorId } }),
            ]);
            const disputeRate = totalTours > 0 ? conflictCount / totalTours : 0;
            const compLevel = computeComplianceLevel({
                kybStatus: operatorInfo?.kybStatus || 'NOT_STARTED', completedTours, disputeRate, riskLevel: riskResult.level,
            });
            await persistRiskEvaluation(tour.operatorId, riskResult.score, compLevel);

            return { amount, reason: refundReason, trustImpact };
        },
    });

    return { amount, reason: refundReason, trustImpact };
}

// ══════════════════════════════════════════════════════════════════════
// ACCEPT MUTUAL CANCELLATION
// ══════════════════════════════════════════════════════════════════════

interface AcceptCancellationInput {
    tourId: string;
    userId: string;
}

export async function acceptCancellation(input: AcceptCancellationInput) {
    const { tourId, userId } = input;

    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        include: { escrowTransaction: true },
    }));
    if (!tour) throw new Error('Tour not found');
    if (tour.status !== CANCELLATION_STATUSES.PENDING_MUTUAL_CANCEL) throw new Error('No pending cancellation');
    if (tour.cancellationInitiator === userId) throw new Error('Cannot accept own cancellation');

    const isOperator = tour.operatorId === userId;
    const isGuide = tour.assignedGuideId === userId;
    if (!isOperator && !isGuide) throw new Error('FORBIDDEN');

    const timing = tour.cancellationTiming as CancellationTiming;
    const initiatorIsOperator = tour.cancellationInitiator === tour.operatorId;
    const tourWasAssigned = !!tour.assignedGuideId;
    const trustImpact = getMutualTrustImpact(timing, initiatorIsOperator, tourWasAssigned);

    const refundReason = timing === CancellationTiming.EARLY
        ? CANCELLATION_REFUND_REASONS.MUTUAL_CANCELLATION_EARLY
        : CANCELLATION_REFUND_REASONS.MUTUAL_CANCELLATION_LATE;

    const cancellationContext = buildCancellationContext(
        CancellationType.MUTUAL, timing, null, null, EscrowResolutionType.FULL_REFUND,
    );

    const operator = await prisma.user.findUnique({
        where: { id: tour.operatorId },
        select: { id: true, trustScore: true },
    });

    await executeGovernedMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId: userId,
        actorRole: isOperator ? 'OPERATOR' : 'GUIDE',
        auditAction: 'MUTUAL_CANCEL_ACCEPTED',
        auditBefore: snapshotRecord(tour),
        auditAfter: () => ({ status: 'CANCELLED', escrowStatus: 'REFUNDED' }),
        metadata: { timing, refundReason, trustImpact, tourWasAssigned, context: cancellationContext },
        atomicMutation: async (tx) => {
            await tx.serviceRequest.update({
                where: { id: tourId },
                data: { status: CANCELLATION_STATUSES.CANCELLED, escrowStatus: 'REFUNDED', escrowReleasedAt: new Date(), updatedAt: new Date() },
            });

            if (tour.escrowTransaction && tour.escrowStatus === 'HELD') {
                const wallet = await tx.operatorWallet.findUnique({ where: { id: tour.escrowTransaction.walletId } });
                if (wallet) {
                    await creditWallet(tx, {
                        walletId: wallet.id, type: EscrowLedgerType.ESCROW_REFUND,
                        amount: tour.escrowTransaction.amount, referenceId: tourId,
                        metadata: { reason: refundReason, timing, initiator: tour.cancellationInitiator, context: cancellationContext },
                    });
                    await syncWalletBalances(tx, wallet.id);
                }
            }

            // Trust impact for late + assigned
            if (timing === CancellationTiming.LATE && tourWasAssigned && tour.cancellationInitiator) {
                const initiatorId = tour.cancellationInitiator;
                const initiator = await tx.user.findUnique({ where: { id: initiatorId }, select: { trustScore: true } });
                const delta = initiatorIsOperator ? trustImpact.operatorDelta : trustImpact.guideDelta;

                if (delta !== 0 && initiator) {
                    const newScore = Math.max(0, Math.min(100, (initiator.trustScore || 0) + delta));
                    await tx.trustEvent.create({
                        data: {
                            userId: initiatorId, changeValue: delta, newScore,
                            type: 'MUTUAL_CANCEL_LATE_INITIATOR',
                            description: `Initiated late mutual cancellation for: ${tour.title} [${cancellationContext.escrowResolutionType}]`,
                            relatedRequestId: tourId,
                        },
                    });
                    await tx.user.update({ where: { id: initiatorId }, data: { trustScore: newScore } });
                }
            }

            // Reverse ESCROW_HELD trust
            if (operator) {
                await tx.trustEvent.create({
                    data: {
                        userId: tour.operatorId, changeValue: -1,
                        newScore: Math.max(0, (operator.trustScore || 0) - 1),
                        type: 'ESCROW_HELD_REVERSED',
                        description: `Commitment reversed - mutual cancellation: ${tour.title} [${cancellationContext.escrowResolutionType}]`,
                        relatedRequestId: tourId,
                    },
                });
                await tx.user.update({ where: { id: tour.operatorId }, data: { trustScore: { decrement: 1 } } });
            }

            return { timing, trustImpact, tourWasAssigned };
        },
        notification: async () => {
            await createDomainNotification({
                userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours/${tourId}`,
                type: 'TOUR_CANCELLED', title: 'Tour Cancelled',
                message: `"${tour.title}" has been cancelled by mutual agreement.${tour.escrowTransaction ? ' Escrow has been refunded.' : ''}`,
                relatedId: tourId,
            });

            if (tour.assignedGuideId) {
                await createDomainNotification({
                    userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: `/dashboard/guide/tours`,
                    type: 'TOUR_CANCELLED', title: 'Tour Cancelled',
                    message: `"${tour.title}" has been cancelled by mutual agreement.`,
                    relatedId: tourId,
                });
            }
        },
    });

    return {
        timing, trustImpact, tourWasAssigned,
        escrowRefunded: !!tour.escrowTransaction,
        tourTitle: tour.title,
    };
}

// ══════════════════════════════════════════════════════════════════════
// ACCEPT INVITE
// ══════════════════════════════════════════════════════════════════════

interface AcceptInviteInput {
    token: string;
    userId: string;
    userEmail: string;
}

export async function acceptInvite(input: AcceptInviteInput) {
    const { token, userId, userEmail } = input;

    const invitation = await prisma.companyInvitation.findUnique({ where: { token } });
    if (!invitation || invitation.status !== 'PENDING') throw new Error('Invitation not found or already processed');

    if (new Date() > invitation.expiresAt) {
        await prisma.companyInvitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
        throw new Error('EXPIRED');
    }

    if (invitation.email.toLowerCase() !== userEmail?.toLowerCase()) {
        throw new Error(`EMAIL_MISMATCH:${invitation.email}:${userEmail}`);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { guideMode: true, affiliatedOperatorId: true, role: { select: { name: true } } },
    });

    if ((user?.role as { name: string })?.name === 'TOUR_OPERATOR') throw new Error('OPERATOR_CANNOT_JOIN');
    if (user?.guideMode === 'IN_HOUSE' && user?.affiliatedOperatorId && user?.affiliatedOperatorId !== invitation.operatorId) {
        throw new Error('ALREADY_AFFILIATED');
    }

    const guideRole = await prisma.role.findUnique({ where: { name: 'TOUR_GUIDE' } });

    await executeSimpleMutation({
        entityName: 'TeamInvitation',
        entityId: invitation.id,
        actorId: userId,
        actorRole: 'TOUR_GUIDE',
        auditAction: 'TEAM_INVITE_ACCEPTED',
        metadata: { operatorId: invitation.operatorId, email: invitation.email, guideMode: 'IN_HOUSE' },
        atomicMutation: async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    roleId: guideRole!.id, guideMode: 'IN_HOUSE',
                    affiliatedOperatorId: invitation.operatorId, contractStatus: 'PENDING',
                },
            });

            await tx.teamInvitation.update({ where: { id: invitation.id }, data: { status: 'ACCEPTED' } });

            return { redirect: '/dashboard/guide' };
        },
        notification: async () => {
            await createDomainNotification({
                userId: invitation.operatorId, domain: NotificationDomain.GOVERNANCE,
                targetUrl: '/dashboard/operator/team', type: 'TEAM_ACCEPT',
                title: 'Guide Joined Your Team',
                message: `A guide (${invitation.email}) has accepted your invitation.`,
            });
        },
    });

    return { redirect: '/dashboard/guide' };
}

// ══════════════════════════════════════════════════════════════════════
// REVIEW FORCE CANCELLATION (Admin)
// ══════════════════════════════════════════════════════════════════════

interface ReviewForceCancellationInput {
    tourId: string;
    actorId: string;
    actorRole: string;
    action: 'approve' | 'reject';
    faultParty?: string;
    notes?: string;
    supervisorId?: string;
}

export async function reviewForceCancellation(input: ReviewForceCancellationInput) {
    const { tourId, actorId, actorRole, action, faultParty, notes, supervisorId } = input;

    const tour = enrichTourCompat(await prisma.tour.findUnique({
        where: { id: tourId },
        include: { escrowTransaction: true },
    }));
    if (!tour) throw new Error('Tour not found');
    if (tour.status !== CANCELLATION_STATUSES.FORCE_CANCEL_PENDING_REVIEW) throw new Error('Not pending review');

    const operator = await prisma.user.findUnique({
        where: { id: tour.operatorId },
        select: { id: true, trustScore: true, operatorCategory: true, kybStatus: true },
    });

    const guide = tour.assignedGuideId ? await prisma.user.findUnique({
        where: { id: tour.assignedGuideId },
        select: { id: true, trustScore: true },
    }) : null;

    const opTrustMax = getTrustMax(operator?.operatorCategory);

    // ── REJECT PATH ──────────────────────────────────────
    if (action === 'reject') {
        const previousStatus = tour.assignedGuideId ? 'ASSIGNED' : 'PUBLISHED';

        await prisma.tour.update({
            where: { id: tourId },
            data: {
                status: previousStatus, cancellationType: null, cancellationTiming: null,
                cancellationReason: null, cancellationInitiator: null, cancellationEvidence: null,
                cancellationReviewedBy: actorId, cancellationReviewedAt: new Date(),
                cancellationNotes: notes || 'Force cancel rejected by OPS', updatedAt: new Date(),
            },
        });

        if (tour.cancellationInitiator) {
            await createDomainNotification({
                userId: tour.cancellationInitiator, domain: NotificationDomain.GOVERNANCE,
                targetUrl: `/dashboard/operator/tours/${tourId}`,
                type: 'FORCE_CANCEL_REJECTED', title: 'Force Cancellation Rejected',
                message: `Your force cancellation claim for "${tour.title}" was rejected. The tour remains active.`,
                relatedId: tourId,
            });
        }

        await logFinancialAudit({
            userId: actorId, actorRole, action: 'FORCE_CANCEL_REJECTED',
            targetId: tourId, targetType: 'TOUR', meta: { notes },
        });

        return { action: 'rejected', restoredStatus: previousStatus };
    }

    // ── APPROVE PATH ─────────────────────────────────────
    if (!faultParty || !isValidFaultParty(faultParty)) {
        throw new Error('INVALID_FAULT_PARTY');
    }

    const fault = faultParty as FaultParty;

    // Supervisor approval for NEUTRAL
    if (requiresSupervisorApproval(fault)) {
        if (!supervisorId) throw new Error('SUPERVISOR_REQUIRED');
        if (supervisorId === actorId) throw new Error('SUPERVISOR_SELF');
        const supervisor = await prisma.user.findUnique({
            where: { id: supervisorId }, select: { role: { select: { name: true } } },
        });
        if (!supervisor || (supervisor.role as { name: string }).name !== 'SUPER_ADMIN') throw new Error('SUPERVISOR_INVALID');
    }

    const trustImpact = getForceTrustImpact(fault);
    const harmedPartyId = getHarmedPartyId(fault, tour.operatorId, tour.assignedGuideId);

    const refundReasonMap: Record<FaultParty, string> = {
        [FaultParty.OPERATOR_FAULT]: CANCELLATION_REFUND_REASONS.FORCE_CANCEL_OPERATOR_FAULT,
        [FaultParty.GUIDE_FAULT]: CANCELLATION_REFUND_REASONS.FORCE_CANCEL_GUIDE_FAULT,
        [FaultParty.OPERATOR_FRAUD]: CANCELLATION_REFUND_REASONS.FORCE_CANCEL_OPERATOR_FRAUD,
        [FaultParty.GUIDE_FRAUD]: CANCELLATION_REFUND_REASONS.FORCE_CANCEL_GUIDE_FRAUD,
        [FaultParty.NEUTRAL]: CANCELLATION_REFUND_REASONS.FORCE_CANCEL_NEUTRAL,
    };
    const refundReason = refundReasonMap[fault];

    const cancellationContext = buildCancellationContext(
        CancellationType.FORCE, tour.cancellationTiming as CancellationTiming,
        fault, actorId, EscrowResolutionType.FULL_REFUND,
    );

    await executeSimpleMutation({
        entityName: 'ServiceRequest',
        entityId: tourId,
        actorId,
        actorRole,
        auditAction: 'FORCE_CANCEL_APPROVED',
        metadata: { faultParty: fault, notes, trustImpact, supervisorId: supervisorId || null, harmedPartyId, context: cancellationContext },
        atomicMutation: async (tx) => {
            await tx.serviceRequest.update({
                where: { id: tourId },
                data: {
                    status: CANCELLATION_STATUSES.CANCELLED, cancellationFaultParty: fault,
                    cancellationReviewedBy: actorId, cancellationReviewedAt: new Date(),
                    cancellationNotes: notes, escrowStatus: 'REFUNDED', escrowReleasedAt: new Date(), updatedAt: new Date(),
                },
            });

            if (tour.escrowTransaction && tour.escrowStatus === 'HELD') {
                const wallet = await tx.operatorWallet.findUnique({ where: { id: tour.escrowTransaction.walletId } });
                if (wallet) {
                    await tx.walletTransaction.create({
                        data: {
                            walletId: wallet.id, type: 'REFUND', amount: tour.escrowTransaction.amount,
                            relatedTourId: tourId, status: 'COMPLETED',
                            description: `Force cancel refund: ${refundReason}`,
                            processedAt: new Date(), processedBy: actorId,
                            metadata: JSON.stringify({ reason: refundReason, faultParty: fault, trustImpact, context: cancellationContext }),
                        },
                    });

                    await creditWallet(tx, {
                        walletId: wallet.id, type: EscrowLedgerType.ESCROW_REFUND,
                        amount: tour.escrowTransaction.amount, referenceId: tourId,
                        metadata: { reason: refundReason, faultParty: fault },
                    });

                    await syncWalletBalances(tx, wallet.id);
                }
            }

            // Trust penalties
            if (trustImpact.operatorDelta !== 0 && operator) {
                const newScore = Math.max(0, Math.min(opTrustMax, (operator.trustScore || 0) + trustImpact.operatorDelta));
                await tx.trustEvent.create({
                    data: {
                        userId: tour.operatorId, changeValue: newScore - (operator.trustScore || 0), newScore,
                        type: `FORCE_CANCEL_${fault}`,
                        description: `Force cancellation (${fault}): ${tour.title} [${cancellationContext.escrowResolutionType}]`,
                        relatedRequestId: tourId,
                    },
                });
                await tx.user.update({ where: { id: tour.operatorId }, data: { trustScore: newScore } });
            }

            if (trustImpact.guideDelta !== 0 && tour.assignedGuideId && guide) {
                const newScore = Math.max(0, Math.min(100, (guide.trustScore || 0) + trustImpact.guideDelta));
                await tx.trustEvent.create({
                    data: {
                        userId: tour.assignedGuideId, changeValue: newScore - (guide.trustScore || 0), newScore,
                        type: `FORCE_CANCEL_${fault}`,
                        description: `Force cancellation (${fault}): ${tour.title} [${cancellationContext.escrowResolutionType}]`,
                        relatedRequestId: tourId,
                    },
                });
                await tx.user.update({ where: { id: tour.assignedGuideId }, data: { trustScore: newScore } });
            }

            // Reverse ESCROW_HELD trust
            if (operator) {
                const freshOp = await tx.user.findUnique({ where: { id: tour.operatorId }, select: { trustScore: true } });
                const currentScore = freshOp?.trustScore ?? (operator.trustScore || 0);
                const reversedScore = Math.max(0, currentScore - 1);
                await tx.trustEvent.create({
                    data: {
                        userId: tour.operatorId, changeValue: -1, newScore: reversedScore,
                        type: 'ESCROW_HELD_REVERSED',
                        description: `Commitment reversed - force cancellation: ${tour.title} [${cancellationContext.escrowResolutionType}]`,
                        relatedRequestId: tourId,
                    },
                });
                await tx.user.update({ where: { id: tour.operatorId }, data: { trustScore: reversedScore } });
            }

            return { ok: true };
        },
        notification: async () => {
            // Superhero mode
            if (harmedPartyId) {
                await createDomainNotification({
                    userId: harmedPartyId, domain: NotificationDomain.INCIDENT,
                    targetUrl: `/dashboard/service-requests`,
                    type: 'SUPERHERO_MODE_ACTIVATED', title: SUPERHERO_MODE.notificationTitle,
                    message: SUPERHERO_MODE.notificationMessage + ` Tour: ${tour.title}. Fault: ${fault}.`,
                    relatedId: tourId,
                });
            }

            // Notify both parties
            await createDomainNotification({
                userId: tour.operatorId, domain: NotificationDomain.SYSTEM,
                targetUrl: `/dashboard/operator/tours/${tourId}`,
                type: 'TOUR_CANCELLED', title: 'Tour Cancelled',
                message: `"${tour.title}" was cancelled. Fault: ${fault}.${tour.escrowTransaction ? ' Escrow refunded.' : ''}`,
                relatedId: tourId,
            });

            if (tour.assignedGuideId) {
                await createDomainNotification({
                    userId: tour.assignedGuideId, domain: NotificationDomain.SYSTEM,
                    targetUrl: '/dashboard/guide/tours',
                    type: 'TOUR_CANCELLED', title: 'Tour Cancelled',
                    message: `"${tour.title}" was cancelled. Fault: ${fault}.`,
                    relatedId: tourId,
                });
            }

            await logFinancialAudit({
                userId: actorId, actorRole, action: 'FORCE_CANCEL_APPROVED',
                targetId: tourId, targetType: 'TOUR',
                meta: { faultParty: fault, notes, trustImpact, supervisorId: supervisorId || null, harmedPartyId, context: cancellationContext },
            });

            // Risk recompute (best-effort)
            try {
                const riskResult = await evaluateOperatorRisk(tour.operatorId);
                const [completedTours, conflictCount, totalTours] = await Promise.all([
                    prisma.tour.count({ where: { operatorId: tour.operatorId, status: 'COMPLETED' } }),
                    prisma.conflict.count({ where: { OR: [{ filedById: tour.operatorId }, { receivedById: tour.operatorId }] } }),
                    prisma.tour.count({ where: { operatorId: tour.operatorId } }),
                ]);
                const disputeRate = totalTours > 0 ? conflictCount / totalTours : 0;
                const compLevel = computeComplianceLevel({
                    kybStatus: operator?.kybStatus || 'NOT_STARTED', completedTours, disputeRate, riskLevel: riskResult.level,
                });
                await persistRiskEvaluation(tour.operatorId, riskResult.score, compLevel);
            } catch (err) {
                console.error('Risk recompute after force cancel failed (best-effort):', err);
            }
        },
    });

    return {
        action: 'approved', faultParty: fault, trustImpact,
        harmedPartyNotified: !!harmedPartyId, escrowRefunded: !!tour.escrowTransaction,
        supportOptions: harmedPartyId ? SUPERHERO_MODE.supportOptions : null,
    };
}

// ══════════════════════════════════════════════════════════════════════
//  Exported namespace for clean route access
// ══════════════════════════════════════════════════════════════════════

export const FinanceDomain = {
    approveTopup,
    rejectTopup,
    approveWithdrawal,
    rejectWithdrawal,
    createWithdrawalRequest,
    cancelWithdrawal,
    adminWalletTopUp,
    approvePayment,
    publishTour,
    releaseEscrow,
    refundEscrow,
    acceptCancellation,
    acceptInvite,
    reviewForceCancellation,
};
