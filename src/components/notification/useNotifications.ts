"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { InMemoryNotificationRepo } from '@/infrastructure/repositories/inMemoryNotificationRepo';
import { NotificationEvent } from '@/domain/notification/NotificationEvent';

export function useNotifications() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    // In-memory repo has no reactive mechanism; poll lightly for UI freshness.
    const tick = () => setNotifications(InMemoryNotificationRepo.findByUser(userId));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  function markAllRead() {
    for (const n of notifications) {
      if (!n.readAt) InMemoryNotificationRepo.markRead(n.id);
    }
    setNotifications(InMemoryNotificationRepo.findByUser(userId || ''));
  }

  return {
    notifications,
    unreadCount,
    markAllRead,
  };
}
