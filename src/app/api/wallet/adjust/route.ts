import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const adjustWalletSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["CREDIT", "DEBIT"], {
    errorMap: () => ({ message: "Type must be CREDIT or DEBIT" }),
  }),
  reason: z.string().min(1, "Reason is required"),
});

/**
 * POST /api/wallet/adjust
 * Adjust wallet balance (Admin only)
 * 
 * NOTE: Wallet system is FROZEN. This is a simplified implementation.
 * Full implementation should use proper use cases and repositories.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = adjustWalletSchema.parse(body);

    // Get user wallet
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json(
        { success: false, error: "User or wallet not found" },
        { status: 404 }
      );
    }

    // Calculate new balance
    const newBalance =
      validated.type === "CREDIT"
        ? user.wallet.balance + validated.amount
        : user.wallet.balance - validated.amount;

    if (newBalance < 0) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { userId: validated.userId },
      data: { balance: newBalance },
    });

    // Create transaction record
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: user.wallet.id,
        type: validated.type === "CREDIT" ? "CREDIT" : "DEBIT",
        reason: "MANUAL",
        amount: validated.type === "CREDIT" ? validated.amount : -validated.amount,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        balance: updatedWallet.balance,
        transactionId: transaction.id,
      },
      message: "Wallet balance adjusted successfully",
    });
  } catch (error: any) {
    console.error("Error adjusting wallet balance:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || "Validation error",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}



