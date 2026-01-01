import { EscrowService } from "@/domain/services/escrow.service";
import { EscrowError, UnauthorizedError } from "@/domain/errors/domain-errors";
import { NotificationService } from "@/domain/services/notification.service";
import { prisma } from "@/lib/prisma";

export interface RefundEscrowInput {
  escrowAccountId: string;
  operatorId: string;
  reason?: string;
}

export interface RefundEscrowOutput {
  escrowAccountId: string;
  status: string;
  refundedAt: Date;
  amount: number;
}

export class RefundEscrowUseCase {
  async execute(input: RefundEscrowInput): Promise<RefundEscrowOutput> {
    // Get escrow account
    const escrowAccount = await prisma.escrowAccount.findUnique({
      where: { id: input.escrowAccountId },
    });

    if (!escrowAccount) {
      throw new Error("Escrow account not found");
    }

    // Verify operator owns this escrow
    if (escrowAccount.operatorId !== input.operatorId) {
      throw new UnauthorizedError("You don't own this escrow account");
    }

    // Refund escrow
    const refundedEscrow = await EscrowService.refundEscrow(
      input.escrowAccountId,
      input.reason || "Tour cancelled or dispute resolved"
    );

    // Notify guide about refund
    await NotificationService.notifyPaymentSent(
      escrowAccount.guideId,
      `escrow-refund-${escrowAccount.id}`
    );

    return {
      escrowAccountId: refundedEscrow!.id,
      status: refundedEscrow!.status,
      refundedAt: refundedEscrow!.refundedAt!,
      amount: refundedEscrow!.amount,
    };
  }
}

