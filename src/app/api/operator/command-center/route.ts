import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/operator/command-center — Operator command center data */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [activeTours, pendingApplications, totalGuides, activeEmergencies] = await Promise.all([
      prisma.tour.count({ where: { operatorId: session.user.id, status: "IN_PROGRESS" } }),
      prisma.application.count({ where: { tour: { operatorId: session.user.id }, status: "PENDING" } }),
      prisma.application.count({ where: { tour: { operatorId: session.user.id }, status: "ACCEPTED" } }),
      prisma.emergencyReport.count({ where: { tour: { operatorId: session.user.id }, status: "PENDING" } }),
    ]);

    return NextResponse.json({
      activeTours,
      pendingApplications,
      totalGuides,
      activeEmergencies,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
