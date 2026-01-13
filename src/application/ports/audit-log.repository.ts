/**
 * Audit Log Repository Interface
 * 
 * Application layer port for audit logging.
 * Infrastructure layer will implement this interface.
 */

export enum AuditLogTargetType {
  USER = "USER",
  TOUR = "TOUR",
  CONFIG = "CONFIG",
  OTHER = "OTHER",
}

export interface AuditLogEntry {
  actorId: string;
  action: string;
  targetType: AuditLogTargetType;
  targetId?: string | null;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
  reason?: string | null;
}

export interface AuditLogRepository {
  /**
   * Append an audit log entry
   * 
   * @param entry - Audit log entry to persist
   * @returns Promise resolving to the created audit log ID
   */
  append(entry: AuditLogEntry): Promise<string>;
}

