import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/platform-intelligence — Platform analytics */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsers, activeTours, completedTours, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.tour.count({ where: { status: "IN_PROGRESS" } }),
      prisma.tour.count({ where: { status: "COMPLETED" } }),
      prisma.transaction.aggregate({ where: { type: "EARNING" }, _sum: { amount: true } }),
    ]);
    return NextResponse.json({ totalUsers, newUsers, activeTours, completedTours, totalRevenue: totalRevenue._sum.amount || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
