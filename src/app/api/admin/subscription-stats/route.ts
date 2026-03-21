import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/subscription-stats — Subscription statistics (by role) */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // User model doesn't have subscriptionTier — group by role instead
    const stats = await prisma.user.groupBy({ by: ["role"], _count: true });
    return NextResponse.json(stats.map(s => ({ role: s.role, count: s._count })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
