import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wallet
 * Get wallet balance for current user
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

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: wallet.balance,
        available: wallet.balance, // NOTE: Wallet model doesn't have 'reserved' field
      },
    });
  } catch (error: any) {
    console.error("Error fetching wallet balance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}



