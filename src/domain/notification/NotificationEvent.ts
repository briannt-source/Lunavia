import { NotificationSeverity } from './NotificationSeverity';

export type NotificationType = 'TRUST_CHANGED' | 'VERIFICATION' | 'SYSTEM';

export interface NotificationEvent {
  id: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  message: string;
  createdAt: Date;
  readAt?: Date | null;
}
