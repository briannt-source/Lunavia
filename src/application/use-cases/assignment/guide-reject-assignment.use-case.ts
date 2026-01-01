import { prisma } from "@/lib/prisma";

export interface GuideRejectAssignmentInput {
  guideId: string;
  assignmentId: string;
  reason: string; // Required, especially if close to tour date
}

export class GuideRejectAssignmentUseCase {
  async execute(input: GuideRejectAssignmentInput) {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Reason is required for rejecting assignment");
    }

    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: input.assignmentId },
      include: {
        tour: true,
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

    // Check if close to tour date (within 7 days)
    const daysUntilTour = Math.floor(
      (assignment.tour.startDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysUntilTour < 7 && input.reason.trim().length < 20) {
      throw new Error(
        "Detailed reason is required when rejecting assignments close to tour date (minimum 20 characters)"
      );
    }

    // Update assignment
    await prisma.assignment.update({
      where: { id: input.assignmentId },
      data: {
        status: "REJECTED",
        rejectReason: input.reason,
        rejectedAt: new Date(),
      },
    });

    return assignment;
  }
}








