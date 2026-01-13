/**
 * Adjust Trust Use Case
 * 
 * Allows admin to manually adjust a user's trust score.
 * Uses TrustService for business logic and appends audit record.
 */

import { prisma } from "@/lib/prisma";
import { TrustService } from "@/domain/services/trust.service";
import { TrustRulesPolicy } from "@/application/policies/trust-rules.policy";
import { PermissionService } from "@/application/services/permission.service";
import { TrustRecordReason, TrustRecordSource } from "@/domain/entities/trust-record.entity";
import { AdminRole, Permission } from "@prisma/client";
import { AuditLogRepository, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export interface AdjustTrustInput {
  actorId: string; // Admin user ID
  targetUserId: string;
  delta: number;
  reason: string; // Required reason for adjustment
}

export interface AdjustTrustOutput {
  targetUserId: string;
  previousScore: number;
  newScore: number;
  delta: number;
  status: string; // GOOD / AT_RISK / RESTRICTED
  recordId: string;
}

/**
 * Audit log hook interface (infrastructure will implement)
 */
export interface TrustAuditLogHook {
  actorId: string;
  action: "ADJUST_TRUST" | "RESET_TRUST";
  targetUserId: string;
  beforeScore: number;
  afterScore: number;
  reason: string;
  timestamp: Date;
}

export class AdjustTrustUseCase {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: AdjustTrustInput): Promise<AdjustTrustOutput> {
    // Check actor permission
    const actor = await prisma.adminUser.findUnique({
      where: { id: input.actorId },
    });

    if (!actor) {
      throw new Error("Admin user not found");
    }

    // Check if actor has TRUST_ADJUST permission
    const hasPermission = PermissionService.userHasPermission(
      actor.role,
      actor.permissions,
      Permission.TRUST_ADJUST
    );

    if (!hasPermission) {
      throw new Error("Insufficient permissions to adjust trust");
    }

    // Validate allowed roles (SUPER_ADMIN / FINANCE / FINANCE_LEAD)
    const allowedRoles: AdminRole[] = [
      AdminRole.SUPER_ADMIN,
      AdminRole.FINANCE,
      AdminRole.FINANCE_LEAD,
    ];

    if (!allowedRoles.includes(actor.role as AdminRole)) {
      throw new Error("Only SUPER_ADMIN, FINANCE, or FINANCE_LEAD can adjust trust");
    }

    // Validate reason is provided
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Reason is required for trust adjustment");
    }

    // Get target user with current trust score (single source of truth)
    const targetUser = await prisma.user.findUnique({
      where: { id: input.targetUserId },
      select: {
        id: true,
        trustScore: true,
      },
    });

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Get trust config
    const trustConfig = await prisma.trustConfig.findUnique({
      where: { id: "global" },
    });

    if (!trustConfig) {
      throw new Error("Trust config not found");
    }

    // Apply trust change using domain service
    // Use targetUser.trustScore directly as single source of truth
    const result = TrustService.applyTrustChange({
      currentScore: targetUser.trustScore,
      delta: input.delta,
      reason: TrustRecordReason.ADMIN_ADJUST,
      source: TrustRecordSource.ADMIN,
      userId: input.targetUserId,
      metadata: {
        actorId: input.actorId,
        reason: input.reason,
      },
    });

    // Update user trust score (single source of truth)
    await prisma.user.update({
      where: { id: input.targetUserId },
      data: {
        trustScore: result.newScore,
      },
    });

    // Persist TrustRecord for audit/history only (Prisma auto-generates ID)
    const trustRecord = await prisma.trustRecord.create({
      data: {
        userId: result.record.userId,
        delta: result.record.delta,
        reason: result.record.reason,
        source: result.record.source as any, // Map enum to Prisma enum
        metadata: result.record.metadata || {},
        createdAt: result.record.createdAt,
      },
    });

    // Resolve trust status using policy
    const status = TrustRulesPolicy.resolveTrustStatus(
      result.newScore,
      {
        goodMin: trustConfig.goodMin,
        atRiskMin: trustConfig.atRiskMin,
        restrictedMax: trustConfig.restrictedMax,
        blockCreateTourBelow: trustConfig.blockCreateTourBelow,
        blockApplyTourBelow: trustConfig.blockApplyTourBelow,
      }
    );

    // Append audit log entry
    await this.auditLog.append({
      actorId: input.actorId,
      action: "ADJUST_TRUST",
      targetType: AuditLogTargetType.USER,
      targetId: input.targetUserId,
      beforeState: { trustScore: targetUser.trustScore },
      afterState: { trustScore: result.newScore },
      reason: input.reason,
    });

    return {
      targetUserId: input.targetUserId,
      previousScore: targetUser.trustScore,
      newScore: result.newScore,
      delta: input.delta,
      status,
      recordId: trustRecord.id,
    };
  }
}

