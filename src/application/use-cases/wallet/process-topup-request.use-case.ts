import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";

const OPERATOR_MIN_DEPOSIT = 1000000; // 1M VND

export interface ProcessTopUpRequestInput {
  adminId: string;
  requestId: string;
  action: "APPROVE" | "REJECT";
  adminNotes?: string;
}

export class ProcessTopUpRequestUseCase {
  async execute(input: ProcessTopUpRequestInput) {
    // Get top-up request
    const topUpRequest = await prisma.topUpRequest.findUnique({
      where: { id: input.requestId },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!topUpRequest) {
      throw new Error("Top-up request not found");
    }

    if (topUpRequest.status !== "PENDING") {
      throw new Error(`Request is already ${topUpRequest.status}`);
    }

    if (input.action === "REJECT") {
      // Reject request
      await prisma.topUpRequest.update({
        where: { id: input.requestId },
        data: {
          status: "REJECTED",
          adminNotes: input.adminNotes,
          processedAt: new Date(),
        },
      });

      return topUpRequest;
    }

    // Approve request
    const user = topUpRequest.user;
    if (!user.wallet) {
      throw new Error("User wallet not found");
    }

    // For operators: fill locked deposit first, then available balance
    if (
      user.role === "TOUR_OPERATOR" ||
      user.role === "TOUR_AGENCY"
    ) {
      // NOTE: Wallet model doesn't have 'lockedDeposit' field
      const currentLocked = 0;
      const neededForLocked = Math.max(0, OPERATOR_MIN_DEPOSIT - currentLocked);
      
      // If locked deposit is not full, topup must be enough to fill it completely
      if (neededForLocked > 0) {
        if (topUpRequest.amount < neededForLocked) {
          throw new Error(
            `Số tiền nạp không đủ để đạt deposit tối thiểu. Cần thêm ${(neededForLocked - topUpRequest.amount).toLocaleString("vi-VN")} VND nữa để đạt ${OPERATOR_MIN_DEPOSIT.toLocaleString("vi-VN")} VND`
          );
        }
        
        // Fill locked deposit completely, rest goes to balance
        const amountForLocked = neededForLocked;
        const amountForBalance = topUpRequest.amount - amountForLocked;

        await prisma.wallet.update({
          where: { userId: user.id },
          data: {
            // NOTE: Wallet model doesn't have 'lockedDeposit' field
            // All topup goes to balance
            balance: { increment: topUpRequest.amount },
          },
        });

        // Create transaction
        await prisma.walletTransaction.create({
          data: {
            walletId: user.wallet.id,
            type: "CREDIT",
            reason: "MANUAL",
            amount: topUpRequest.amount,
          },
        });
      } else {
        // Locked deposit is already full, all goes to balance
        await prisma.wallet.update({
          where: { userId: user.id },
          data: {
            balance: { increment: topUpRequest.amount },
          },
        });

        // Create transaction
        await prisma.walletTransaction.create({
          data: {
            walletId: user.wallet.id,
            type: "CREDIT",
            reason: "MANUAL",
            amount: topUpRequest.amount,
          },
        });
      }
    } else {
      // For guides: add to balance directly
      await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { increment: topUpRequest.amount },
        },
      });

      // Create transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: user.wallet.id,
          type: "CREDIT",
          reason: "MANUAL",
          amount: topUpRequest.amount,
        },
      });
    }

    // Update request status
    await prisma.topUpRequest.update({
      where: { id: input.requestId },
      data: {
        status: "APPROVED",
        adminNotes: input.adminNotes,
        processedAt: new Date(),
      },
    });

    return topUpRequest;
  }
}



