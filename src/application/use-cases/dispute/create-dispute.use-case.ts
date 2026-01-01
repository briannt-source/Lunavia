import { DisputeService } from "@/domain/services/dispute.service";
import { NotificationService } from "@/domain/services/notification.service";
import { DisputeType } from "@prisma/client";

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

export class CreateDisputeUseCase {
  async execute(input: CreateDisputeInput) {
    // Create dispute
    const dispute = await DisputeService.createDispute(input);

    // Notify admin/moderator
    await NotificationService.notifyNewDispute(dispute.id);

    // Notify the other party (operator or guide)
    if (input.tourId) {
      const tour = await import("@/lib/prisma").then((m) =>
        m.prisma.tour.findUnique({
          where: { id: input.tourId },
          include: {
            operator: true,
            applications: {
              where: { guideId: input.userId },
              include: { guide: true },
            },
          },
        })
      );

      if (tour) {
        // Notify operator if guide created dispute
        if (input.userId !== tour.operatorId) {
          await NotificationService.notifyDisputeCreated(tour.operatorId, dispute.id);
        }

        // Notify guide if operator created dispute
        if (tour.applications.length > 0) {
          const guide = tour.applications[0].guide;
          if (guide.id !== input.userId) {
            await NotificationService.notifyDisputeCreated(guide.id, dispute.id);
          }
        }
      }
    }

    return dispute;
  }
}

