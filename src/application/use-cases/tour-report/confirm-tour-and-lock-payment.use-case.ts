import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";
import { SendNotificationUseCase } from "@/application/use-cases/notification/send-notification.use-case";

export interface ConfirmTourAndLockPaymentInput {
  operatorId: string;
  tourId: string;
  guideId: string;
  paymentAmount: number;
  notes?: string;
}

export class ConfirmTourAndLockPaymentUseCase {
  async execute(input: ConfirmTourAndLockPaymentInput) {
    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      include: {
        operator: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify operator owns the tour
    if (tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    // Get tour report
    const report = await prisma.tourReport.findUnique({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
      include: {
        guide: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!report) {
      throw new Error("Tour report not found. Guide must submit report first.");
    }

    if (report.approvedAt) {
      throw new Error("Tour đã được xác nhận và thanh toán rồi");
    }

    // Verify operator has enough balance
    if (!tour.operator.wallet) {
      throw new Error("Operator wallet not found");
    }

    if (tour.operator.wallet.balance < input.paymentAmount) {
      throw new Error(
        `Số dư không đủ. Cần ${input.paymentAmount.toLocaleString("vi-VN")} VND, hiện có ${tour.operator.wallet.balance.toLocaleString("vi-VN")} VND`
      );
    }

    // Lock the payment amount in operator's wallet
    await WalletService.reserve(
      tour.operatorId,
      input.paymentAmount
    );

    // Calculate payment due date (24 hours from now)
    const paymentDueAt = new Date();
    paymentDueAt.setHours(paymentDueAt.getHours() + 24);

    // Update tour report with locked payment
    const updatedReport = await prisma.tourReport.update({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
      data: {
        approvedAt: new Date(),
        operatorNotes: input.notes,
        paymentLockedAmount: input.paymentAmount,
        paymentLockedAt: new Date(),
        paymentDueAt,
        paymentRequestStatus: "APPROVED",
      },
    });

    // Notify guide
    const notifyUseCase = new SendNotificationUseCase();
    await notifyUseCase.execute({
      userId: input.guideId,
      type: "PAYMENT",
      title: "Tour đã được xác nhận - Thanh toán đã được khóa",
      message: `Tour operator đã xác nhận tour và khóa số tiền ${input.paymentAmount.toLocaleString("vi-VN")} VND. Thanh toán sẽ được thực hiện trong vòng 24 giờ.`,
      link: `/dashboard/guide/tours/${input.tourId}`,
    });

    return {
      report: updatedReport,
      lockedAmount: input.paymentAmount,
      paymentDueAt,
      message: `Đã xác nhận tour và khóa ${input.paymentAmount.toLocaleString("vi-VN")} VND. Thanh toán sẽ được thực hiện trong vòng 24 giờ.`,
    };
  }
}

