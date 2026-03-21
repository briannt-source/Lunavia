import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";

/** GET /api/admin/governance/guide-reliability — Guide reliability metrics */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { prisma } = await import("@/lib/prisma");
    const guides = await prisma.user.findMany({
      where: { role: "TOUR_GUIDE", verifiedStatus: "APPROVED" },
      select: { id: true, name: true, trustScore: true },
      orderBy: { trustScore: "desc" },
      take: 50,
    });

    return NextResponse.json({
      guides: guides.map(g => ({
        id: g.id, name: g.name, trustScore: g.trustScore,
        reliability: g.trustScore >= 80 ? "HIGH" : g.trustScore >= 50 ? "MEDIUM" : "LOW",
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
