import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/operator/wallet — Get operator wallet balance and stats */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
    if (!wallet) {
      return NextResponse.json({ balance: 0, currency: "VND", transactions: [] });
    }

    const recentTransactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      balance: wallet.balance,
      currency: "VND",
      transactions: recentTransactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
