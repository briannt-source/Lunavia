import { prisma } from "@/lib/prisma";
import { SendNotificationUseCase } from "@/application/use-cases/notification/send-notification.use-case";

export interface CancelApplicationInput {
  guideId: string;
  applicationId: string;
  reason?: string;
}

export class CancelApplicationUseCase {
  // Penalty thresholds (in hours before tour start)
  private readonly PENALTY_THRESHOLD_24H = 24;
  private readonly PENALTY_THRESHOLD_48H = 48;
  private readonly PENALTY_AMOUNT_24H = 500000; // 500k VND
  private readonly PENALTY_AMOUNT_48H = 200000; // 200k VND

  async execute(input: CancelApplicationInput) {
    // Get application with tour
    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      include: {
        tour: true,
        guide: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    // Verify guide owns this application
    if (application.guideId !== input.guideId) {
      throw new Error("Unauthorized: You don't own this application");
    }

    // Check if already cancelled
    if (application.status === "REJECTED") {
      throw new Error("Application đã bị từ chối");
    }

    // Check if tour has already started
    if (new Date(application.tour.startDate) <= new Date()) {
      throw new Error("Không thể hủy tour đã bắt đầu");
    }

    // Calculate time until tour start
    const now = new Date();
    const tourStart = new Date(application.tour.startDate);
    const hoursUntilStart = (tourStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    let penaltyAmount: number | null = null;

    // Calculate penalty based on cancellation timing
    if (hoursUntilStart <= this.PENALTY_THRESHOLD_24H) {
      penaltyAmount = this.PENALTY_AMOUNT_24H;
    } else if (hoursUntilStart <= this.PENALTY_THRESHOLD_48H) {
      penaltyAmount = this.PENALTY_AMOUNT_48H;
    }

    // Check if guide has enough balance for penalty
    if (penaltyAmount && application.guide.wallet) {
      if (application.guide.wallet.balance < penaltyAmount) {
        throw new Error(
          `Số dư không đủ để thanh toán phí hủy tour (${penaltyAmount.toLocaleString("vi-VN")} VND). Số dư hiện tại: ${application.guide.wallet.balance.toLocaleString("vi-VN")} VND`
        );
      }
    }

    // Create cancellation record
    const cancellation = await prisma.applicationCancellation.create({
      data: {
        applicationId: input.applicationId,
        cancelledBy: "GUIDE",
        reason: input.reason,
        penaltyAmount,
        penaltyApplied: false,
      },
    });

    // Apply penalty if applicable
    if (penaltyAmount && application.guide.wallet) {
      // Deduct penalty from guide's wallet
      await prisma.wallet.update({
        where: { userId: application.guideId },
        data: {
          balance: { decrement: penaltyAmount },
        },
      });
      
      // Create transaction record
      await prisma.transaction.create({
        data: {
          walletId: application.guide.wallet.id,
          type: "OUTGOING",
          amount: -penaltyAmount,
          description: `Phí hủy tour: ${application.tour.title}`,
        },
      });

      // Update cancellation record
      await prisma.applicationCancellation.update({
        where: { id: cancellation.id },
        data: { penaltyApplied: true },
      });
    }

    // Update application status
    await prisma.application.update({
      where: { id: input.applicationId },
      data: {
        status: "REJECTED",
      },
    });

    // Notify operator
    const notifyUseCase = new SendNotificationUseCase();
    await notifyUseCase.execute({
      userId: application.tour.operatorId,
      type: "APPLICATION",
      title: "Hướng dẫn viên đã hủy ứng tuyển",
      message: `Hướng dẫn viên đã hủy ứng tuyển cho tour "${application.tour.title}"${penaltyAmount ? ` (phí hủy: ${penaltyAmount.toLocaleString("vi-VN")} VND)` : ""}`,
      link: `/dashboard/operator/tours/${application.tourId}/applications`,
    });

    return {
      cancellation,
      penaltyAmount,
      message: penaltyAmount
        ? `Đã hủy tour thành công. Phí hủy ${penaltyAmount.toLocaleString("vi-VN")} VND đã được trừ từ ví của bạn.`
        : "Đã hủy tour thành công.",
    };
  }
}

