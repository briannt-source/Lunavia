import { prisma } from "@/lib/prisma";
import { PayGuideForTourUseCase } from "@/application/use-cases/wallet/pay-guide-for-tour.use-case";
import { NotificationService } from "@/domain/services/notification.service";

export interface ApprovePaymentRequestInput {
  operatorId: string;
  reportId: string;
  autoApprove?: boolean; // Internal flag for auto-approval
}

export class ApprovePaymentRequestUseCase {
  async execute(input: ApprovePaymentRequestInput) {
    // Get tour report
    const report = await prisma.tourReport.findUnique({
      where: { id: input.reportId },
      include: {
        tour: true,
      },
    });

    if (!report) {
      throw new Error("Tour report not found");
    }

    // Verify operator owns the tour
    if (report.tour.operatorId !== input.operatorId) {
      throw new Error("Unauthorized: You don't own this tour");
    }

    if (report.paymentRequestStatus !== "PENDING") {
      throw new Error(`Payment request is already ${report.paymentRequestStatus}`);
    }

    if (!report.paymentRequestAmount || report.paymentRequestAmount <= 0) {
      throw new Error("Invalid payment request amount");
    }

    // Check auto-approve settings (if not already auto-approved)
    if (!input.autoApprove) {
      const operatorSettings = await prisma.userSettings.findUnique({
        where: { userId: input.operatorId },
      });

      if (
        operatorSettings?.autoApprovePayments &&
        operatorSettings.autoApproveThreshold &&
        report.paymentRequestAmount <= operatorSettings.autoApproveThreshold
      ) {
        // Auto-approve this payment request
        return await this.execute({
          ...input,
          autoApprove: true,
        });
      }
    }

    // Check if tour has ended
    const now = new Date();
    const tourEnd = report.tour.endDate 
      ? new Date(report.tour.endDate) 
      : new Date(report.tour.startDate);
    
    if (tourEnd > now) {
      throw new Error("Không thể duyệt thanh toán cho tour chưa kết thúc. Vui lòng đợi tour kết thúc.");
    }

    // Check if report was submitted within 2 hours after tour ended
    if (!report.submittedAt) {
      throw new Error(
        "Không thể duyệt thanh toán. Guide chưa nộp báo cáo tour. Guide phải nộp báo cáo trong vòng 2 giờ sau khi tour kết thúc."
      );
    }

    const reportSubmissionTime = new Date(report.submittedAt);
    const hoursAfterTourEnd = (reportSubmissionTime.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);
    
    if (hoursAfterTourEnd > 2) {
      throw new Error(
        "Không thể duyệt thanh toán. Báo cáo tour đã được nộp quá hạn (sau 2 giờ kể từ khi tour kết thúc). Guide không thể nhận thanh toán cho tour này."
      );
    }

    // Pay guide
    const payUseCase = new PayGuideForTourUseCase();
    await payUseCase.execute({
      operatorId: input.operatorId,
      tourId: report.tourId,
      guideId: report.guideId,
      amount: report.paymentRequestAmount,
    });

    // Update report
    await prisma.tourReport.update({
      where: { id: input.reportId },
      data: {
        paymentRequestStatus: "APPROVED",
        approvedAt: new Date(),
      },
    });

    return report;
  }
}




