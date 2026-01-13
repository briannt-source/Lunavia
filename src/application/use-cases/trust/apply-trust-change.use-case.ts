/**
 * Apply Trust Change Use Case
 * 
 * Applies a trust score change and persists it to database.
 * Uses TrustService for business logic and TrustRulesPolicy for status resolution.
 */

import { prisma } from "@/lib/prisma";
import { TrustService } from "@/domain/services/trust.service";
import { TrustRulesPolicy } from "@/application/policies/trust-rules.policy";
import { TrustRecordReason, TrustRecordSource } from "@/domain/entities/trust-record.entity";

export interface ApplyTrustChangeInput {
  userId: string;
  delta: number;
  reason: TrustRecordReason;
  source: TrustRecordSource;
  metadata?: Record<string, any>;
}

export interface ApplyTrustChangeOutput {
  userId: string;
  previousScore: number;
  newScore: number;
  delta: number;
  status: string; // GOOD / AT_RISK / RESTRICTED
  recordId: string;
}

export class ApplyTrustChangeUseCase {
  async execute(input: ApplyTrustChangeInput): Promise<ApplyTrustChangeOutput> {
    // Get user with current trust score
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        trustScore: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get trust config
    const trustConfig = await prisma.trustConfig.findUnique({
      where: { id: "global" },
    });

    if (!trustConfig) {
      throw new Error("Trust config not found");
    }

    // Apply trust change using domain service
    // Use user.trustScore directly as single source of truth
    // Domain service validates and calculates new score
    const result = TrustService.applyTrustChange({
      currentScore: user.trustScore,
      delta: input.delta,
      reason: input.reason,
      source: input.source,
      userId: input.userId,
      metadata: input.metadata,
    });

    // Update user trust score (single source of truth)
    await prisma.user.update({
      where: { id: input.userId },
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

    return {
      userId: input.userId,
      previousScore: user.trustScore,
      newScore: result.newScore,
      delta: input.delta,
      status,
      recordId: trustRecord.id,
    };
  }
}

