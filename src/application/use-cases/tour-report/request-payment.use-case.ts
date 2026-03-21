import { prisma } from "@/lib/prisma";
import { SendNotificationUseCase } from "@/application/use-cases/notification/send-notification.use-case";

export interface RequestPaymentInput {
  guideId: string;
  tourId: string;
}

export class RequestPaymentUseCase {
  async execute(input: RequestPaymentInput) {
    // Get tour report
    const report = await prisma.tourReport.findUnique({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
      include: {
        tour: true,
        guide: true,
      },
    });

    if (!report) {
      throw new Error("Tour report not found");
    }

    // Verify guide owns this report
    if (report.guideId !== input.guideId) {
      throw new Error("Unauthorized: You don't own this report");
    }

    if (!report.approvedAt) {
      throw new Error("Tour not yet confirmed by operator");
    }

    if (!report.paymentLockedAmount) {
      throw new Error("No amount locked. Please contact the operator.");
    }

    // Check if payment is overdue (24 hours passed)
    const now = new Date();
    const paymentDueAt = report.paymentDueAt;

    if (!paymentDueAt) {
      throw new Error("No payment deadline set");
    }

    if (now < paymentDueAt) {
      const hoursRemaining = Math.ceil((paymentDueAt.getTime() - now.getTime()) / (1000 * 60 * 60));
      throw new Error(
        `Chưa đến hạn thanh toán. Remaining ${hoursRemaining} giờ nữa. Vui lòng đợi đến khi hết hạn.`
      );
    }

    // Update payment request status
    const updatedReport = await prisma.tourReport.update({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
      data: {
        paymentRequestStatus: "PENDING",
      },
    });

    // Notify operator
    const notifyUseCase = new SendNotificationUseCase();
    await notifyUseCase.execute({
      userId: report.tour.operatorId,
      type: "PAYMENT",
      title: "Payment request from guide",
      message: `Tour guide đã payment request for tour "${report.tour.title}". Amount: ${report.paymentLockedAmount.toLocaleString("vi-VN")} VND.`,
      link: `/dashboard/operator/tours/${input.tourId}/reports`,
    });

    return {
      report: updatedReport,
      message: "Payment request sent. Operator will be notified.",
    };
  }
}

