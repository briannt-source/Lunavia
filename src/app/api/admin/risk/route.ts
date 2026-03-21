import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/risk — Risk overview */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const [emergencies, disputes, lowTrustUsers] = await Promise.all([
      prisma.emergencyReport.count({ where: { status: "PENDING" } }),
      prisma.dispute.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }),
      prisma.user.count({ where: { trustScore: { lt: 30 } } }),
    ]);
    return NextResponse.json({ emergencies, disputes, lowTrustUsers, riskLevel: emergencies > 0 ? "HIGH" : disputes > 3 ? "MEDIUM" : "LOW" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
