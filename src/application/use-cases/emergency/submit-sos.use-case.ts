import { prisma } from "@/lib/prisma";
import { SendNotificationUseCase } from "@/application/use-cases/notification/send-notification.use-case";

export interface SubmitSOSInput {
  guideId: string;
  tourId: string;
  type: "SOS" | "EMERGENCY" | "INCIDENT";
  description: string;
  location?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export class SubmitSOSUseCase {
  async execute(input: SubmitSOSInput) {
    // Verify guide is assigned to this tour
    const application = await prisma.application.findFirst({
      where: {
        tourId: input.tourId,
        guideId: input.guideId,
        status: "ACCEPTED",
      },
      include: {
        tour: true,
      },
    });

    const assignment = await prisma.assignment.findFirst({
      where: {
        tourId: input.tourId,
        guideId: input.guideId,
        status: "APPROVED",
      },
      include: {
        tour: true,
      },
    });

    if (!application && !assignment) {
      throw new Error("Bạn không được gán cho tour này");
    }

    const tour = application?.tour || assignment?.tour;
    if (!tour) {
      throw new Error("Tour not found");
    }

    if (tour.status !== "IN_PROGRESS") {
      throw new Error("Tour phải đang chạy mới có thể báo cáo SOS");
    }

    // Create emergency report
    const emergencyReport = await prisma.emergencyReport.create({
      data: {
        tourId: input.tourId,
        guideId: input.guideId,
        type: input.type,
        description: input.description,
        location: input.location,
        severity: input.severity,
        status: "PENDING",
      },
    });

    // Notify operator immediately
    const notifyUseCase = new SendNotificationUseCase();
    await notifyUseCase.execute({
      userId: tour.operatorId,
      type: "EMERGENCY",
      title: `🚨 ${input.type} - ${input.severity} Severity`,
      message: `Hướng dẫn viên đã báo cáo ${input.type.toLowerCase()}: ${input.description.substring(0, 100)}...`,
      link: `/dashboard/operator/tours/${input.tourId}/emergencies/${emergencyReport.id}`,
    });

    return emergencyReport;
  }
}

