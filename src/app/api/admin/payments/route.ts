import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/payments — List payments with filter
 *  POST /api/admin/payments — not needed currently */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) where.status = status;

    const [topups, withdrawals] = await Promise.all([
      prisma.topUpRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.withdrawalRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 }),
    ]);

    return NextResponse.json({ topups, withdrawals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
