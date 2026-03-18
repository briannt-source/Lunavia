import { prisma } from '@/lib/prisma';
import { NotificationEvent } from '@/domain/notification/NotificationEvent';
import { createDomainNotification, NotificationDomain, getDefaultTargetUrl } from '@/domain/notification/NotificationService';

// Prisma-backed repository for Notifications
export const PrismaNotificationRepo = {
  async add(event: Omit<NotificationEvent, 'id' | 'createdAt' | 'readAt'>) {
    return createDomainNotification({
      userId: event.userId,
      domain: NotificationDomain.SYSTEM,
      targetUrl: getDefaultTargetUrl(NotificationDomain.SYSTEM),
      type: event.type || 'INFO',
      title: event.type || 'Notification',
      message: event.message,
    });
  },

  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },
};
