import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/guide/earnings — Guide earnings summary */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
    const recentTx = wallet ? await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id, type: "CREDIT" },
      orderBy: { createdAt: "desc" }, take: 20,
    }) : [];

    const totalEarned = recentTx.reduce((sum, t) => sum + Number(t.amount), 0);
    return NextResponse.json({ totalEarned, currency: "VND", balance: wallet?.balance || 0, transactions: recentTx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
