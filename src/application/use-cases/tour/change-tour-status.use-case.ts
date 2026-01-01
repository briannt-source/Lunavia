import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";
import { PaymentMilestoneService } from "@/domain/services/payment-milestone.service";

export interface ChangeTourStatusInput {
  operatorId: string;
  tourId: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export class ChangeTourStatusUseCase {
  async execute(input: ChangeTourStatusInput) {
    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify operator owns the tour
    if (tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["OPEN", "CANCELLED"],
      OPEN: ["CLOSED", "IN_PROGRESS", "CANCELLED"],
      CLOSED: ["OPEN", "IN_PROGRESS", "CANCELLED"], // Can reopen or start tour
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowedStatuses = validTransitions[tour.status] || [];
    if (!allowedStatuses.includes(input.status)) {
      throw new Error(
        `Cannot change status from ${tour.status} to ${input.status}`
      );
    }

    // Update tour status
    const updatedTour = await prisma.tour.update({
      where: { id: input.tourId },
      data: {
        status: input.status,
      },
    });

    // Send notification when tour starts (status changes to IN_PROGRESS)
    if (input.status === "IN_PROGRESS") {
      await NotificationService.notifyTourStarted(input.tourId);

      // Trigger milestone 2 for all accepted guides
      const milestones = await prisma.paymentMilestone.findMany({
        where: {
          tourId: input.tourId,
          milestone2Status: "PENDING",
        },
      });

      for (const milestone of milestones) {
        try {
          await PaymentMilestoneService.triggerMilestone2(milestone.id);
        } catch (error) {
          console.error(`Failed to trigger milestone 2 for milestone ${milestone.id}:`, error);
        }
      }
    }

    return updatedTour;
  }
}



