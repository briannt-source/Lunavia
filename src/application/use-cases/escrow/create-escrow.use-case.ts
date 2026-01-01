import { EscrowService } from "@/domain/services/escrow.service";
import { TourNotFoundError, UnauthorizedError, ValidationError } from "@/domain/errors/domain-errors";
import { prisma } from "@/lib/prisma";

export interface CreateEscrowInput {
  operatorId: string;
  guideId: string;
  tourId?: string;
  standbyRequestId?: string;
  amount: number;
}

export interface CreateEscrowOutput {
  escrowAccountId: string;
  status: string;
  amount: number;
  platformFee: number;
  netAmount: number;
}

export class CreateEscrowUseCase {
  async execute(input: CreateEscrowInput): Promise<CreateEscrowOutput> {
    // Validate input
    if (!input.tourId && !input.standbyRequestId) {
      throw new ValidationError("Either tourId or standbyRequestId is required");
    }

    // If tourId provided, verify tour exists and operator owns it
    if (input.tourId) {
      const tour = await prisma.tour.findUnique({
        where: { id: input.tourId },
      });

      if (!tour) {
        throw new TourNotFoundError();
      }

      if (tour.operatorId !== input.operatorId) {
        throw new UnauthorizedError("You don't own this tour");
      }
    }

    // If standbyRequestId provided, verify it exists and operator owns it
    if (input.standbyRequestId) {
      const standbyRequest = await prisma.standbyRequest.findUnique({
        where: { id: input.standbyRequestId },
      });

      if (!standbyRequest) {
        throw new Error("Standby request not found");
      }

      if (standbyRequest.operatorId !== input.operatorId) {
        throw new UnauthorizedError("You don't own this standby request");
      }
    }

    // Check if escrow already exists
    if (input.tourId) {
      const existingEscrow = await EscrowService.getEscrowByTourAndGuide(
        input.tourId,
        input.guideId
      );

      if (existingEscrow) {
        throw new ValidationError("Escrow account already exists for this tour and guide");
      }
    }

    // Create escrow account
    const escrowAccount = await EscrowService.createEscrowAccount({
      operatorId: input.operatorId,
      guideId: input.guideId,
      tourId: input.tourId,
      standbyRequestId: input.standbyRequestId,
      amount: input.amount,
    });

    return {
      escrowAccountId: escrowAccount.id,
      status: escrowAccount.status,
      amount: escrowAccount.amount,
      platformFee: escrowAccount.platformFee,
      netAmount: escrowAccount.netAmount,
    };
  }
}

