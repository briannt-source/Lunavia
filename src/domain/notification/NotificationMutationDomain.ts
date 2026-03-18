/**
 * NotificationMutationDomain — Notification Write Mutations
 *
 * Handles mark-as-read operations for notifications.
 */

import { prisma } from '@/lib/prisma';

async function markAllRead(userId: string) {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}

async function markRead(notificationId: string) {
    return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
}

export const NotificationMutationDomain = { markAllRead, markRead };
