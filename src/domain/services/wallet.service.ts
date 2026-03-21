import { prisma } from "@/lib/prisma";

const OPERATOR_MIN_DEPOSIT = 1000000; // 1M VND
const GUIDE_MIN_BALANCE = 500000; // 500k VND

export class WalletService {
  /**
   * Check if operator can create tour (needs 1M locked deposit + license)
   */
  static async canCreateTour(userId: string): Promise<{
    canCreate: boolean;
    reason?: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return { canCreate: false, reason: "User not found" };
    }

    // Only operators/agencies can create tours
    if (user.role !== "TOUR_OPERATOR" && user.role !== "TOUR_AGENCY") {
      return {
        canCreate: false,
        reason: "Only Tour Operators/Agencies can create tours",
      };
    }

    // Check license
    if (!user.licenseNumber) {
      return {
        canCreate: false,
        reason: "Business registration license number required",
      };
    }

    // Check verification status
    if (user.verifiedStatus !== "APPROVED") {
      return {
        canCreate: false,
        reason: "Account not verified",
      };
    }

    // Check balance (NOTE: Wallet model doesn't have 'lockedDeposit' field)
    if (!user.wallet || user.wallet.balance < OPERATOR_MIN_DEPOSIT) {
      return {
        canCreate: false,
        reason: `Cần số dư tối thiểu ${OPERATOR_MIN_DEPOSIT.toLocaleString("vi-VN")} VND`,
      };
    }

    return { canCreate: true };
  }

  /**
   * Check if guide can apply to tours (needs 500k balance)
   */
  static async canApplyToTour(userId: string): Promise<{
    canApply: boolean;
    reason?: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return { canApply: false, reason: "User not found" };
    }

    if (user.role !== "TOUR_GUIDE") {
      return { canApply: false, reason: "Only tour guides can apply for tours" };
    }

    if (user.verifiedStatus !== "APPROVED") {
      return { canApply: false, reason: "Account not verified" };
    }

    const balance = user.wallet?.balance || 0;
    if (balance < GUIDE_MIN_BALANCE) {
      return {
        canApply: false,
        reason: `Cần số dư tối thiểu ${GUIDE_MIN_BALANCE.toLocaleString("vi-VN")} VND`,
      };
    }

    return { canApply: true };
  }

  /**
   * Initialize wallet for new user
   */
  static async initializeWallet(userId: string, role: string) {
    const existing = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    // NOTE: Wallet model doesn't have 'lockedDeposit' or 'reserved' fields
    return prisma.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }

  /**
   * Lock deposit for operator
   * NOTE: Wallet model doesn't have 'lockedDeposit' field - this is a no-op
   */
  static async lockDeposit(userId: string, amount: number) {
    // No-op: Wallet model doesn't support locked deposit
    return prisma.wallet.findUnique({
      where: { userId },
    });
  }

  /**
   * Reserve amount from wallet
   */
  static async reserve(userId: string, amount: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Note: reserved field removed, simplified to balance only
    return prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Release reserved amount
   */
  static async release(userId: string, amount: number) {
    // Note: reserved field removed, simplified to balance only
    return prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Transfer between wallets with platform fee calculation
   */
  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    tourId?: string,
    standbyRequestId?: string
  ) {
    // Calculate platform fee
    const { PlatformFeeService } = await import("./platform-fee.service");
    const feeDetails = await PlatformFeeService.calculateFee(
      amount,
      toUserId,
      fromUserId
    );

    return prisma.$transaction(async (tx) => {
      // Check from wallet
      const fromWallet = await tx.wallet.findUnique({
        where: { userId: fromUserId },
      });

      if (!fromWallet) {
        throw new Error("From wallet not found");
      }

      // For in-house: operator pays amount + fee
      // For freelance: operator pays amount (fee is deducted from guide's payment)
      const operatorPays = feeDetails.isFreelance
        ? amount
        : amount + feeDetails.platformFee;

      if (fromWallet.balance < operatorPays) {
        throw new Error("Insufficient balance");
      }

      // Update from wallet (operator pays full amount including fee for in-house)
      await tx.wallet.update({
        where: { userId: fromUserId },
        data: {
          balance: { decrement: operatorPays },
        },
      });

      // Update to wallet (guide receives net amount)
      const toWallet = await tx.wallet.findUnique({
        where: { userId: toUserId },
      });

      if (!toWallet) {
        throw new Error("To wallet not found");
      }

      await tx.wallet.update({
        where: { userId: toUserId },
        data: {
          balance: { increment: feeDetails.netAmount },
        },
      });

      // Create payment record with fee details
      const payment = await tx.payment.create({
        data: {
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          amount, // Gross amount
          platformFee: feeDetails.platformFee,
          netAmount: feeDetails.netAmount,
          isFreelance: feeDetails.isFreelance,
          employmentContractUrl: feeDetails.employmentContractUrl,
          status: "COMPLETED",
          tourId,
          standbyRequestId,
        },
      });

      // Create transactions
      await tx.walletTransaction.createMany({
        data: [
          {
            walletId: fromWallet.id,
            type: "DEBIT",
            reason: "MANUAL",
            amount: -operatorPays,
          },
          {
            walletId: toWallet.id,
            type: "CREDIT",
            reason: "MANUAL",
            amount: feeDetails.netAmount,
          },
        ],
      });

      // If platform fee > 0, create transaction for platform (we'll need a platform wallet)
      // For now, we'll just record it in the payment record
      // TODO: Create platform wallet and transfer fee there

      return payment;
    });
  }
}

