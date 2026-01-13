/**
 * Trigger SOS Use Case
 * 
 * Handles SOS trigger for tours with policy-driven validation.
 * Application layer use case - orchestrates validation and emits hooks.
 * 
 * SOS is an operational safety net, not a financial or dispute mechanism.
 * SOS must NOT affect trust, wallet, deposit, or refund.
 */

import { prisma } from "@/lib/prisma";
import { TourState } from "@/domain/enums/tour-state.enum";
import { SOSPolicy, SOSConfig } from "@/application/policies/sos.policy";
import { AuditLogRepository, AuditLogTargetType } from "@/application/ports/audit-log.repository";

export interface TriggerSOSInput {
  actorId: string; // User ID triggering SOS (operator or guide)
  tourId: string;
  reason: string; // Required reason for SOS trigger
}

export interface TriggerSOSOutput {
  tourId: string;
  sosTriggered: boolean;
  tourState: string;
  reason: string;
}

export class TriggerSOSUseCase {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: TriggerSOSInput): Promise<TriggerSOSOutput> {
    // Validate reason is provided
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Reason is required for SOS trigger");
    }

    // Get actor to check role
    const actor = await prisma.user.findUnique({
      where: { id: input.actorId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!actor) {
      throw new Error("User not found");
    }

    // Get tour with required fields
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      select: {
        id: true,
        status: true,
        startDate: true,
        operatorId: true,
      },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify actor has permission (operator or assigned guide)
    const isOperator = tour.operatorId === input.actorId;
    
    if (isOperator) {
      // Operator can always trigger SOS for their own tours
      // No additional check needed
    } else if (actor.role === "TOUR_GUIDE") {
      // Guide can only trigger SOS if they are assigned to the tour
      // Check both Application (ACCEPTED) and Assignment (APPROVED)
      const [acceptedApplication, approvedAssignment] = await Promise.all([
        prisma.application.findFirst({
          where: {
            tourId: input.tourId,
            guideId: input.actorId,
            status: "ACCEPTED",
          },
        }),
        prisma.assignment.findFirst({
          where: {
            tourId: input.tourId,
            guideId: input.actorId,
            status: "APPROVED",
          },
        }),
      ]);

      const isAssigned = !!acceptedApplication || !!approvedAssignment;

      if (!isAssigned) {
        throw new Error("Forbidden: You are not assigned to this tour. Only assigned guides can trigger SOS.");
      }
    } else {
      // Other roles (e.g., TOUR_AGENCY) cannot trigger SOS
      throw new Error("Forbidden: Only tour operators and assigned guides can trigger SOS.");
    }

    // Get SOS config (in future, load from database; for MVP use default)
    const sosConfig: SOSConfig = SOSPolicy.getDefaultConfig();
    // Future: const sosConfig = await prisma.sosConfig.findUnique({ where: { id: "global" } });

    // Validate SOS trigger via policy
    const currentTime = new Date();
    const validation = SOSPolicy.canTriggerSOS(
      {
        id: tour.id,
        status: tour.status as TourState,
        startDate: tour.startDate,
      },
      currentTime,
      sosConfig
    );

    if (!validation.allowed) {
      throw new Error(
        validation.reason || "SOS trigger is not allowed for this tour"
      );
    }

    // Append audit log entry (no state change, but action logged)
    await this.auditLog.append({
      actorId: input.actorId,
      action: "TRIGGER_SOS",
      targetType: AuditLogTargetType.TOUR,
      targetId: input.tourId,
      beforeState: { status: tour.status },
      afterState: { status: tour.status },
      reason: input.reason,
    });

    // Note: Tour state is NOT changed here
    // If SOS resolution fails later, tour will be moved to FAILED state
    // via tour lifecycle transition (handled elsewhere, not in this use case)

    return {
      tourId: input.tourId,
      sosTriggered: true,
      tourState: tour.status as string,
      reason: input.reason,
    };
  }
}

