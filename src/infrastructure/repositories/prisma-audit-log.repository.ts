/**
 * Prisma Audit Log Repository
 * 
 * Infrastructure layer implementation of AuditLogRepository.
 * Handles persistence of audit logs using Prisma.
 */

import { prisma } from "@/lib/prisma";
import { AuditLogRepository, AuditLogEntry, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export class PrismaAuditLogRepository implements AuditLogRepository {
  async append(entry: AuditLogEntry): Promise<string> {
    const auditLog = await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType as any, // Map to Prisma enum
        targetId: entry.targetId || null,
                beforeState: entry.beforeState ? (entry.beforeState as any) : null,
                afterState: entry.afterState ? (entry.afterState as any) : null,
        reason: entry.reason || null,
      },
    });

    return auditLog.id;
  }
}

