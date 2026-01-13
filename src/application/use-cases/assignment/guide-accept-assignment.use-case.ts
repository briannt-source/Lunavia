import { prisma } from "@/lib/prisma";
import { AvailabilityService } from "@/domain/services/availability.service";

export interface GuideAcceptAssignmentInput {
  guideId: string;
  assignmentId: string;
}

export class GuideAcceptAssignmentUseCase {
  async execute(input: GuideAcceptAssignmentInput) {
    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: input.assignmentId },
      include: {
        tour: true,
        guide: true,
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Verify guide owns the assignment
    if (assignment.guideId !== input.guideId) {
      throw new Error("Unauthorized: This assignment is not for you");
    }

    if (assignment.status !== "PENDING") {
      throw new Error(`Assignment is already ${assignment.status}`);
    }

    // Check availability again
    const availability = await AvailabilityService.isAvailable(
      input.guideId,
      assignment.tour.startDate,
      assignment.tour.endDate || assignment.tour.startDate
    );

    if (!availability.available) {
      throw new Error(availability.reason || "You are no longer available");
    }

    // Update assignment
    await prisma.assignment.update({
      where: { id: input.assignmentId },
      data: {
        status: "APPROVED",
        acceptedAt: new Date(),
      },
    });

    // Set guide to ON_TOUR
    await AvailabilityService.setOnTour(
      input.guideId,
      assignment.tour.startDate,
      assignment.tour.endDate || assignment.tour.startDate
    );

    return assignment;
  }
}














