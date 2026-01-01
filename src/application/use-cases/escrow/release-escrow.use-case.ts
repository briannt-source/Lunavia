import { EscrowService } from "@/domain/services/escrow.service";
import { EscrowError, UnauthorizedError, TourNotFoundError } from "@/domain/errors/domain-errors";
import { NotificationService } from "@/domain/services/notification.service";
import { prisma } from "@/lib/prisma";

export interface ReleaseEscrowInput {
  escrowAccountId: string;
  operatorId: string;
  reason?: string;
}

export interface ReleaseEscrowOutput {
  paymentId: string;
  escrowAccountId: string;
  status: string;
  releasedAt: Date;
  amount: number;
  netAmount: number;
}

export class ReleaseEscrowUseCase {
  async execute(input: ReleaseEscrowInput): Promise<ReleaseEscrowOutput> {
    // Get escrow account with related data
    const escrowAccount = await prisma.escrowAccount.findUnique({
      where: { id: input.escrowAccountId },
      include: {
        tour: true,
      },
    });

    if (!escrowAccount) {
      throw new Error("Escrow account not found");
    }

    // Verify operator owns this escrow
    if (escrowAccount.operatorId !== input.operatorId) {
      throw new UnauthorizedError("You don't own this escrow account");
    }

    // If tour exists, verify tour has ended and report submitted
    if (escrowAccount.tourId && escrowAccount.tour) {
      const tour = escrowAccount.tour;
      const now = new Date();
      const tourEnd = tour.endDate ? new Date(tour.endDate) : new Date(tour.startDate);

      // Check if tour has ended
      if (tourEnd > now) {
        throw new EscrowError("Cannot release escrow before tour ends");
      }

      // Check if guide has submitted report
      const tourReport = await prisma.tourReport.findUnique({
        where: {
          tourId_guideId: {
            tourId: escrowAccount.tourId,
            guideId: escrowAccount.guideId,
          },
        },
      });

      if (!tourReport || !tourReport.submittedAt) {
        throw new EscrowError(
          "Cannot release escrow. Guide must submit tour report first."
        );
      }

      // Check if report was submitted within 2 hours after tour ended
      const reportSubmissionTime = new Date(tourReport.submittedAt);
      const hoursAfterTourEnd =
        (reportSubmissionTime.getTime() - tourEnd.getTime()) / (1000 * 60 * 60);

      if (hoursAfterTourEnd > 2) {
        throw new EscrowError(
          "Cannot release escrow. Tour report was submitted too late (more than 2 hours after tour ended)."
        );
      }
    }

    // Release escrow
    const payment = await EscrowService.releaseEscrow(
      input.escrowAccountId,
      input.reason || "Tour completed and report submitted"
    );

    // Notify guide
    await NotificationService.notifyPaymentSent(escrowAccount.guideId, payment.id);

    return {
      paymentId: payment.id,
      escrowAccountId: escrowAccount.id,
      status: "RELEASED",
      releasedAt: new Date(),
      amount: escrowAccount.amount,
      netAmount: escrowAccount.netAmount,
    };
  }
}

