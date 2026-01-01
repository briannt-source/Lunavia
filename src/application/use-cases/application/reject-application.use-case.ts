import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/domain/services/notification.service";

export interface RejectApplicationInput {
  operatorId: string;
  applicationId: string;
  reason?: string;
}

export class RejectApplicationUseCase {
  async execute(input: RejectApplicationInput) {
    // Get application with tour
    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      include: {
        tour: true,
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

    // Update application status
    await prisma.application.update({
      where: { id: input.applicationId },
      data: {
        status: "REJECTED",
      },
    });

    // Notify guide
    await NotificationService.notifyApplicationStatus(
      application.guideId,
      input.applicationId,
      "REJECTED"
    );

    return application;
  }
}

