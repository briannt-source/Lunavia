import { v4 as uuid } from 'uuid';
import { NotificationEvent } from '@/domain/notification/NotificationEvent';

const store = new Map<string, NotificationEvent>();

export const InMemoryNotificationRepo = {
  add(event: Omit<NotificationEvent, 'id' | 'createdAt'>): NotificationEvent {
    const newEvent: NotificationEvent = {
      id: uuid(),
      createdAt: new Date(),
      ...event,
    };
    store.set(newEvent.id, newEvent);
    return newEvent;
  },

  findByUser(userId: string): NotificationEvent[] {
    return Array.from(store.values())
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  markRead(id: string): NotificationEvent | null {
    const event = store.get(id);
    if (event) {
      event.readAt = new Date();
      return event;
    }
    return null;
  },
};
