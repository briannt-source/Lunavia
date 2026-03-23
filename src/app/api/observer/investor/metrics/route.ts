import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/observer/investor/metrics
 * Returns the full shape expected by InvestorDashboardPage:
 * { success: true, data: { userGrowth, tourVolume, revenue, provinceCoverage, retention } }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      totalSignups, signupsThisMonth,
      verifiedOperators, verifiedGuides,
      operatorsWithTour,
      totalTours, toursThisMonth, toursThisWeek,
      completedTours, cancelledTours,
      totalGMV, gmvThisMonth,
      provinceCoverage,
      totalOperators,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),

      // Verified operators/guides (verifiedStatus === APPROVED)
      prisma.user.count({ where: { role: "TOUR_OPERATOR", verifiedStatus: "APPROVED" } }),
      prisma.user.count({ where: { role: "TOUR_GUIDE", verifiedStatus: "APPROVED" } }),

      // Operators who have created at least 1 tour
      prisma.user.count({ where: { role: "TOUR_OPERATOR", tours: { some: {} } } }),

      // Tour volume
      prisma.tour.count(),
      prisma.tour.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.tour.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.tour.count({ where: { status: "COMPLETED" } }),
      prisma.tour.count({ where: { status: "CANCELLED" } }),

      // Revenue GMV (sum of priceMain for completed tours)
      prisma.tour.aggregate({ where: { status: "COMPLETED" }, _sum: { priceMain: true } }),
      prisma.tour.aggregate({ where: { status: "COMPLETED", endDate: { gte: startOfMonth } }, _sum: { priceMain: true } }),

      // Province coverage
      prisma.tour.groupBy({
        by: ["province"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }).catch(() => []),

      // Retention
      prisma.user.count({ where: { role: "TOUR_OPERATOR" } }),
    ]);

    // Active 30d — users who updated recently (proxy for "active")
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [activeOps30d, activeGuides30d, activeOps90d] = await Promise.all([
      prisma.user.count({ where: { role: "TOUR_OPERATOR", updatedAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: "TOUR_GUIDE", updatedAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: "TOUR_OPERATOR", updatedAt: { gte: ninetyDaysAgo } } }),
    ]);

    const completionRate = totalTours > 0 ? Math.round((completedTours / totalTours) * 100) : 0;
    const totalDays = Math.max(1, Math.ceil((now.getTime() - new Date("2024-01-01").getTime()) / (1000 * 60 * 60 * 24)));
    const toursPerDay = totalTours > 0 ? (totalTours / totalDays).toFixed(1) : "0";
    const totalGMVNum = Number(totalGMV._sum?.priceMain || 0);
    const avgRevenuePerTour = completedTours > 0 ? Math.round(totalGMVNum / completedTours) : 0;
    const retentionRate90d = totalOperators > 0 ? Math.round((activeOps90d / totalOperators) * 100) : 0;

    // Subscription revenue from wallet transactions
    let subRevenue = 0, subRevenueMonth = 0;
    try {
      const subAll = await prisma.walletTransaction.aggregate({ where: { type: "CREDIT" }, _sum: { amount: true } });
      subRevenue = Number(subAll._sum?.amount || 0);
      const subMonth = await prisma.walletTransaction.aggregate({ where: { type: "CREDIT", createdAt: { gte: startOfMonth } }, _sum: { amount: true } });
      subRevenueMonth = Number(subMonth._sum?.amount || 0);
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        userGrowth: {
          totalSignups,
          signupsThisMonth,
          verified: { operators: verifiedOperators, guides: verifiedGuides },
          firstTour: { operators: operatorsWithTour, guides: 0 },
          active30d: { operators: activeOps30d, guides: activeGuides30d },
        },
        tourVolume: {
          total: totalTours,
          thisMonth: toursThisMonth,
          thisWeek: toursThisWeek,
          completed: completedTours,
          cancelled: cancelledTours,
          completionRate,
          toursPerDay,
        },
        revenue: {
          totalGMV: totalGMVNum,
          gmvThisMonth: Number(gmvThisMonth._sum?.priceMain || 0),
          subscriptionRevenue: subRevenue,
          subscriptionRevenueMonth: subRevenueMonth,
          avgRevenuePerTour,
        },
        provinceCoverage: (provinceCoverage as any[]).filter((p: any) => p.province).map((p: any) => ({
          province: p.province,
          count: p._count?.id || 0,
        })),
        retention: {
          totalActiveOperators: totalOperators,
          active90d: activeOps90d,
          retentionRate90d,
        },
      },
    });
  } catch (error: any) {
    console.error("[investor/metrics] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
