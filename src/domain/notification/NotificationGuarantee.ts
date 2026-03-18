/**
 * Notification Guarantee Layer
 *
 * Wraps notification creation with failure logging.
 * If a notification fails to deliver, the error is logged to the
 * NotificationFailureLog (stored in AuditLog) instead of being silently swallowed.
 *
 * This ensures no notification failure goes undetected.
 */
import { prisma } from '@/lib/prisma';
import {
    createDomainNotification,
    createBulkDomainNotification,
    type CreateDomainNotificationInput,
    type CreateBulkDomainNotificationInput,
} from '@/domain/notification/NotificationService';

/**
 * Send a notification with failure guarantee.
 * If the notification fails, the error is logged to AuditLog as NOTIFICATION_FAILURE.
 * The caller's operation is NOT rolled back — notification is non-blocking.
 */
export async function guaranteedNotification(
    input: CreateDomainNotificationInput,
): Promise<{ success: boolean; error?: string }> {
    try {
        await createDomainNotification(input);
        return { success: true };
    } catch (error: any) {
        const errorMessage = error?.message || 'Unknown notification error';
        console.error(`[NotificationGuarantee] FAILURE: ${errorMessage}`, {
            userId: input.userId,
            type: input.type,
            domain: input.domain,
        });

        // Log failure to audit trail — never swallow silently
        try {
            await prisma.auditLog.create({
                data: {
                    userId: 'SYSTEM',
                    actorRole: 'SYSTEM',
                    action: 'NOTIFICATION_FAILURE',
                    entityType: 'Notification',
                    entityId: input.userId,
                    metadata: {
                        error: errorMessage,
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
            // Last resort — if even logging fails, console.error for ops visibility
            console.error('[NotificationGuarantee] CRITICAL: Failed to log notification failure', logError);
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Send bulk notifications with failure guarantee.
 */
export async function guaranteedBulkNotification(
    input: CreateBulkDomainNotificationInput,
): Promise<{ success: boolean; error?: string }> {
    try {
        await createBulkDomainNotification(input);
        return { success: true };
    } catch (error: any) {
        const errorMessage = error?.message || 'Unknown notification error';
        console.error(`[NotificationGuarantee] BULK FAILURE: ${errorMessage}`, {
            userCount: input.userIds.length,
            type: input.type,
            domain: input.domain,
        });

        try {
            await prisma.auditLog.create({
                data: {
                    userId: 'SYSTEM',
                    actorRole: 'SYSTEM',
                    action: 'NOTIFICATION_FAILURE',
                    entityType: 'BulkNotification',
                    entityId: `bulk-${input.userIds.length}`,
                    metadata: {
                        error: errorMessage,
                        notificationType: input.type,
                        domain: input.domain,
                        targetUrl: input.targetUrl,
                        userCount: input.userIds.length,
                        timestamp: new Date().toISOString(),
                    },
                    ipAddress: 'system',
                },
            });
        } catch (logError) {
            console.error('[NotificationGuarantee] CRITICAL: Failed to log bulk notification failure', logError);
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Get notification failure count for the health dashboard.
 */
export async function getNotificationFailureCount(
    since?: Date,
): Promise<number> {
    const where: any = { action: 'NOTIFICATION_FAILURE' };
    if (since) {
        where.createdAt = { gte: since };
    }
    return prisma.auditLog.count({ where });
}
