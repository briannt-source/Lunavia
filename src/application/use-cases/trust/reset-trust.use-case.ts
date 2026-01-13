/**
 * Reset Trust Use Case
 * 
 * Allows admin to reset a user's trust score to default value.
 * Uses TrustConfig for default score (no hardcoded values).
 */

import { prisma } from "@/lib/prisma";
import { TrustService } from "@/domain/services/trust.service";
import { TrustRulesPolicy } from "@/application/policies/trust-rules.policy";
import { PermissionService } from "@/application/services/permission.service";
import { TrustRecordReason, TrustRecordSource } from "@/domain/entities/trust-record.entity";
import { AdminRole, Permission } from "@prisma/client";
import { AuditLogRepository, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export interface ResetTrustInput {
  actorId: string; // Admin user ID
  targetUserId: string;
  reason: string; // Required reason for reset
}

export interface ResetTrustOutput {
  targetUserId: string;
  previousScore: number;
  newScore: number;
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

export class ResetTrustUseCase {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: ResetTrustInput): Promise<ResetTrustOutput> {
    // Check actor permission
    const actor = await prisma.adminUser.findUnique({
      where: { id: input.actorId },
    });

    if (!actor) {
      throw new Error("Admin user not found");
    }

    // Check if actor has TRUST_RESET permission
    const hasPermission = PermissionService.userHasPermission(
      actor.role,
      actor.permissions,
      Permission.TRUST_RESET
    );

    if (!hasPermission) {
      throw new Error("Insufficient permissions to reset trust");
    }

    // Validate allowed roles (SUPER_ADMIN / FINANCE_LEAD only)
    const allowedRoles: AdminRole[] = [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_LEAD];

    if (!allowedRoles.includes(actor.role as AdminRole)) {
      throw new Error("Only SUPER_ADMIN or FINANCE_LEAD can reset trust");
    }

    // Validate reason is provided
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Reason is required for trust reset");
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

    // Get trust config for default reset score
    const trustConfig = await prisma.trustConfig.findUnique({
      where: { id: "global" },
    });

    if (!trustConfig) {
      throw new Error("Trust config not found");
    }

    // Load default reset score from TrustConfig (admin-configurable)
    // Using goodMin as the reset target (represents "good" trust threshold)
    const defaultResetScore = trustConfig.goodMin;

    // Calculate delta needed to reach default score
    const delta = defaultResetScore - targetUser.trustScore;

    // If already at default, no change needed
    if (delta === 0) {
      // Still create audit record for reset action
      const trustRecord = await prisma.trustRecord.create({
        data: {
          userId: input.targetUserId,
          delta: 0, // No change
          reason: TrustRecordReason.ADMIN_RESET,
          source: TrustRecordSource.ADMIN,
          metadata: {
            actorId: input.actorId,
            reason: input.reason,
            resetTo: defaultResetScore,
          },
          createdAt: new Date(),
        },
      });

      const status = TrustRulesPolicy.resolveTrustStatus(
        targetUser.trustScore,
        {
          goodMin: trustConfig.goodMin,
          atRiskMin: trustConfig.atRiskMin,
          restrictedMax: trustConfig.restrictedMax,
          blockCreateTourBelow: trustConfig.blockCreateTourBelow,
          blockApplyTourBelow: trustConfig.blockApplyTourBelow,
        }
      );

      // Append audit log entry (no state change, but action logged)
      await this.auditLog.append({
        actorId: input.actorId,
        action: "RESET_TRUST",
        targetType: AuditLogTargetType.USER,
        targetId: input.targetUserId,
        beforeState: { trustScore: targetUser.trustScore },
        afterState: { trustScore: targetUser.trustScore },
        reason: input.reason,
      });

      return {
        targetUserId: input.targetUserId,
        previousScore: targetUser.trustScore,
        newScore: targetUser.trustScore,
        status,
        recordId: trustRecord.id,
      };
    }

    // Apply trust change using domain service
    // Use targetUser.trustScore directly as single source of truth
    const result = TrustService.applyTrustChange({
      currentScore: targetUser.trustScore,
      delta,
      reason: TrustRecordReason.ADMIN_RESET,
      source: TrustRecordSource.ADMIN,
      userId: input.targetUserId,
      metadata: {
        actorId: input.actorId,
        reason: input.reason,
        resetTo: defaultResetScore,
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
      action: "RESET_TRUST",
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
      status,
      recordId: trustRecord.id,
    };
  }
}

