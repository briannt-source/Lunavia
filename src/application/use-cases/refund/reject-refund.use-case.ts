/**
 * Reject Refund Use Case
 * 
 * Handles rejection of refund request.
 * Application layer use case - orchestrates validation and updates dispute.
 * 
 * Refund = return Lunavia Credit (LVC), not real money.
 * Wallet is a neutral ledger and is FROZEN.
 */

import { prisma } from "@/lib/prisma";
import { RefundPolicy } from "@/application/policies/refund.policy";
import { PermissionService } from "@/application/services/permission.service";
import { AdminRole, Permission } from "@prisma/client";
import { AuditLogRepository, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export interface RejectRefundInput {
  actorId: string; // Admin user ID rejecting refund
  disputeId: string;
  reason: string; // Required reason for rejection
}

export interface RejectRefundOutput {
  disputeId: string;
  status: string;
  rejectedBy: string;
  reason: string;
}

export class RejectRefundUseCase {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: RejectRefundInput): Promise<RejectRefundOutput> {
    // Validate reason is provided
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Reason is required for rejecting refund");
    }

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

    // Check permission (FINANCE or FINANCE_LEAD)
    const hasPermission = PermissionService.userHasPermission(
      adminUser.role,
      adminUser.permissions,
      Permission.FINANCE_APPROVE_REFUND // Rejection uses same permission as approval
    );

    if (!hasPermission) {
      throw new Error("Insufficient permissions to reject refund");
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

    // Validate refund rejection via policy
    const validation = RefundPolicy.canRejectRefund(
      {
        id: dispute.id,
        status: dispute.status,
        resolution: dispute.resolution,
        assignedTo: dispute.assignedTo,
      },
      adminUser.role as AdminRole
    );

    if (!validation.allowed) {
      throw new Error(
        validation.reason || "Refund cannot be rejected for this dispute"
      );
    }

    // Update dispute to REJECTED
    await prisma.dispute.update({
      where: { id: input.disputeId },
      data: {
        status: "REJECTED",
        resolution: "NO_ACTION",
        resolutionNotes: input.reason,
        resolvedAt: new Date(),
        resolvedBy: input.actorId,
      },
    });

    // Create timeline entry for rejection
    await prisma.disputeTimeline.create({
      data: {
        disputeId: input.disputeId,
        action: "REJECTED",
        actorId: input.actorId,
        details: `Refund rejected: ${input.reason}`,
        metadata: {
          rejectorRole: adminUser.role,
          reason: input.reason,
        },
      },
    });

    // Append audit log entry
    await this.auditLog.append({
      actorId: input.actorId,
      action: "REJECT_REFUND",
      targetType: AuditLogTargetType.TOUR,
      targetId: dispute.tourId || null,
      beforeState: { disputeId: dispute.id, status: dispute.status },
      afterState: { disputeId: dispute.id, status: "REJECTED" },
      reason: input.reason,
    });

    return {
      disputeId: input.disputeId,
      status: "REJECTED",
      rejectedBy: input.actorId,
      reason: input.reason,
    };
  }
}

