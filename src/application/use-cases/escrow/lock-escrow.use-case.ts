import { EscrowService } from "@/domain/services/escrow.service";
import { EscrowError, UnauthorizedError } from "@/domain/errors/domain-errors";
import { prisma } from "@/lib/prisma";

export interface LockEscrowInput {
  escrowAccountId: string;
  operatorId: string;
}

export interface LockEscrowOutput {
  escrowAccountId: string;
  status: string;
  lockedAt: Date;
}

export class LockEscrowUseCase {
  async execute(input: LockEscrowInput): Promise<LockEscrowOutput> {
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

    // Lock escrow
    const lockedEscrow = await EscrowService.lockEscrow(input.escrowAccountId);

    return {
      escrowAccountId: lockedEscrow!.id,
      status: lockedEscrow!.status,
      lockedAt: lockedEscrow!.lockedAt!,
    };
  }
}

