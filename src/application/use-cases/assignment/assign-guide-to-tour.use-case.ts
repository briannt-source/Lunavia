import { prisma } from "@/lib/prisma";
import { AvailabilityService } from "@/domain/services/availability.service";
import { NotificationService } from "@/domain/services/notification.service";

export interface AssignGuideToTourInput {
  operatorId: string;
  tourId: string;
  guideId: string;
  role: "MAIN" | "SUB";
}

export class AssignGuideToTourUseCase {
  async execute(input: AssignGuideToTourInput) {
    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      include: {
        operator: true,
      },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify operator owns the tour
    if (tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    // Check if tour is private (only private tours can have direct assignments)
    if (tour.visibility !== "PRIVATE") {
      throw new Error("Direct assignment is only available for private tours");
    }

    // Get guide
    const guide = await prisma.user.findUnique({
      where: { id: input.guideId },
      include: {
        companyMember: true,
      },
    });

    if (!guide || guide.role !== "TOUR_GUIDE") {
      throw new Error("Guide not found");
    }

    // Check if guide is in-house member of the company
    if (
      guide.employmentType !== "IN_HOUSE" ||
      !guide.companyMember ||
      guide.companyMember.companyId !== tour.operatorId
    ) {
      throw new Error("Guide must be an in-house member of your company");
    }

    // Check availability
    const availability = await AvailabilityService.isAvailable(
      input.guideId,
      tour.startDate,
      tour.endDate || tour.startDate
    );

    if (!availability.available) {
      throw new Error(availability.reason || "Guide is not available");
    }

    // Check if already assigned
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
    });

    if (existingAssignment) {
      throw new Error("Guide is already assigned to this tour");
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        tourId: input.tourId,
        guideId: input.guideId,
        role: input.role,
        status: "PENDING",
      },
    });

    // Notify guide
    await NotificationService.notifyNewAssignment(input.guideId, assignment.id);

    return assignment;
  }
}

