import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/observer/investor/metrics — Investor metrics dashboard */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { prisma } = await import("@/lib/prisma");
    const [users, tours, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.tour.count(),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
    ]);
    return NextResponse.json({ totalUsers: users, totalTours: tours, totalRevenue: revenue._sum.amount || 0, currency: "VND" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
