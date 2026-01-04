import { prisma } from "@/lib/prisma";

export interface ProcessWithdrawalRequestInput {
  adminId: string;
  requestId: string;
  action: "APPROVE" | "REJECT";
  adminNotes?: string;
}

export class ProcessWithdrawalRequestUseCase {
  async execute(input: ProcessWithdrawalRequestInput) {
    // Get withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id: input.requestId },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!withdrawalRequest) {
      throw new Error("Withdrawal request not found");
    }

    if (withdrawalRequest.status !== "PENDING") {
      throw new Error(`Request is already ${withdrawalRequest.status}`);
    }

    if (input.action === "REJECT") {
      // Reject request
      await prisma.withdrawalRequest.update({
        where: { id: input.requestId },
        data: {
          status: "REJECTED",
          adminNotes: input.adminNotes,
          processedAt: new Date(),
        },
      });

      return withdrawalRequest;
    }

    // Approve request
    const user = withdrawalRequest.user;
    if (!user.wallet) {
      throw new Error("User wallet not found");
    }

    // Check available balance
    const availableBalance = user.wallet.balance - user.wallet.reserved;

    if (withdrawalRequest.amount > availableBalance) {
      throw new Error("Insufficient available balance");
    }

    // Deduct from balance
    await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        balance: { decrement: withdrawalRequest.amount },
      },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        walletId: user.wallet.id,
        type: "WITHDRAWAL",
        amount: -withdrawalRequest.amount,
        description: `Withdrawal: ${withdrawalRequest.amount.toLocaleString("vi-VN")} VND via ${withdrawalRequest.method}`,
        refId: withdrawalRequest.id,
      },
    });

    // Update request status
    await prisma.withdrawalRequest.update({
      where: { id: input.requestId },
      data: {
        status: "APPROVED",
        adminNotes: input.adminNotes,
        processedAt: new Date(),
      },
    });

    return withdrawalRequest;
  }
}









