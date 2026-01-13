import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wallet/transactions
 * Get wallet transactions for current user
 * 
 * NOTE: Wallet system is FROZEN. This is a simplified implementation.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Get transactions
    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 transactions
    });

    return NextResponse.json({
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        reason: t.reason,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching wallet transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
