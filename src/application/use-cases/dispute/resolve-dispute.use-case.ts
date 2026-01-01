import { DisputeService } from "@/domain/services/dispute.service";
import { NotificationService } from "@/domain/services/notification.service";
import { DisputeResolution } from "@prisma/client";

export interface ResolveDisputeInput {
  disputeId: string;
  resolvedBy: string; // Admin user ID
  resolution: DisputeResolution;
  resolutionAmount?: number;
  resolutionNotes?: string;
}

export class ResolveDisputeUseCase {
  async execute(input: ResolveDisputeInput) {
    // Resolve dispute
    const dispute = await DisputeService.resolveDispute(input);

    // Notify both parties
    await NotificationService.notifyDisputeResolved(
      dispute.userId,
      dispute.id,
      input.resolution.toString()
    );

    // Notify the other party if tour exists
    if (dispute.tourId) {
      const { prisma } = await import("@/lib/prisma");
      const tour = await prisma.tour.findUnique({
        where: { id: dispute.tourId },
        include: {
          operator: true,
          applications: {
            where: { guideId: dispute.userId },
            include: { guide: true },
          },
          assignments: {
            where: { guideId: dispute.userId },
            include: { guide: true },
          },
        },
      });

      if (tour) {
        // Notify operator if guide created dispute
        if (dispute.userId !== tour.operatorId) {
          await NotificationService.notifyDisputeResolved(
            tour.operatorId,
            dispute.id,
            input.resolution.toString()
          );
        }

        // Notify guide if operator created dispute
        const allGuides = [
          ...tour.applications.map((app) => app.guide),
          ...tour.assignments.map((assign) => assign.guide),
        ];
        const uniqueGuides = Array.from(
          new Map(allGuides.map((guide) => [guide.id, guide])).values()
        );

        for (const guide of uniqueGuides) {
          if (guide.id !== dispute.userId) {
            await NotificationService.notifyDisputeResolved(
              guide.id,
              dispute.id,
              input.resolution.toString()
            );
          }
        }
      }
    }

    return dispute;
  }
}

