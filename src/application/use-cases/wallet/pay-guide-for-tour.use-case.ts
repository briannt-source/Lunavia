import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";
import { NotificationService } from "@/domain/services/notification.service";
import { EscrowService } from "@/domain/services/escrow.service";

export interface PayGuideForTourInput {
  operatorId: string;
  tourId: string;
  guideId: string;
  amount: number;
}

export class PayGuideForTourUseCase {
  async execute(input: PayGuideForTourInput) {
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

    if (!tour.operator.wallet) {
      throw new Error("Operator wallet not found");
    }

    // Calculate platform fee to check if operator has enough balance
    const { PlatformFeeService } = await import("@/domain/services/platform-fee.service");
    const feeDetails = await PlatformFeeService.calculateFee(
      input.amount,
      input.guideId,
      input.operatorId
    );

    // For in-house: operator pays amount + fee
    // For freelance: operator pays amount (fee is deducted from guide's payment)
    const operatorPays = feeDetails.isFreelance
      ? input.amount
      : input.amount + feeDetails.platformFee;

    // Check available balance
    const availableBalance = tour.operator.wallet.balance;

    if (operatorPays > availableBalance) {
      throw new Error(
        `Insufficient available balance. Current: ${availableBalance.toLocaleString("vi-VN")} VND, Required: ${operatorPays.toLocaleString("vi-VN")} VND${feeDetails.platformFee > 0 ? ` (including platform fee: ${feeDetails.platformFee.toLocaleString("vi-VN")} VND)` : ""}`
      );
    }

    // Get guide wallet
    const guide = await prisma.user.findUnique({
      where: { id: input.guideId },
      include: {
        wallet: true,
      },
    });

    if (!guide || !guide.wallet) {
      throw new Error("Guide or wallet not found");
    }

    // Verify guide is assigned to this tour
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
      throw new Error(
        "Guide is not assigned to this tour. Only guides assigned to the tour can receive payment."
      );
    }

    // Check if tour has ended
    const now = new Date();
    const tourEnd = tour.endDate ? new Date(tour.endDate) : new Date(tour.startDate);
    
    if (tourEnd > now) {
      throw new Error("Cannot process payment for unfinished tour. Please wait until tour ends.");
    }

    // Check if guide has submitted tour report within 2 hours after tour ends
    const tourReport = await prisma.tourReport.findUnique({
      where: {
        tourId_guideId: {
          tourId: input.tourId,
          guideId: input.guideId,
        },
      },
    });

    if (!tourReport || !tourReport.submittedAt) {
      throw new Error(
        "Cannot process payment. Guide has not submitted tour report. Guide must submit report within 2 hours after tour ends to receive payment."
      );
    }

    // Check if report was submitted within 2 hours after tour ended
    const reportSubmissionTime = new Date(tourReport.submittedAt);
    const hoursAfterTourEnd = (reportSubmissionTime.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);
    
    if (hoursAfterTourEnd > 2) {
      throw new Error(
        "Cannot process payment. Tour report was submitted late (after 2 hours from tour end). Guide cannot receive payment for this tour."
      );
    }

    // Additional check: if more than 2 hours have passed since tour ended and no report was submitted on time
    const hoursSinceTourEnd = (now.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);
    if (hoursSinceTourEnd > 2 && hoursAfterTourEnd > 2) {
      throw new Error(
        "Cannot process payment. Tour report was submitted late. Guide cannot receive payment for this tour."
      );
    }

    // Check if escrow exists and is locked
    const escrowAccount = await EscrowService.getEscrowByTourAndGuide(
      input.tourId,
      input.guideId
    );

    if (escrowAccount && escrowAccount.status === "LOCKED") {
      // Release escrow instead of direct payment
      const payment = await EscrowService.releaseEscrow(
        escrowAccount.id,
        "Payment released after operator approval"
      );

      // Notify guide
      await NotificationService.notifyPaymentSent(input.guideId, payment.id);

      return payment;
    } else {
      // No escrow, use direct payment (backward compatibility)
      const payment = await WalletService.transfer(
        input.operatorId,
        input.guideId,
        input.amount,
        input.tourId
      );

      // Notify guide
      await NotificationService.notifyPaymentSent(input.guideId, payment.id);

      return payment;
    }
  }
}

