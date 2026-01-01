import { prisma } from "@/lib/prisma";
import { EscrowError, InsufficientBalanceError, ValidationError } from "@/domain/errors/domain-errors";
import { PlatformFeeService } from "./platform-fee.service";

/**
 * Domain Service for Escrow Operations
 * Handles escrow account creation, locking, releasing, and refunding
 */
export class EscrowService {
  /**
   * Create escrow account when operator accepts application/assignment
   */
  static async createEscrowAccount(input: {
    operatorId: string;
    guideId: string;
    tourId?: string;
    standbyRequestId?: string;
    amount: number;
  }) {
    // Validate input
    if (input.amount <= 0) {
      throw new ValidationError("Amount must be greater than 0");
    }

    if (!input.tourId && !input.standbyRequestId) {
      throw new ValidationError("Either tourId or standbyRequestId is required");
    }

    // Calculate platform fee
    const feeDetails = await PlatformFeeService.calculateFee(
      input.amount,
      input.guideId,
      input.operatorId
    );

    // Check operator balance
    const operator = await prisma.user.findUnique({
      where: { id: input.operatorId },
      include: { wallet: true },
    });

    if (!operator?.wallet) {
      throw new Error("Operator wallet not found");
    }

    // For in-house: operator pays amount + fee
    // For freelance: operator pays amount (fee deducted from guide's payment)
    const operatorPays = feeDetails.isFreelance
      ? input.amount
      : input.amount + feeDetails.platformFee;

    const availableBalance = operator.wallet.balance - operator.wallet.reserved;

    if (operatorPays > availableBalance) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Required: ${operatorPays.toLocaleString("vi-VN")} VND, Available: ${availableBalance.toLocaleString("vi-VN")} VND`
      );
    }

    // Create escrow account
    const escrowAccount = await prisma.escrowAccount.create({
      data: {
        operatorId: input.operatorId,
        guideId: input.guideId,
        tourId: input.tourId,
        standbyRequestId: input.standbyRequestId,
        amount: input.amount,
        platformFee: feeDetails.platformFee,
        netAmount: feeDetails.netAmount,
        status: "PENDING",
      },
    });

    return escrowAccount;
  }

  /**
   * Lock funds in escrow (move from operator wallet to escrow)
   */
  static async lockEscrow(escrowAccountId: string) {
    const escrowAccount = await prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
      include: {
        operator: {
          include: { wallet: true },
        },
      },
    });

    if (!escrowAccount) {
      throw new Error("Escrow account not found");
    }

    if (escrowAccount.status !== "PENDING") {
      throw new EscrowError(`Escrow account is already ${escrowAccount.status}`);
    }

    // Check if guide is freelance or in-house
    const guide = await prisma.user.findUnique({
      where: { id: escrowAccount.guideId },
    });

    const isFreelance = guide?.employmentType !== "IN_HOUSE";

    // Calculate what operator needs to pay
    const operatorPays = isFreelance
      ? escrowAccount.amount
      : escrowAccount.amount + escrowAccount.platformFee;

    // Check balance again
    const availableBalance =
      escrowAccount.operator.wallet.balance - escrowAccount.operator.wallet.reserved;

    if (operatorPays > availableBalance) {
      throw new InsufficientBalanceError(
        `Insufficient balance to lock escrow. Required: ${operatorPays.toLocaleString("vi-VN")} VND`
      );
    }

    // Lock funds: Reserve amount in operator wallet
    await prisma.$transaction(async (tx) => {
      // Update operator wallet: reserve amount
      await tx.wallet.update({
        where: { userId: escrowAccount.operatorId },
        data: {
          reserved: { increment: operatorPays },
        },
      });

      // Update escrow status
      await tx.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          status: "LOCKED",
          lockedAt: new Date(),
        },
      });
    });

    return await prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
    });
  }

  /**
   * Release escrow funds to guide (after tour completion and report submission)
   */
  static async releaseEscrow(escrowAccountId: string, reason?: string) {
    const escrowAccount = await prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
      include: {
        operator: {
          include: { wallet: true },
        },
        guide: {
          include: { wallet: true },
        },
      },
    });

    if (!escrowAccount) {
      throw new Error("Escrow account not found");
    }

    if (escrowAccount.status !== "LOCKED") {
      throw new EscrowError(`Escrow account must be LOCKED to release. Current status: ${escrowAccount.status}`);
    }

    // Check for active disputes
    const { DisputeService } = await import("@/domain/services/dispute.service");
    const hasActiveDispute = await DisputeService.hasActiveDispute(escrowAccountId);
    if (hasActiveDispute) {
      throw new EscrowError("Cannot release escrow: There is an active dispute for this escrow account");
    }

    // Check if guide is freelance or in-house
    const guide = await prisma.user.findUnique({
      where: { id: escrowAccount.guideId },
    });

    const isFreelance = guide?.employmentType !== "IN_HOUSE";

    // Calculate what operator paid
    const operatorPays = isFreelance
      ? escrowAccount.amount
      : escrowAccount.amount + escrowAccount.platformFee;

    // Release funds: Transfer from escrow to guide
    const payment = await prisma.$transaction(async (tx) => {
      // Update operator wallet: deduct reserved amount
      await tx.wallet.update({
        where: { userId: escrowAccount.operatorId },
        data: {
          balance: { decrement: operatorPays },
          reserved: { decrement: operatorPays },
        },
      });

      // Update guide wallet: add net amount
      await tx.wallet.update({
        where: { userId: escrowAccount.guideId },
        data: {
          balance: { increment: escrowAccount.netAmount },
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          fromWalletId: escrowAccount.operator.wallet.id,
          toWalletId: escrowAccount.guide.wallet.id,
          amount: escrowAccount.amount,
          platformFee: escrowAccount.platformFee,
          netAmount: escrowAccount.netAmount,
          isFreelance: isFreelance,
          status: "COMPLETED",
          tourId: escrowAccount.tourId,
          standbyRequestId: escrowAccount.standbyRequestId,
          escrowAccountId: escrowAccountId,
        },
      });

      // Create transactions
      await tx.transaction.createMany({
        data: [
          {
            walletId: escrowAccount.operator.wallet.id,
            type: "OUTGOING",
            amount: -operatorPays,
            description: `Payment to guide (Escrow released)${escrowAccount.platformFee > 0 ? ` + Platform fee: ${escrowAccount.platformFee.toLocaleString("vi-VN")} VND` : ""}`,
            refId: payment.id,
          },
          {
            walletId: escrowAccount.guide.wallet.id,
            type: "INCOMING",
            amount: escrowAccount.netAmount,
            description: `Payment from operator (Escrow released)${escrowAccount.platformFee > 0 ? ` - Platform fee: ${escrowAccount.platformFee.toLocaleString("vi-VN")} VND` : ""}`,
            refId: payment.id,
          },
        ],
      });

      // Update escrow status
      await tx.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          status: "RELEASED",
          releasedAt: new Date(),
          releaseReason: reason,
        },
      });

      return payment;
    });

    return payment;
  }

  /**
   * Refund escrow funds to operator (if tour cancelled or dispute resolved)
   * @param escrowAccountId - ID of escrow account
   * @param amount - Amount to refund (if partial, otherwise full amount)
   * @param reason - Reason for refund
   */
  static async refundEscrow(escrowAccountId: string, amount?: number, reason?: string) {
    const escrowAccount = await prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
      include: {
        operator: {
          include: { wallet: true },
        },
      },
    });

    if (!escrowAccount) {
      throw new Error("Escrow account not found");
    }

    if (escrowAccount.status !== "LOCKED") {
      throw new EscrowError(`Escrow account must be LOCKED to refund. Current status: ${escrowAccount.status}`);
    }

    // If amount is provided, validate it
    const refundAmount = amount || escrowAccount.amount;
    if (refundAmount > escrowAccount.amount) {
      throw new ValidationError("Refund amount cannot exceed escrow amount");
    }

    // Check if guide is freelance or in-house
    const guide = await prisma.user.findUnique({
      where: { id: escrowAccount.guideId },
    });

    const isFreelance = guide?.employmentType !== "IN_HOUSE";

    // Calculate what operator paid
    const operatorPays = isFreelance
      ? escrowAccount.amount
      : escrowAccount.amount + escrowAccount.platformFee;

    // Refund: Release reserved amount back to operator
    await prisma.$transaction(async (tx) => {
      // Update operator wallet: release reserved amount
      await tx.wallet.update({
        where: { userId: escrowAccount.operatorId },
        data: {
          reserved: { decrement: operatorPays },
        },
      });

      // Update escrow status
      await tx.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          refundReason: reason,
        },
      });
    });

    return await prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
    });
  }

  /**
   * Cancel escrow account (if never locked)
   */
  static async cancelEscrow(escrowAccountId: string, reason?: string) {
    const escrowAccount = await prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
    });

    if (!escrowAccount) {
      throw new Error("Escrow account not found");
    }

    if (escrowAccount.status !== "PENDING") {
      throw new EscrowError(`Escrow account cannot be cancelled. Current status: ${escrowAccount.status}`);
    }

    await prisma.escrowAccount.update({
      where: { id: escrowAccountId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledReason: reason,
      },
    });

    return escrowAccount;
  }

  /**
   * Get escrow account by tour and guide
   */
  static async getEscrowByTourAndGuide(tourId: string, guideId: string) {
    return prisma.escrowAccount.findFirst({
      where: {
        tourId,
        guideId,
        status: { in: ["PENDING", "LOCKED"] },
      },
    });
  }
}

