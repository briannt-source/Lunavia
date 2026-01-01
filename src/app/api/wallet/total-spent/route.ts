import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      return NextResponse.json({ totalSpent: 0 });
    }

    // Calculate total spent (sum of all payments sent by this operator)
    const totalSpent = await prisma.payment.aggregate({
      where: {
        fromWalletId: wallet.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      totalSpent: totalSpent._sum?.amount || 0,
    });
  } catch (error: any) {
    console.error("Error calculating total spent:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

