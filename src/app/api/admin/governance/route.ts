import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/governance — Governance dashboard */
export async function GET(req: NextRequest) {
  try {
    const { checkPermission } = await import("@/lib/permission-helpers");
    const { hasPermission } = await checkPermission("TRUST_VIEW_HISTORY" as any);
    if (!hasPermission) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [totalUsers, verifiedUsers, activeDisputes, activeEmergencies] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verifiedStatus: "APPROVED" } }),
      prisma.dispute.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }),
      prisma.emergencyReport.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({ totalUsers, verifiedUsers, activeDisputes, activeEmergencies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
