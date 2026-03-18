/**
 * NotificationService — Domain-Enforced Notification Factory
 *
 * ALL notification creation MUST go through this service.
 * Direct `prisma.notification.create()` is prohibited.
 *
 * Every notification requires:
 *   - domain (validated enum)
 *   - targetUrl (click-through deep link)
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { subDays } from 'date-fns';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';

/** Prisma interactive transaction client type */
type TransactionClient = Prisma.TransactionClient;

// ══════════════════════════════════════════════════════════════════════
// NOTIFICATION DOMAIN ENUM
// ══════════════════════════════════════════════════════════════════════

export enum NotificationDomain {
    ESCROW = 'ESCROW',
    REVENUE = 'REVENUE',
    VERIFICATION = 'VERIFICATION',
    CANCELLATION = 'CANCELLATION',
    RISK = 'RISK',
    SYSTEM = 'SYSTEM',
    GOVERNANCE = 'GOVERNANCE',
    INCIDENT = 'INCIDENT',
}

// ══════════════════════════════════════════════════════════════════════
// PHASE A — ROUTE-LEVEL DOMAIN ASSERTION
// ══════════════════════════════════════════════════════════════════════

/**
 * Assert that the notification domain matches the route's declared domain.
 * Throws immediately on mismatch — prevents cross-domain misuse.
 */
export function assertRouteDomain(
    expected: NotificationDomain,
    actual: NotificationDomain,
): void {
    if (expected !== actual) {
        throw new Error(
            `[DOMAIN MISMATCH] Route domain is ${expected} but notification domain is ${actual}. ` +
            `Cross-domain notification creation is prohibited.`
        );
    }
}

/**
 * Create a scoped notification factory bound to a specific route domain.
 * All notifications created via this factory auto-inject the domain and
 * throw if a mismatched domain is passed.
 *
 * Usage:
 *   const notify = withRouteDomain(NotificationDomain.ESCROW);
 *   await notify.create({ userId, targetUrl, type, title, message });
 */
export function withRouteDomain(routeDomain: NotificationDomain) {
    return {
        create(input: Omit<CreateDomainNotificationInput, 'domain'> & { domain?: NotificationDomain }) {
            if (input.domain && input.domain !== routeDomain) {
                throw new Error(
                    `[DOMAIN MISMATCH] Route domain is ${routeDomain} but notification domain is ${input.domain}.`
                );
            }
            return createDomainNotification({ ...input, domain: routeDomain });
        },
        createTx(
            tx: TransactionClient,
            input: Omit<CreateDomainNotificationInput, 'domain'> & { domain?: NotificationDomain },
        ) {
            if (input.domain && input.domain !== routeDomain) {
                throw new Error(
                    `[DOMAIN MISMATCH] Route domain is ${routeDomain} but notification domain is ${input.domain}.`
                );
            }
            return createDomainNotificationTx(tx, { ...input, domain: routeDomain });
        },
        createBulk(input: Omit<CreateBulkDomainNotificationInput, 'domain'> & { domain?: NotificationDomain }) {
            if (input.domain && input.domain !== routeDomain) {
                throw new Error(
                    `[DOMAIN MISMATCH] Route domain is ${routeDomain} but notification domain is ${input.domain}.`
                );
            }
            return createBulkDomainNotification({ ...input, domain: routeDomain });
        },
    };
}

// ══════════════════════════════════════════════════════════════════════
// PHASE C — TARGET URL VALIDATION
// ══════════════════════════════════════════════════════════════════════

const ALLOWED_URL_PREFIXES = ['/dashboard/', '/admin/'];
const MAX_TARGET_URL_LENGTH = 200;

/**
 * Validate notification target URL to prevent path injection.
 * Must start with /dashboard/ or /admin/, no protocol, no traversal.
 */
