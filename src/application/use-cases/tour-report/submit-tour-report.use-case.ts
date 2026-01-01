import { prisma } from "@/lib/prisma";
import { EscrowService } from "@/domain/services/escrow.service";
import { PaymentMilestoneService } from "@/domain/services/payment-milestone.service";

export interface SubmitTourReportInput {
  guideId: string;
  tourId: string;
  overallRating?: number;
  clientSatisfaction?: number;
  highlights?: string;
  challenges?: string;
  recommendations?: string;
  paymentRequestAmount?: number;
}

export class SubmitTourReportUseCase {
  async execute(input: SubmitTourReportInput) {
    // Get tour with operator and settings
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      include: {
        operator: true,
      },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Check if guide was accepted for this tour
    const application = await prisma.application.findFirst({
      where: {
        tourId: input.tourId,
        guideId: input.guideId,
        status: "ACCEPTED",
      },
    });

    const assignment = await prisma.assignment.findFirst({
      where: {
        tourId: input.tourId,
        guideId: input.guideId,
        status: "APPROVED",
      },
    });

    if (!application && !assignment) {
      throw new Error("You are not assigned to this tour");
    }

    // Check if tour has ended
    const now = new Date();
    const tourEnd = tour.endDate ? new Date(tour.endDate) : new Date(tour.startDate);
    
    if (tourEnd > now) {
      throw new Error("Chỉ có thể nộp báo cáo tour sau khi tour đã kết thúc");
    }

    // Check if report is submitted within 2 hours after tour ends
    const hoursSinceTourEnd = (now.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);
    if (hoursSinceTourEnd > 2) {
      throw new Error("Báo cáo tour phải được nộp trong vòng 2 giờ sau khi tour kết thúc. Thời hạn đã hết. Bạn sẽ không thể nhận thanh toán cho tour này.");
    }

    // Check if report was already submitted (and if it was on time)
    const existingReport = await prisma.tourReport.findUnique({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
    });

    // If report exists and was submitted after 2 hours, don't allow update
    if (existingReport && existingReport.submittedAt) {
      const reportSubmissionTime = new Date(existingReport.submittedAt);
      const hoursWhenSubmitted = (reportSubmissionTime.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);
      
      if (hoursWhenSubmitted > 2) {
        throw new Error("Báo cáo tour đã được nộp quá hạn (sau 2 giờ). Không thể cập nhật. Bạn sẽ không thể nhận thanh toán cho tour này.");
      }
    }

    // Check if operator has auto-approve enabled
    let paymentRequestStatus: "PENDING" | "APPROVED" = "PENDING";
    let shouldAutoApprove = false;

    const operatorSettings = await prisma.userSettings.findUnique({
      where: { userId: tour.operatorId },
    });

    if (
      input.paymentRequestAmount &&
      operatorSettings?.autoApprovePayments &&
      operatorSettings.autoApproveThreshold &&
      input.paymentRequestAmount <= operatorSettings.autoApproveThreshold
    ) {
      shouldAutoApprove = true;
      paymentRequestStatus = "APPROVED";
    }

    // Create or update tour report
    const report = await prisma.tourReport.upsert({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
      update: {
        overallRating: input.overallRating,
        clientSatisfaction: input.clientSatisfaction,
        highlights: input.highlights,
        challenges: input.challenges,
        recommendations: input.recommendations,
        paymentRequestAmount: input.paymentRequestAmount,
        paymentRequestStatus: input.paymentRequestAmount
          ? paymentRequestStatus
          : undefined,
        submittedAt: new Date(),
        approvedAt: shouldAutoApprove ? new Date() : undefined,
      },
      create: {
        tourId: input.tourId,
        guideId: input.guideId,
        overallRating: input.overallRating,
        clientSatisfaction: input.clientSatisfaction,
        highlights: input.highlights,
        challenges: input.challenges,
        recommendations: input.recommendations,
        paymentRequestAmount: input.paymentRequestAmount,
        paymentRequestStatus: input.paymentRequestAmount ? paymentRequestStatus : "PENDING",
        submittedAt: new Date(),
        approvedAt: shouldAutoApprove ? new Date() : undefined,
      },
    });

    // If auto-approved, try to release escrow first, then process payment
    if (shouldAutoApprove && input.paymentRequestAmount) {
      try {
        // Check if escrow exists and try to release it
        const escrowAccount = await EscrowService.getEscrowByTourAndGuide(
          input.tourId,
          input.guideId
        );

        if (escrowAccount && escrowAccount.status === "LOCKED") {
          // Release escrow (this will create payment automatically)
          await EscrowService.releaseEscrow(
            escrowAccount.id,
            "Auto-released after tour report submission and auto-approval"
          );
        } else {
          // No escrow, use direct payment
          const { PayGuideForTourUseCase } = await import(
            "@/application/use-cases/wallet/pay-guide-for-tour.use-case"
          );
          const payUseCase = new PayGuideForTourUseCase();
          
          await payUseCase.execute({
            operatorId: tour.operatorId,
            tourId: input.tourId,
            guideId: input.guideId,
            amount: input.paymentRequestAmount,
          });
        }
      } catch (error) {
        // If payment fails, revert status to PENDING
        await prisma.tourReport.update({
          where: {
            tourId_guideId: {
              tourId: input.tourId,
              guideId: input.guideId,
            },
          },
          data: {
            paymentRequestStatus: "PENDING",
            approvedAt: null,
          },
        });
        throw error;
      }
    }

    return report;
  }
}




