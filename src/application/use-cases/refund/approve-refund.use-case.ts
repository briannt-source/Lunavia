/**
 * Approve Refund Use Case
 * 
 * Handles first approval of refund (4-eyes rule: FINANCE).
 * Application layer use case - orchestrates validation and updates dispute.
 * 
 * Refund = return Lunavia Credit (LVC), not real money.
 * Wallet is a neutral ledger and is FROZEN.
 * Actual LVC crediting will be handled later by Finance Lead finalization.
 */

import { prisma } from "@/lib/prisma";
import { RefundPolicy } from "@/application/policies/refund.policy";
import { PermissionService } from "@/application/services/permission.service";
import { AdminRole, Permission } from "@prisma/client";
import { AuditLogRepository, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export interface ApproveRefundInput {
  actorId: string; // Admin user ID approving refund
  disputeId: string;
}

export interface ApproveRefundOutput {
  disputeId: string;
  status: string;
  requiresSecondApproval: boolean;
  approvedBy: string;
}

export class ApproveRefundUseCase {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: ApproveRefundInput): Promise<ApproveRefundOutput> {
    // Get admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: input.actorId },
      select: {
        id: true,
        role: true,
        permissions: true,
      },
    });

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Check permission
    const hasPermission = PermissionService.userHasPermission(
      adminUser.role,
      adminUser.permissions,
      Permission.FINANCE_APPROVE_REFUND
    );

    if (!hasPermission) {
      throw new Error("Insufficient permissions to approve refund");
    }

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: input.disputeId },
      select: {
        id: true,
        status: true,
        resolution: true,
        assignedTo: true,
        tourId: true,
      },
    });

    if (!dispute) {
      throw new Error("Dispute not found");
    }

    // Check if dispute already has first approval
    // Look for timeline entry indicating first approval
    const firstApproval = await prisma.disputeTimeline.findFirst({
      where: {
        disputeId: input.disputeId,
        action: "APPROVED_FIRST",
      },
    });

    const hasFirstApproval = !!firstApproval;

    // Validate refund approval via policy
    const validation = RefundPolicy.canApproveRefund(
      {
        id: dispute.id,
        status: dispute.status,
        resolution: dispute.resolution,
        assignedTo: dispute.assignedTo,
      },
      adminUser.role as AdminRole,
      hasFirstApproval
    );

    if (!validation.allowed) {
      throw new Error(
        validation.reason || "Refund cannot be approved for this dispute"
      );
    }

    // Update dispute based on approval stage
    if (!hasFirstApproval) {
      // First approval: Mark as IN_REVIEW (pending second approval)
      // Note: Ideally, a new status like "APPROVED_PENDING_SECOND" would be added to schema
      await prisma.dispute.update({
        where: { id: input.disputeId },
        data: {
          status: "IN_REVIEW", // Pending second approval
          assignedTo: input.actorId, // Assign to approver
        },
      });

      // Create timeline entry for first approval
      await prisma.disputeTimeline.create({
        data: {
          disputeId: input.disputeId,
          action: "APPROVED_FIRST",
          actorId: input.actorId,
          details: "First approval provided by FINANCE. Pending FINANCE_LEAD approval.",
          metadata: {
            approvalStage: "FIRST",
            approverRole: adminUser.role,
          },
        },
      });
    } else {
      // Second approval: Mark as RESOLVED (final approval)
      await prisma.dispute.update({
        where: { id: input.disputeId },
        data: {
          status: "RESOLVED",
          resolution: "FULL_REFUND", // Default resolution for approved refund
          resolvedAt: new Date(),
          resolvedBy: input.actorId,
        },
      });

      // Create timeline entry for second approval
      await prisma.disputeTimeline.create({
        data: {
          disputeId: input.disputeId,
          action: "APPROVED_FINAL",
          actorId: input.actorId,
          details: "Final approval provided by FINANCE_LEAD. Refund approved.",
          metadata: {
            approvalStage: "FINAL",
            approverRole: adminUser.role,
          },
        },
      });
    }

    // Append audit log entry
    await this.auditLog.append({
      actorId: input.actorId,
      action: "APPROVE_REFUND",
      targetType: AuditLogTargetType.TOUR,
      targetId: dispute.tourId || null,
      beforeState: { disputeId: dispute.id, status: dispute.status },
      afterState: {
        disputeId: dispute.id,
        status: hasFirstApproval ? "RESOLVED" : "IN_REVIEW",
        approvalStage: hasFirstApproval ? "FINAL" : "FIRST",
      },
      reason: null,
    });

    return {
      disputeId: input.disputeId,
      status: hasFirstApproval ? "RESOLVED" : "IN_REVIEW",
      requiresSecondApproval: validation.requiresSecondApproval || false,
      approvedBy: input.actorId,
    };
  }
}

