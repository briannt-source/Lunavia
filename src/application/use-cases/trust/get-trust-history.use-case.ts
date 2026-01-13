/**
 * Get Trust History Use Case
 * 
 * Retrieves trust score history for a user.
 * Includes trust records and current status.
 */

import { prisma } from "@/lib/prisma";
import { TrustRulesPolicy } from "@/application/policies/trust-rules.policy";

export interface GetTrustHistoryInput {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface TrustHistoryRecord {
  id: string;
  delta: number;
  reason: string;
  source: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface GetTrustHistoryOutput {
  userId: string;
  currentScore: number;
  status: string; // GOOD / AT_RISK / RESTRICTED
  records: TrustHistoryRecord[];
  total: number;
}

export class GetTrustHistoryUseCase {
  async execute(
    input: GetTrustHistoryInput
  ): Promise<GetTrustHistoryOutput> {
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

    // Get trust records
    const [records, total] = await Promise.all([
      prisma.trustRecord.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
        take: input.limit || 50,
        skip: input.offset || 0,
      }),
      prisma.trustRecord.count({
        where: { userId: input.userId },
      }),
    ]);

    // Resolve trust status using policy
    const status = TrustRulesPolicy.resolveTrustStatus(
      user.trustScore,
      {
        goodMin: trustConfig.goodMin,
        atRiskMin: trustConfig.atRiskMin,
        restrictedMax: trustConfig.restrictedMax,
        blockCreateTourBelow: trustConfig.blockCreateTourBelow,
        blockApplyTourBelow: trustConfig.blockApplyTourBelow,
      }
    );

    // Map records to output format (audit/history only)
    // TrustRecord is for audit - no score computation from history
    const mappedRecords: TrustHistoryRecord[] = records.map((record) => ({
      id: record.id,
      delta: record.delta,
      reason: record.reason,
      source: record.source,
      metadata: record.metadata as Record<string, any> | undefined,
      createdAt: record.createdAt,
    }));

    return {
      userId: input.userId,
      currentScore: user.trustScore,
      status,
      records: mappedRecords,
      total,
    };
  }
}

