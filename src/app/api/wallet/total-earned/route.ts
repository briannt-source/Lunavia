import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json({ totalEarned: 0 });
    }

    // Calculate total earned (sum of all payments received by this guide)
    const totalEarned = await prisma.payment.aggregate({
      where: {
        toWalletId: wallet.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      totalEarned: totalEarned._sum?.amount || 0,
    });
  } catch (error: any) {
    console.error("Error calculating total earned:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

