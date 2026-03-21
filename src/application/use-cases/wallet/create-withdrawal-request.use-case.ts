import { prisma } from "@/lib/prisma";

const GUIDE_MIN_BALANCE = 500000; // 500k VND

export interface CreateWithdrawalRequestInput {
  userId: string;
  amount: number;
  method: "BANK" | "MOMO" | "ZALO" | "OTHER";
  paymentMethodId?: string;
  customAccountInfo?: string;
  accountOwnerName?: string;
}

export class CreateWithdrawalRequestUseCase {
  async execute(input: CreateWithdrawalRequestInput) {
    if (input.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Get user with wallet and profile
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        wallet: true,
        profile: true,
      },
    });

    if (!user || !user.wallet) {
      throw new Error("User or wallet not found");
    }

    // Check available balance
    const availableBalance = user.wallet.balance;

    if (input.amount > availableBalance) {
      throw new Error("Insufficient available balance");
    }

    // For guides, check minimum balance after withdrawal
    if (user.role === "TOUR_GUIDE") {
      const balanceAfterWithdrawal = user.wallet.balance - input.amount;
      if (balanceAfterWithdrawal < GUIDE_MIN_BALANCE) {
        throw new Error(
          `Sau khi rút, số dư phải còn tối thiểu ${GUIDE_MIN_BALANCE.toLocaleString("vi-VN")} VND`
        );
      }
    }

    // For operators, cannot withdraw locked deposit
    if (
      (user.role === "TOUR_OPERATOR" || user.role === "TOUR_AGENCY") &&
      input.amount > availableBalance
    ) {
      throw new Error("Cannot withdraw locked deposit");
    }

    // Verify payment method if provided
    if (input.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: input.paymentMethodId },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!paymentMethod || paymentMethod.userId !== input.userId) {
        throw new Error("Payment method not found or unauthorized");
      }

      // If using saved method, verify it's verified or require verification
      if (!paymentMethod.isVerified && !input.accountOwnerName) {
        throw new Error("Payment method not verified. Please verify account holder first.");
      }
    } else if (input.customAccountInfo) {
      // If using custom account, verify account owner name matches user's name
      if (!input.accountOwnerName) {
        throw new Error("Please enter account holder name for confirmation");
      }

      const userName = user.profile?.name || "";
      if (input.accountOwnerName.trim().toLowerCase() !== userName.trim().toLowerCase()) {
        throw new Error("Account holder name does not match your profile name. Please check again.");
      }
    } else {
      throw new Error("Please select a saved payment method or enter new account details");
    }

    // Create withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        method: input.method,
        paymentMethodId: input.paymentMethodId || null,
        customAccountInfo: input.customAccountInfo || null,
        accountOwnerName: input.accountOwnerName || null,
        status: "PENDING",
      },
    });

    return withdrawalRequest;
  }
}



