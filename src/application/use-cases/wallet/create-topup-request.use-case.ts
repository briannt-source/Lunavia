import { prisma } from "@/lib/prisma";

export interface CreateTopUpRequestInput {
  userId: string;
  amount: number;
  method: string;
  paymentMethodId?: string;
  customAccountInfo?: string;
}

export class CreateTopUpRequestUseCase {
  async execute(input: CreateTopUpRequestInput) {
    if (input.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify payment method if provided
    if (input.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: input.paymentMethodId },
      });

      if (!paymentMethod || paymentMethod.userId !== input.userId) {
        throw new Error("Payment method not found or unauthorized");
      }
    }

    // Create top-up request
    const topUpRequest = await prisma.topUpRequest.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        method: input.method,
        paymentMethodId: input.paymentMethodId || null,
        customAccountInfo: input.customAccountInfo || null,
        status: "PENDING",
      },
    });

    return topUpRequest;
  }
}



