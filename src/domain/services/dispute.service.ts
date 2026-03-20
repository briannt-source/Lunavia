import { prisma } from "@/lib/prisma";
import { DisputeType, DisputeStatus, DisputeResolution } from "@prisma/client";

export interface CreateDisputeInput {
  userId: string;
  tourId?: string;
  applicationId?: string;
  paymentId?: string;
  escrowAccountId?: string;
  type: DisputeType;
  description: string;
  evidence?: string[];
}

export interface ResolveDisputeInput {
  disputeId: string;
  resolvedBy: string; // Admin user ID
  resolution: DisputeResolution;
  resolutionAmount?: number;
  resolutionNotes?: string;
}

export interface AddEvidenceInput {
  disputeId: string;
  evidenceUrls: string[];
  addedBy: string; // User ID
}

export class DisputeService {
  /**
   * Create a new dispute
   */
  static async createDispute(input: CreateDisputeInput) {
    // Validate that user has access to the related entity
    if (input.tourId) {
      const tour = await prisma.tour.findUnique({
        where: { id: input.tourId },
        include: {
          operator: true,
          applications: {
            where: { guideId: input.userId },
          },
        },
      });

      if (!tour) {
        throw new Error("Tour not found");
      }

      // User must be operator or guide with application
      const isOperator = tour.operatorId === input.userId;
      const hasApplication = tour.applications.length > 0;

      if (!isOperator && !hasApplication) {
        throw new Error("You don't have access to create dispute for this tour");
      }
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        userId: input.userId,
        tourId: input.tourId,
        applicationId: input.applicationId,
        paymentId: input.paymentId,
        escrowAccountId: input.escrowAccountId,
        type: input.type,
        description: input.description,
        evidence: input.evidence || [],
        status: "PENDING",
      },
    });

    // Create timeline entry
    await prisma.disputeTimeline.create({
      data: {
        disputeId: dispute.id,
        actorId: input.userId,
        action: "CREATED",
        details: `Dispute created: ${input.type}`,
        metadata: {
          type: input.type,
          description: input.description,
        },
      },
    });

    // If escrow account exists, we should prevent release/refund
    // This will be handled in EscrowService

    return dispute;
  }

  /**
   * Add evidence to a dispute
   */
  static async addEvidence(input: AddEvidenceInput) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: input.disputeId },
    });

    if (!dispute) {
      throw new Error("Dispute not found");
    }

    // Verify user has access
    if (dispute.userId !== input.addedBy) {
      throw new Error("Unauthorized: You can only add evidence to your own disputes");
    }

    // Update evidence (append new evidence URLs)
    const currentDispute = await prisma.dispute.findUnique({
      where: { id: input.disputeId },
      select: { evidence: true },
    });

    const updatedDispute = await prisma.dispute.update({
      where: { id: input.disputeId },
      data: {
        evidence: [...(currentDispute?.evidence || []), ...input.evidenceUrls],
      },
    });

    // Create timeline entry
    await prisma.disputeTimeline.create({
      data: {
        disputeId: input.disputeId,
        actorId: input.addedBy,
        action: "EVIDENCE_ADDED",
        details: `Added ${input.evidenceUrls.length} evidence file(s)`,
        metadata: {
          evidenceUrls: input.evidenceUrls,
        },
      },
    });

    return updatedDispute;
  }

  /**
   * Escalate a dispute (auto-escalation or manual)
   */
  static async escalateDispute(disputeId: string, escalatedBy: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error("Dispute not found");
    }

    if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") {
      throw new Error("Cannot escalate a resolved or rejected dispute");
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "ESCALATED",
        escalatedAt: new Date(),
        escalatedBy,
      },
    });

    // Create timeline entry
    await prisma.disputeTimeline.create({
      data: {
        disputeId,
        actorId: escalatedBy,
        action: "ESCALATED",
        details: "Dispute escalated for higher-level review",
      },
    });

    return updatedDispute;
  }

  /**
   * Resolve a dispute
   */
  static async resolveDispute(input: ResolveDisputeInput) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: input.disputeId },
      include: {
        escrowAccount: true,
        tour: true,
        payment: true,
      },
    });

    if (!dispute) {
      throw new Error("Dispute not found");
    }

    if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") {
      throw new Error("Dispute is already resolved or rejected");
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: input.disputeId },
      data: {
        status: "RESOLVED",
        resolution: input.resolution,
        resolutionAmount: input.resolutionAmount,
        resolutionNotes: input.resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: input.resolvedBy,
      },
    });

    // Create timeline entry
    await prisma.disputeTimeline.create({
      data: {
        disputeId: input.disputeId,
        actorId: input.resolvedBy,
        action: "RESOLVED",
        details: `Dispute resolved: ${input.resolution}`,
        metadata: {
          resolution: input.resolution,
          resolutionAmount: input.resolutionAmount,
          resolutionNotes: input.resolutionNotes,
        },
      },
    });

    // Handle escrow based on resolution
    if (dispute.escrowAccountId && dispute.escrowAccount) {
      const { EscrowService } = await import("@/domain/services/escrow.service");

      switch (input.resolution) {
        case DisputeResolution.FULL_REFUND:
        case DisputeResolution.PARTIAL_REFUND:
          // Refund escrow (full or partial)
          if (dispute.escrowAccount.status === "LOCKED") {
            await EscrowService.refundEscrow(
              dispute.escrowAccountId,
              input.resolutionAmount, // amount (undefined = full refund)
              input.resolutionNotes || `Dispute resolved: ${input.resolution}`
            );
          }
          break;

        case DisputeResolution.FULL_PAYMENT:
        case DisputeResolution.PARTIAL_PAYMENT:
          // Release escrow (full or partial)
          if (dispute.escrowAccount.status === "LOCKED") {
            await EscrowService.releaseEscrow(
              dispute.escrowAccountId,
              input.resolutionNotes || `Dispute resolved: ${input.resolution}`
            );
          }
          break;

        case DisputeResolution.NO_ACTION:
          // No action on escrow, but dispute is resolved
          break;
      }
    }

    // Trust adjustment — penalize responsible party based on resolution
    try {
      if (
        input.resolution === DisputeResolution.FULL_REFUND ||
        input.resolution === DisputeResolution.PARTIAL_REFUND
      ) {
        // Refund means the service provider was at fault
        if (dispute.tour) {
          const isFiledByGuide = dispute.userId !== dispute.tour.operatorId;
          const penalizedUserId = isFiledByGuide
            ? dispute.tour.operatorId
            : dispute.userId;

          // Directly decrement trust score via Prisma
          await prisma.user.update({
            where: { id: penalizedUserId },
            data: { trustScore: { decrement: 5 } },
          });
        }
      } else if (input.resolution === DisputeResolution.NO_ACTION) {
        // Dispute dismissed — minor penalty to filer for frivolous dispute
        await prisma.user.update({
          where: { id: dispute.userId },
          data: { trustScore: { decrement: 2 } },
        });
      }
    } catch (trustError) {
      // Non-critical — log but don't fail the resolution
      console.error("Trust adjustment failed (non-critical):", trustError);
    }

    // Notify dispute filer about resolution
    try {
      await prisma.notification.create({
        data: {
          userId: dispute.userId,
          type: "DISPUTE",
          title: "Dispute resolved",
          message: `Your dispute #${dispute.id.slice(-6)} has been resolved: ${input.resolution}`,
          link: `/dashboard/disputes/${dispute.id}`,
        },
      });
    } catch (notifyError) {
      console.error("Dispute notification failed (non-critical):", notifyError);
    }

    return updatedDispute;
  }

  /**
   * Reject a dispute
   */
  static async rejectDispute(disputeId: string, rejectedBy: string, reason?: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error("Dispute not found");
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "REJECTED",
        resolvedAt: new Date(),
        resolvedBy: rejectedBy,
        resolutionNotes: reason || "Dispute rejected",
      },
    });

    // Create timeline entry
    await prisma.disputeTimeline.create({
      data: {
        disputeId,
        actorId: rejectedBy,
        action: "REJECTED",
        details: reason || "Dispute rejected",
        metadata: {
          reason,
        },
      },
    });

    return updatedDispute;
  }

  /**
   * Appeal a dispute resolution
   */
  static async appealDispute(originalDisputeId: string, userId: string, appealDescription: string) {
    const originalDispute = await prisma.dispute.findUnique({
      where: { id: originalDisputeId },
    });

    if (!originalDispute) {
      throw new Error("Original dispute not found");
    }

    if (originalDispute.userId !== userId) {
      throw new Error("Unauthorized: You can only appeal your own disputes");
    }

    if (originalDispute.status !== "RESOLVED" && originalDispute.status !== "REJECTED") {
      throw new Error("Can only appeal resolved or rejected disputes");
    }

    // Create appeal dispute
    const appealDispute = await prisma.dispute.create({
      data: {
        userId,
        tourId: originalDispute.tourId,
        applicationId: originalDispute.applicationId,
        paymentId: originalDispute.paymentId,
        escrowAccountId: originalDispute.escrowAccountId,
        type: originalDispute.type,
        description: appealDescription,
        evidence: originalDispute.evidence,
        status: "APPEALED",
        appealId: originalDisputeId,
      },
    });

    // Update original dispute
    await prisma.dispute.update({
      where: { id: originalDisputeId },
      data: {
        status: "APPEALED",
      },
    });

    // Create timeline entries
    await prisma.disputeTimeline.create({
      data: {
        disputeId: originalDisputeId,
        actorId: userId,
        action: "APPEALED",
        details: "Dispute appealed",
        metadata: {
          appealDisputeId: appealDispute.id,
        },
      },
    });

    await prisma.disputeTimeline.create({
      data: {
        disputeId: appealDispute.id,
        actorId: userId,
        action: "CREATED",
        details: "Appeal dispute created",
        metadata: {
          originalDisputeId: originalDisputeId,
        },
      },
    });

    return appealDispute;
  }

  /**
   * Get dispute with full details
   */
  static async getDisputeById(disputeId: string) {
    return prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        tour: {
          include: {
            operator: {
              include: {
                profile: true,
              },
            },
          },
        },
        application: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
        payment: true,
        escrowAccount: true,
        adminUser: true,
        timeline: {
          include: {
            actor: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        appeal: true,
        appeals: true,
      },
    });
  }

  /**
   * List disputes with filters
   */
  static async listDisputes(filters?: {
    userId?: string;
    tourId?: string;
    status?: DisputeStatus;
    type?: DisputeType;
  }) {
    return prisma.dispute.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.tourId && { tourId: filters.tourId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        timeline: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Latest timeline entry
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Check if escrow can be released/refunded (no active disputes)
   */
  static async hasActiveDispute(escrowAccountId: string): Promise<boolean> {
    const activeDispute = await prisma.dispute.findFirst({
      where: {
        escrowAccountId,
        status: {
          in: ["PENDING", "IN_REVIEW", "ESCALATED", "APPEALED"],
        },
      },
    });

    return !!activeDispute;
  }
}