export function validateNotificationTargetUrl(targetUrl: string): void {
    if (!targetUrl) {
        throw new Error('Notification targetUrl is required');
    }
    if (targetUrl.length > MAX_TARGET_URL_LENGTH) {
        throw new Error(`Notification targetUrl exceeds max length of ${MAX_TARGET_URL_LENGTH} chars`);
    }
    if (targetUrl.includes('://')) {
        throw new Error('Notification targetUrl must be a relative path, not an absolute URL');
    }
    if (targetUrl.includes('..')) {
        throw new Error('Notification targetUrl must not contain path traversal (..) sequences');
    }
    // Block bare /dashboard and /admin — must have a specific sub-path
    if (targetUrl === '/dashboard' || targetUrl === '/dashboard/') {
        throw new Error('Notification targetUrl "/dashboard" is too generic. Must include a specific sub-path.');
    }
    if (targetUrl === '/admin' || targetUrl === '/admin/') {
        throw new Error('Notification targetUrl "/admin" is too generic. Must include a specific sub-path.');
    }
    const hasValidPrefix = ALLOWED_URL_PREFIXES.some(prefix => targetUrl.startsWith(prefix));
    if (!hasValidPrefix) {
        throw new Error(
            `Notification targetUrl must start with one of: ${ALLOWED_URL_PREFIXES.join(', ')}. Got: ${targetUrl}`
        );
    }
}

/**
 * Get the default targetUrl for a notification domain.
 * Used as fallback when no explicit targetUrl is provided,
 * ensuring all notifications point to a specific, existing page.
 */
export function getDefaultTargetUrl(domain: NotificationDomain): string {
    const domainTargetMap: Record<NotificationDomain, string> = {
        [NotificationDomain.ESCROW]: '/dashboard/operator/wallet',
        [NotificationDomain.REVENUE]: '/dashboard/admin/finance/revenue/subscriptions',
        [NotificationDomain.VERIFICATION]: '/dashboard/verification/status',
        [NotificationDomain.CANCELLATION]: '/dashboard/admin/governance',
        [NotificationDomain.RISK]: '/dashboard/admin/risk',
        [NotificationDomain.SYSTEM]: '/dashboard/service-requests',
        [NotificationDomain.GOVERNANCE]: '/dashboard/admin/governance',
        [NotificationDomain.INCIDENT]: '/dashboard/admin/incidents',
    };

    return domainTargetMap[domain];
}

// ══════════════════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ══════════════════════════════════════════════════════════════════════

export enum NotificationType {
    // Escrow
    TOP_UP_REQUEST = 'TOP_UP_REQUEST',
    TOP_UP_APPROVED = 'TOP_UP_APPROVED',
    TOP_UP_REJECTED = 'TOP_UP_REJECTED',
    WITHDRAWAL_REQUEST = 'WITHDRAWAL_REQUEST',
    WITHDRAWAL_PAID = 'WITHDRAWAL_PAID',
    WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
    ESCROW_RELEASED = 'ESCROW_RELEASED',
    ESCROW_REFUNDED = 'ESCROW_REFUNDED',
    WALLET_TOPUP = 'WALLET_TOPUP',
    WALLET_DEDUCTED = 'WALLET_DEDUCTED',

    // Revenue
    PAYMENT_REQUEST = 'PAYMENT_REQUEST',
    PAYMENT_APPROVED = 'PAYMENT_APPROVED',
    PAYMENT_REJECTED = 'PAYMENT_REJECTED',
    PLAN_UPGRADE_REQUESTED = 'PLAN_UPGRADE_REQUESTED',
    PLAN_UPGRADE_APPROVED = 'PLAN_UPGRADE_APPROVED',

    // Verification
    VERIFICATION_SUBMITTED = 'VERIFICATION_SUBMITTED',
    VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
    VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',

    // Tour lifecycle
    NEW_OFFER = 'NEW_OFFER',
    TOUR_ASSIGNED = 'TOUR_ASSIGNED',
    TOUR_STARTED = 'TOUR_STARTED',
    TOUR_COMPLETED = 'TOUR_COMPLETED',
    TOUR_CANCELLED = 'TOUR_CANCELLED',
    TOUR_PUBLISHED = 'TOUR_PUBLISHED',

    // Cancellation
    CANCEL_PROPOSED = 'CANCEL_PROPOSED',
    CANCEL_ACCEPTED = 'CANCEL_ACCEPTED',
    CANCEL_REJECTED = 'CANCEL_REJECTED',
    FORCE_CANCEL = 'FORCE_CANCEL',
    CANCEL_REVIEWED = 'CANCEL_REVIEWED',

    // Incidents
    SOS_ALERT = 'SOS_ALERT',
    INCIDENT_REPORTED = 'INCIDENT_REPORTED',
    INCIDENT_ASSIGNED = 'INCIDENT_ASSIGNED',

