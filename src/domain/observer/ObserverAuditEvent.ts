export type ObserverAuditEventType = 'STATUS_CHANGE' | 'GPS_UPDATE' | 'CHECKPOINT';

export interface ObserverAuditEvent {
  id: string;
  tourRunId: string;
  type: ObserverAuditEventType;
  message: string;
  timestamp: Date;
}
