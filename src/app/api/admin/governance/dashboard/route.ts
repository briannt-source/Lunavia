import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/governance/dashboard — Governance panel data */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    const daysBack = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const [newUsers, newTours, disputes, emergencies] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.tour.count({ where: { createdAt: { gte: since } } }),
      prisma.dispute.count({ where: { createdAt: { gte: since } } }),
      prisma.emergency.count({ where: { createdAt: { gte: since } } }),
    ]);

    return NextResponse.json({ range, since, newUsers, newTours, disputes, emergencies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