    // System
    GUIDE_ONBOARDED = 'GUIDE_ONBOARDED',
    INVITE_ACCEPTED = 'INVITE_ACCEPTED',
    CONTRACT_REVIEWED = 'CONTRACT_REVIEWED',
    CONTRACT_SUBMITTED = 'CONTRACT_SUBMITTED',
    APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
    GUIDE_ACCEPTED = 'GUIDE_ACCEPTED',
    GUIDE_ASSIGNED = 'GUIDE_ASSIGNED',
    BONUS_PAID = 'BONUS_PAID',
    TOUR_REASSIGNED = 'TOUR_REASSIGNED',
    TOUR_REOPENED = 'TOUR_REOPENED',
    TOUR_CONFIRMED = 'TOUR_CONFIRMED',

    // Risk
    TRUST_SCORE_CHANGE = 'TRUST_SCORE_CHANGE',

    // Governance
    CONFLICT_REPORTED = 'CONFLICT_REPORTED',
    DISPUTE_OPENED = 'DISPUTE_OPENED',
    DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',

    // Marketplace Invites
    GUIDE_INVITE_RECEIVED = 'GUIDE_INVITE_RECEIVED',
    GUIDE_INVITE_ACCEPTED = 'GUIDE_INVITE_ACCEPTED',
    GUIDE_INVITE_DECLINED = 'GUIDE_INVITE_DECLINED',
    GUIDE_INVITE_EXPIRED = 'GUIDE_INVITE_EXPIRED',
}

// ══════════════════════════════════════════════════════════════════════
// CREATE DOMAIN NOTIFICATION (REQUIRED ENTRY POINT)
// ══════════════════════════════════════════════════════════════════════

export interface CreateDomainNotificationInput {
    userId: string;
    domain: NotificationDomain;
    targetUrl: string;
    type: NotificationType | string;
    title: string;
    message: string;
    relatedId?: string | null;
}

export interface CreateBulkDomainNotificationInput {
    userIds: string[];
    domain: NotificationDomain;
    targetUrl: string;
    type: NotificationType | string;
    title: string;
    message: string;
    relatedId?: string | null;
}

/**
 * Create a single domain-tagged notification.
 * Guaranteed: failures are logged to AuditLog, never silently swallowed.
 */
export async function createDomainNotification(input: CreateDomainNotificationInput) {
    if (!input.domain) throw new Error('Notification domain is required');
    validateNotificationTargetUrl(input.targetUrl);

    // ── MUTE CHECK: skip if user has muted all notifications ──
    try {
        const user = await (prisma.user as any).findUnique({
            where: { id: input.userId },
            select: { notificationsMuted: true },
        });
        if (user?.notificationsMuted) return null;
    } catch { /* proceed if check fails */ }

    try {
        return await prisma.notification.create({
            data: {
                userId: input.userId,
                domain: input.domain,
                targetUrl: input.targetUrl,
                type: input.type,
                title: input.title,
                message: input.message,
                relatedId: input.relatedId,
            },
        });
    } catch (error: any) {
        // ── NOTIFICATION GUARANTEE: log failure, never swallow ──
        console.error(`[NotificationGuarantee] FAILURE:`, error?.message, { userId: input.userId, type: input.type });
        try {
            await prisma.auditLog.create({
                data: {
                    userId: 'SYSTEM',
                    actorRole: 'SYSTEM',
                    action: 'NOTIFICATION_FAILURE',
                    entityType: 'Notification',
                    entityId: input.userId,
                    metadata: {
                        error: error?.message || 'Unknown',
                        notificationType: input.type,
                        domain: input.domain,
                        targetUrl: input.targetUrl,
                        title: input.title,
                        timestamp: new Date().toISOString(),
                    },
                    ipAddress: 'system',
                },
            });
        } catch (logError) {
            console.error('[NotificationGuarantee] CRITICAL: Failed to log notification failure', logError);
        }
        return null;
    }
}

/**
 * Create a domain-tagged notification inside an existing Prisma transaction.
 * Use this when the notification must be part of an atomic operation.
 */
export async function createDomainNotificationTx(
    tx: TransactionClient,
    input: CreateDomainNotificationInput
) {
    if (!input.domain) throw new Error('Notification domain is required');
    validateNotificationTargetUrl(input.targetUrl);

    return tx.notification.create({
        data: {
            userId: input.userId,
            domain: input.domain,
            targetUrl: input.targetUrl,
            type: input.type,
            title: input.title,
            message: input.message,
            relatedId: input.relatedId,
        },
    });
}

