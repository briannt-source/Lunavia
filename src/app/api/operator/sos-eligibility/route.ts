import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/operator/sos-eligibility — Check if operator can trigger SOS */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prisma } = await import("@/lib/prisma");
    const activeTours = await prisma.tour.count({
      where: { operatorId: session.user.id, status: "IN_PROGRESS" },
    });

    return NextResponse.json({
      eligible: activeTours > 0,
      activeTours,
      reason: activeTours > 0 ? "Has active tours" : "No active tours",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
