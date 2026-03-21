import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/health
 * Returns the health score and metrics for a tour.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        safetyCheckIns: true,
        emergencies: true,
        applications: { where: { status: "ACCEPTED" } },
        assignments: { where: { status: "APPROVED" } },
        _count: {
          select: { safetyCheckIns: true, emergencies: true },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Calculate health metrics
    const totalCheckIns = tour._count.safetyCheckIns;
    const completedCheckIns = tour.safetyCheckIns.filter((c) => c.status === "COMPLETED").length;
    const emergencyCount = tour._count.emergencies;
    const hasGuides = tour.applications.length > 0 || tour.assignments.length > 0;

    // Health score calculation (0-100)
    let healthScore = 100;

    // Deductions
    if (!hasGuides) healthScore -= 30; // No guides assigned
    if (emergencyCount > 0) healthScore -= emergencyCount * 15; // Each emergency
    if (totalCheckIns > 0 && completedCheckIns < totalCheckIns) {
      const missedRatio = (totalCheckIns - completedCheckIns) / totalCheckIns;
      healthScore -= Math.round(missedRatio * 25); // Missed check-ins
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    const riskLevel = healthScore >= 80 ? "GREEN" : healthScore >= 50 ? "YELLOW" : "RED";

    return NextResponse.json({
      tourId,
      healthScore,
      riskLevel,
      metrics: {
        hasGuides,
        totalCheckIns,
        completedCheckIns,
        emergencyCount,
        guideCount: tour.applications.length + tour.assignments.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching tour health:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
