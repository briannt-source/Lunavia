import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/ops/dashboard — Operations dashboard */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [activeTours, pendingApps, activeEmergencies] = await Promise.all([
      prisma.tour.count({ where: { status: "IN_PROGRESS" } }),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.emergency.count({ where: { status: "ACTIVE" } }),
    ]);
    return NextResponse.json({ activeTours, pendingApps, activeEmergencies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
