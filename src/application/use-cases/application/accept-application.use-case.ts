import { prisma } from "@/lib/prisma";
import { AvailabilityService } from "@/domain/services/availability.service";
import { NotificationService } from "@/domain/services/notification.service";
import { EscrowService } from "@/domain/services/escrow.service";
import { PaymentMilestoneService } from "@/domain/services/payment-milestone.service";

export interface AcceptApplicationInput {
  operatorId: string;
  applicationId: string;
}

export class AcceptApplicationUseCase {
  async execute(input: AcceptApplicationInput) {
    // Get application with tour and guide
    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      include: {
        tour: {
          include: {
            operator: true,
          },
        },
        guide: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    // Verify operator owns the tour
    if (application.tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    if (application.status !== "PENDING") {
      throw new Error(`Application is already ${application.status}`);
    }

    // Check if tour is still open
    if (application.tour.status !== "OPEN") {
      throw new Error("Tour is not open for accepting applications");
    }

    // Check slot availability
    const acceptedCount = await prisma.application.count({
      where: {
        tourId: application.tourId,
        role: application.role,
        status: "ACCEPTED",
      },
    });

    const maxSlots =
      application.role === "MAIN"
        ? application.tour.mainGuideSlots
        : application.tour.subGuideSlots;

    if (acceptedCount >= maxSlots) {
      throw new Error(
        `No more ${application.role === "MAIN" ? "main" : "sub"} guide slots available`
      );
    }

    // Check guide availability again
    const availability = await AvailabilityService.isAvailable(
      application.guideId,
      application.tour.startDate,
      application.tour.endDate || application.tour.startDate
    );

    if (!availability.available) {
      throw new Error(availability.reason || "Guide is no longer available");
    }

    // Update application status
    await prisma.application.update({
      where: { id: input.applicationId },
      data: {
        status: "ACCEPTED",
      },
    });

    // Set guide to ON_TOUR
    await AvailabilityService.setOnTour(
      application.guideId,
      application.tour.startDate,
      application.tour.endDate || application.tour.startDate
    );

    // Reject other pending applications for the same role if slots are full
    if (acceptedCount + 1 >= maxSlots) {
      const rejectedApplications = await prisma.application.findMany({
        where: {
          tourId: application.tourId,
          role: application.role,
          status: "PENDING",
          id: { not: input.applicationId },
        },
      });

      await prisma.application.updateMany({
        where: {
          tourId: application.tourId,
          role: application.role,
          status: "PENDING",
          id: { not: input.applicationId },
        },
        data: {
          status: "REJECTED",
        },
      });

      // Notify rejected guides
      for (const rejectedApp of rejectedApplications) {
        await NotificationService.notifyApplicationStatus(
          rejectedApp.guideId,
          rejectedApp.id,
          "REJECTED"
        );
      }
    }

    // Create payment milestones for this application
    const tourPrice =
      application.role === "MAIN"
        ? application.tour.priceMain
        : application.tour.priceSub;

    if (tourPrice && tourPrice > 0) {
      try {
        // Create payment milestones (30% - 40% - 30%)
        const milestone = await PaymentMilestoneService.createPaymentMilestones({
          tourId: application.tourId,
          guideId: application.guideId,
          applicationId: input.applicationId,
          totalAmount: tourPrice,
          autoReleaseEnabled: false, // Can be configured per operator
          autoReleaseHours: 24,
        });

        // Trigger milestone 1 (accept application)
        await PaymentMilestoneService.triggerMilestone1(milestone.id);
      } catch (error) {
        // Log error but don't fail the acceptance
        // Milestones can be created later manually
        console.error("Failed to create payment milestones:", error);
      }
    }

    // Notify guide
    await NotificationService.notifyApplicationStatus(
      application.guideId,
      input.applicationId,
      "ACCEPTED"
    );

    return application;
  }
}

