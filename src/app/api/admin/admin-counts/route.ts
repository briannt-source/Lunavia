import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/admin-counts — Dashboard counts for admin panel */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const [users, tours, disputes, emergencies, topups, withdrawals, verifications] = await Promise.all([
      prisma.user.count(),
      prisma.tour.count(),
      prisma.dispute.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }),
      prisma.emergency.count({ where: { status: "ACTIVE" } }),
      prisma.topUpRequest.count({ where: { status: "PENDING" } }),
      prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
      prisma.verificationDocument.count({ where: { status: "PENDING" } }),
    ]);
    return NextResponse.json({ users, tours, disputes, emergencies, topups, withdrawals, verifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
