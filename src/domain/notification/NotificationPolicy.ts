/**
 * NotificationPolicy — Mandatory Event Notifications
 *
 * Defines which events MUST generate notifications and to whom.
 * Ensures no financial or governance event goes unnotified.
 *
 * Usage:
 *   await triggerPolicyNotification('WITHDRAW_APPROVED', { operatorId, amount, requestId });
 */

import { prisma } from '@/lib/prisma';
import {
    createDomainNotification,
    createBulkDomainNotification,
    NotificationDomain,
    getDefaultTargetUrl,
} from '@/domain/notification/NotificationService';

// ══════════════════════════════════════════════════════════════════════
// POLICY DEFINITIONS
// ══════════════════════════════════════════════════════════════════════

type NotifyTarget = 'USER' | 'FINANCE' | 'SUPER_ADMIN' | 'OPERATOR';

interface PolicyRule {
    domain: NotificationDomain;
    target: NotifyTarget;
    type: string;
    title: string;
    messageFn: (ctx: Record<string, any>) => string;
}

const NOTIFICATION_POLICY: Record<string, PolicyRule> = {
    // ── Verification ─────────────────────────────────────────────────
    VERIFICATION_SUBMITTED: {
        domain: NotificationDomain.VERIFICATION,
        target: 'SUPER_ADMIN',
        type: 'VERIFICATION_SUBMITTED',
        title: 'New Verification Submission',
        messageFn: (ctx) => `A new verification has been submitted for review.`,
    },
    VERIFICATION_APPROVED: {
        domain: NotificationDomain.VERIFICATION,
        target: 'USER',
        type: 'VERIFICATION_APPROVED',
        title: 'Verification Approved',
        messageFn: (ctx) => `Your verification has been approved. You can now access all platform features.`,
    },
    VERIFICATION_REJECTED: {
        domain: NotificationDomain.VERIFICATION,
        target: 'USER',
        type: 'VERIFICATION_REJECTED',
        title: 'Verification Requires Action',
        messageFn: (ctx) => `Your verification requires additional information.${ctx.reason ? ` Reason: ${ctx.reason}` : ''} Please review and resubmit.`,
    },

    // ── Withdrawals ──────────────────────────────────────────────────
    WITHDRAW_REQUESTED: {
        domain: NotificationDomain.ESCROW,
        target: 'FINANCE',
        type: 'WITHDRAWAL_REQUEST',
        title: 'Withdrawal Request',
        messageFn: (ctx) => `Operator requested withdrawal of ${(ctx.amount ?? 0).toLocaleString()} VND.`,
    },
    WITHDRAW_APPROVED: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'WITHDRAWAL_PAID',
        title: 'Withdrawal Paid',
        messageFn: (ctx) => `Your withdrawal of ${(ctx.amount ?? 0).toLocaleString()} VND has been processed.`,
    },
    WITHDRAW_REJECTED: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'WITHDRAWAL_REJECTED',
        title: 'Withdrawal Rejected',
        messageFn: (ctx) => `Your withdrawal request was rejected${ctx.reason ? `: ${ctx.reason}` : ''}. Funds returned to wallet.`,
    },
    WITHDRAW_CANCELLED: {
        domain: NotificationDomain.ESCROW,
        target: 'FINANCE',
        type: 'WITHDRAW_CANCELLED',
        title: 'Withdrawal Cancelled',
        messageFn: (ctx) => `Operator cancelled a withdrawal of ${(ctx.amount ?? 0).toLocaleString()} VND. Funds returned to wallet.`,
    },

    // ── Top-ups ──────────────────────────────────────────────────────
    TOPUP_REQUESTED: {
        domain: NotificationDomain.ESCROW,
        target: 'FINANCE',
        type: 'TOP_UP_REQUEST',
        title: 'Top-up Request',
        messageFn: (ctx) => `Operator submitted a top-up of ${(ctx.amount ?? 0).toLocaleString()} VND. Pending verification.`,
    },
    TOPUP_APPROVED: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'TOP_UP_APPROVED',
        title: 'Top-up Approved',
        messageFn: (ctx) => `Your top-up of ${(ctx.amount ?? 0).toLocaleString()} VND has been approved.`,
    },
    TOPUP_REJECTED: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'TOP_UP_REJECTED',
        title: 'Top-up Rejected',
        messageFn: (ctx) => `Your top-up request was rejected${ctx.reason ? `: ${ctx.reason}` : ''}.`,
    },

    // ── Escrow ───────────────────────────────────────────────────────
    ESCROW_HELD: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'ESCROW_HELD',
        title: 'Escrow Held',
        messageFn: (ctx) => `Escrow of ${(ctx.amount ?? 0).toLocaleString()} VND has been held for tour "${ctx.tourTitle || 'N/A'}".`,
    },
    ESCROW_RELEASED: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'ESCROW_RELEASED',
        title: 'Escrow Released',
        messageFn: (ctx) => `Escrow of ${(ctx.amount ?? 0).toLocaleString()} VND has been released for tour "${ctx.tourTitle || 'N/A'}".`,
    },
    ESCROW_REFUNDED: {
        domain: NotificationDomain.ESCROW,
        target: 'OPERATOR',
        type: 'ESCROW_REFUNDED',
        title: 'Escrow Refunded',
        messageFn: (ctx) => `Escrow of ${(ctx.amount ?? 0).toLocaleString()} VND has been refunded for tour "${ctx.tourTitle || 'N/A'}".`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// TRIGGER FUNCTION
// ══════════════════════════════════════════════════════════════════════

/**
 * Trigger a policy-defined notification.
 *
 * @param eventName — key into NOTIFICATION_POLICY (e.g. 'WITHDRAW_APPROVED')
 * @param context  — event-specific data. Must include `operatorId` for OPERATOR
 *                   target, `userId` for USER target.
 */
export async function triggerPolicyNotification(
    eventName: string,
    context: Record<string, any>
): Promise<void> {
    const rule = NOTIFICATION_POLICY[eventName];

    if (!rule) {
        console.warn(`[NotificationPolicy] Unknown event: ${eventName}`);
        if (process.env.NODE_ENV === 'development') {
            throw new Error(`[NotificationPolicy] No rule defined for event: ${eventName}`);
        }
        return;
    }

    const targetUrl = getDefaultTargetUrl(rule.domain);
    const message = rule.messageFn(context);

    try {
        switch (rule.target) {
            case 'USER': {
                const userId = context.userId;
                if (!userId) throw new Error(`[NotificationPolicy] Missing userId for USER target on event: ${eventName}`);
                await createDomainNotification({
                    userId,
                    domain: rule.domain,
                    targetUrl,
                    type: rule.type,
                    title: rule.title,
                    message,
                    relatedId: context.requestId || context.relatedId,
                });
                break;
            }

            case 'OPERATOR': {
                const operatorId = context.operatorId;
                if (!operatorId) throw new Error(`[NotificationPolicy] Missing operatorId for OPERATOR target on event: ${eventName}`);
                await createDomainNotification({
                    userId: operatorId,
                    domain: rule.domain,
                    targetUrl,
                    type: rule.type,
                    title: rule.title,
                    message,
                    relatedId: context.requestId || context.relatedId,
                });
                break;
            }

            case 'FINANCE':
            case 'SUPER_ADMIN': {
                const roleNames = rule.target === 'FINANCE'
                    ? ['FINANCE', 'SUPER_ADMIN']
                    : ['SUPER_ADMIN'];

                const users = await prisma.user.findMany({
                    where: { role: { name: { in: roleNames } } },
                    select: { id: true },
                });

                if (users.length > 0) {
                    await createBulkDomainNotification({
                        userIds: users.map(u => u.id),
                        domain: rule.domain,
                        targetUrl,
                        type: rule.type,
                        title: rule.title,
                        message,
                        relatedId: context.requestId || context.relatedId,
                    });
                }
                break;
            }
        }

        console.log(`[NotificationPolicy] ✓ ${eventName} → ${rule.target}`);

    } catch (error) {
        console.error(`[NotificationPolicy] Failed to send ${eventName} notification:`, error);
        // In dev mode, rethrow to catch missing notifications early
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }
    }
}

// Export for external use
export { NOTIFICATION_POLICY };
export type { PolicyRule, NotifyTarget };
