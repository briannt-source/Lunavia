import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromSession } from "@/lib/permission-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/platform-intelligence
 * Returns the full shape expected by PlatformIntelligencePage:
 * { data: { regionalDemand, supplyDemand, collaborationGraph, growthTimeline, priceBenchmarks, demandForecast, platformHealth } }
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromSession();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalOperators, totalGuides, totalTours,
      completedTours, cancelledTours, activeDisputes,
      regionData,
      availableGuideCount, totalGuideCount,
      activeTourCount, upcomingTourCount,
      next7d, next14d, next30d,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "TOUR_OPERATOR" } }),
      prisma.user.count({ where: { role: "TOUR_GUIDE" } }),
      prisma.tour.count(),
      prisma.tour.count({ where: { status: "COMPLETED" } }),
      prisma.tour.count({ where: { status: "CANCELLED" } }),
      prisma.dispute.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }).catch(() => 0),

      // Regional demand (group by province)
      prisma.tour.groupBy({
        by: ["province"],
        _count: { id: true },
        _sum: { priceMain: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }).catch(() => []),

      // Available guides (via profile availability)
      prisma.profile.count({ where: { availabilityStatus: "AVAILABLE", user: { role: "TOUR_GUIDE" } } }).catch(() => 0),
      prisma.user.count({ where: { role: "TOUR_GUIDE" } }),

      // Active / upcoming tours
      prisma.tour.count({ where: { status: "IN_PROGRESS" } }),
      prisma.tour.count({ where: { status: "OPEN", startDate: { gte: now } } }),

      // Demand forecast
      prisma.tour.count({ where: { startDate: { gte: now, lte: sevenDaysFromNow } } }),
      prisma.tour.count({ where: { startDate: { gte: now, lte: fourteenDaysFromNow } } }),
      prisma.tour.count({ where: { startDate: { gte: now, lte: thirtyDaysFromNow } } }),
    ]);

    const completionRate = totalTours > 0 ? Math.round((completedTours / totalTours) * 100) : 0;
    const cancellationRate = totalTours > 0 ? Math.round((cancelledTours / totalTours) * 100) : 0;

    const busyGuides = totalGuideCount - availableGuideCount;
    const activeTours = activeTourCount + upcomingTourCount;
    const supplyRatio = activeTours > 0 ? parseFloat((availableGuideCount / activeTours).toFixed(1)) : null;
    let alert = "BALANCED";
    if (supplyRatio !== null && supplyRatio < 1) alert = "UNDERSUPPLY";
    else if (supplyRatio !== null && supplyRatio > 3) alert = "OVERSUPPLY";

    // Growth timeline from last 6 months
    const growthTimeline: { month: string; operators: number; tours: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const label = d.toLocaleDateString("en-US", { year: "2-digit", month: "short" });
      const [ops, tours] = await Promise.all([
        prisma.user.count({ where: { role: "TOUR_OPERATOR", createdAt: { gte: d, lt: end } } }),
        prisma.tour.count({ where: { createdAt: { gte: d, lt: end } } }),
      ]);
      growthTimeline.push({ month: label, operators: ops, tours });
    }

    return NextResponse.json({
      data: {
        platformHealth: {
          totalOperators, totalGuides, totalTours,
          completedTours, cancelledTours, completionRate, cancellationRate,
          activeDisputes,
        },
        supplyDemand: {
          totalGuides: totalGuideCount, availableGuides: availableGuideCount,
          busyGuides, unavailableGuides: 0,
          activeTours: activeTourCount, upcomingTours: upcomingTourCount,
          supplyRatio, alert,
        },
        demandForecast: {
          next7Days: next7d, next14Days: next14d, next30Days: next30d,
          avgDaily7d: parseFloat((next7d / 7).toFixed(1)),
          avgDaily30d: parseFloat((next30d / 30).toFixed(1)),
        },
        regionalDemand: (regionData as any[]).filter((r: any) => r.province).map((r: any) => ({
          location: r.province || "Unknown",
          tourCount: r._count?.id || 0,
          totalRevenue: Number(r._sum?.priceMain || 0),
        })),
        priceBenchmarks: [],
        collaborationGraph: [],
        growthTimeline,
      },
    });
  } catch (error: any) {
    console.error("[platform-intelligence] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