/**
 * Create multiple domain-tagged notifications for multiple users.
 * Guaranteed: failures are logged to AuditLog, never silently swallowed.
 */
export async function createBulkDomainNotification(input: CreateBulkDomainNotificationInput) {
    if (!input.domain) throw new Error('Notification domain is required');
    validateNotificationTargetUrl(input.targetUrl);

    try {
        return await prisma.notification.createMany({
            data: input.userIds.map(userId => ({
                userId,
                domain: input.domain,
                targetUrl: input.targetUrl,
                type: input.type,
                title: input.title,
                message: input.message,
                relatedId: input.relatedId,
            })),
        });
    } catch (error: any) {
        // ── NOTIFICATION GUARANTEE: log failure, never swallow ──
        console.error(`[NotificationGuarantee] BULK FAILURE:`, error?.message, { userCount: input.userIds.length, type: input.type });
        try {
            await prisma.auditLog.create({
                data: {
                    userId: 'SYSTEM',
                    actorRole: 'SYSTEM',
                    action: 'NOTIFICATION_FAILURE',
                    entityType: 'BulkNotification',
                    entityId: `bulk-${input.userIds.length}`,
                    metadata: {
                        error: error?.message || 'Unknown',
                        notificationType: input.type,
                        domain: input.domain,
                        userCount: input.userIds.length,
                        timestamp: new Date().toISOString(),
                    },
                    ipAddress: 'system',
                },
            });
        } catch (logError) {
            console.error('[NotificationGuarantee] CRITICAL: Failed to log bulk notification failure', logError);
        }
        return null;
    }
}

/**
 * Create bulk notifications inside a transaction.
 */
export async function createBulkDomainNotificationTx(
    tx: TransactionClient,
    input: CreateBulkDomainNotificationInput
) {
    if (!input.domain) throw new Error('Notification domain is required');
    validateNotificationTargetUrl(input.targetUrl);

    return tx.notification.createMany({
        data: input.userIds.map(userId => ({
            userId,
            domain: input.domain,
            targetUrl: input.targetUrl,
            type: input.type,
            title: input.title,
            message: input.message,
            relatedId: input.relatedId,
        })),
    });
}

// ══════════════════════════════════════════════════════════════════════
// QUERY METHODS — READ OPERATIONS
// ══════════════════════════════════════════════════════════════════════

export class NotificationService {
    /**
     * Get Cursor-based Notifications (with optional domain filter)
     */
    static async getNotifications(
        userId: string,
        limit: number = 20,
        cursor?: string,
        type?: string,
        domain?: NotificationDomain,
        allowedDomains?: NotificationDomain[],
    ) {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                ...(type ? { type } : {}),
                ...(domain ? { domain } : {}),
                ...(allowedDomains && allowedDomains.length > 0
                    ? { domain: { in: allowedDomains } }
                    : {}),
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        let hasNextPage = false;

        if (notifications.length > limit) {
            hasNextPage = true;
            const nextItem = notifications.pop();
            nextCursor = nextItem?.id;
        }

        const unreadCount = notifications.filter(n => !n.isRead).length;

        return {
            notifications,
            unreadCount,
            meta: {
                nextCursor,
                hasNextPage,
            },
        };
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    /**
     * Cleanup old notifications (Cron Job)
     */
    static async cleanupOldNotifications() {
        try {
            const thirtyDaysAgo = subDays(new Date(), 30);
            const ninetyDaysAgo = subDays(new Date(), 90);

            return await executeSimpleMutation({
                entityName: 'Notification',
                actorId: 'SYSTEM',
                actorRole: 'SYSTEM',
                atomicMutation: async (tx) => {
                    const deletedRead = await tx.notification.deleteMany({
                        where: { isRead: true, createdAt: { lt: thirtyDaysAgo } },
                    });
                    const deletedUnread = await tx.notification.deleteMany({
                        where: { isRead: false, createdAt: { lt: ninetyDaysAgo } },
                    });

                    return {
                        success: true,
                        deletedRead: deletedRead.count,
                        deletedUnread: deletedUnread.count,
                    };
                },
            });
        } catch (error) {
            console.error('Cleanup failed:', error);
            throw error;
        }
    }
}
