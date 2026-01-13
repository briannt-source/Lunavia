/**
 * Open Dispute Use Case
 * 
 * Handles opening a dispute for a tour with policy-driven validation.
 * Application layer use case - orchestrates validation and creates dispute record.
 * 
 * Refund = return Lunavia Credit (LVC), not real money.
 * Wallet is a neutral ledger and is FROZEN.
 */

import { prisma } from "@/lib/prisma";
import { TourState } from "@/domain/enums/tour-state.enum";
import { RefundPolicy, RefundConfig } from "@/application/policies/refund.policy";
import { DisputeType } from "@prisma/client";
import { AuditLogRepository, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export interface OpenDisputeInput {
  actorId: string; // User ID opening the dispute
  tourId: string;
  reason: string; // Required reason for dispute
  type: DisputeType; // PAYMENT, ASSIGNMENT, NO_SHOW, QUALITY
  evidence?: string[]; // Optional evidence URLs
}

export interface OpenDisputeOutput {
  disputeId: string;
  tourId: string;
  status: string;
  reason: string;
}

export class OpenDisputeUseCase {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: OpenDisputeInput): Promise<OpenDisputeOutput> {
    // Validate reason is provided
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Reason is required for opening dispute");
    }

    // Get tour with required fields
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        durationHours: true,
        operatorId: true,
      },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify actor has permission to open dispute
    // For MVP: User must be operator or guide associated with tour
    // Future: Check assignment/application relationship
    const isOperator = tour.operatorId === input.actorId;
    if (!isOperator) {
      // TODO: Check if actor is assigned guide (future enhancement)
      // For MVP, allow if operator
    }

    // Check for active disputes (anti-fraud: one active dispute per tour)
    const activeDisputes = await prisma.dispute.findMany({
      where: {
        tourId: input.tourId,
        status: {
          in: ["PENDING", "IN_REVIEW"], // Active dispute statuses
        },
      },
    });

    const hasActiveDispute = activeDisputes.length > 0;

    // Get refund config (in future, load from database; for MVP use default)
    const refundConfig: RefundConfig = RefundPolicy.getDefaultConfig();
    // Future: const refundConfig = await prisma.refundConfig.findUnique({ where: { id: "global" } });

    // Validate dispute opening via policy
    const currentTime = new Date();
    const validation = RefundPolicy.canOpenDispute(
      {
        id: tour.id,
        status: tour.status as TourState,
        startDate: tour.startDate,
        endDate: tour.endDate,
        durationHours: tour.durationHours,
      },
      currentTime,
      refundConfig,
      hasActiveDispute
    );

    if (!validation.allowed) {
      throw new Error(
        validation.reason || "Dispute cannot be opened for this tour"
      );
    }

    // Get user for dispute creation
    const user = await prisma.user.findUnique({
      where: { id: input.actorId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create dispute record
    const dispute = await prisma.dispute.create({
      data: {
        userId: input.actorId,
        tourId: input.tourId,
        type: input.type,
        description: input.reason,
        evidence: input.evidence || [],
        status: "PENDING", // Initial status
      },
    });

    // Create timeline entry
    await prisma.disputeTimeline.create({
      data: {
        disputeId: dispute.id,
        action: "CREATED",
        actorId: input.actorId,
        details: `Dispute opened: ${input.reason}`,
        metadata: {
          type: input.type,
          evidenceCount: input.evidence?.length || 0,
        },
      },
    });

    // Append audit log entry
    await this.auditLog.append({
      actorId: input.actorId,
      action: "OPEN_DISPUTE",
      targetType: AuditLogTargetType.TOUR,
      targetId: input.tourId,
      beforeState: { disputeCount: activeDisputes.length },
      afterState: { disputeId: dispute.id, status: dispute.status },
      reason: input.reason,
    });

    return {
      disputeId: dispute.id,
      tourId: input.tourId,
      status: dispute.status,
      reason: input.reason,
    };
  }
}

