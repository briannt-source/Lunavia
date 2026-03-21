import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/governance/risk-events — Risk events */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const riskEvents = await prisma.emergency.findMany({
      include: { tour: { select: { id: true, title: true, city: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(riskEvents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
