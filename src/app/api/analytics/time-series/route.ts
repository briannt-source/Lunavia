import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/analytics/time-series
 * 
 * Returns monthly aggregated data for the last 12 months.
 * Query params:
 *   - scope: "operator" | "guide" | "platform" (default: auto-detect from role)
 *   - months: number (default: 12)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const user = session.user as any;
        const role = user?.role;

        const { searchParams } = new URL(req.url);
        const monthsParam = parseInt(searchParams.get("months") || "12");
        const months = Math.min(Math.max(monthsParam, 3), 24);
        const scope = searchParams.get("scope") || (
            role === "TOUR_OPERATOR" ? "operator" :
            role === "TOUR_GUIDE" ? "guide" : "platform"
        );

        // Build date range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        // ── Build where clause based on scope ────────────────────
        const tourWhere: any = {
            createdAt: { gte: startDate },
        };

        if (scope === "operator") {
            tourWhere.operatorId = userId;
        }
        // Guide scope will filter via applications

        // ── Fetch tours ──────────────────────────────────────────
        const tours = await prisma.tour.findMany({
            where: scope === "guide" ? {
                applications: { some: { guideId: userId, status: "ACCEPTED" } },
                createdAt: { gte: startDate },
            } : tourWhere,
            select: {
                id: true,
                status: true,
                createdAt: true,
                startDate: true,
                city: true,
                marketType: true,
                country: true,
                payments: {
                    where: { status: "COMPLETED" },
                    select: { amount: true, createdAt: true },
                },
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // ── Aggregate by month ───────────────────────────────────
        const monthlyData: Record<string, {
            month: string;
            tours: number;
            completed: number;
            cancelled: number;
            revenue: number;
            applications: number;
        }> = {};

        // Pre-fill all months
        for (let i = 0; i < months; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthlyData[key] = {
                month: key,
                tours: 0,
                completed: 0,
                cancelled: 0,
                revenue: 0,
                applications: 0,
            };
        }

        // Fill with real data
        for (const tour of tours) {
            const d = new Date(tour.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (!monthlyData[key]) continue;

            monthlyData[key].tours++;
            if (tour.status === "COMPLETED") monthlyData[key].completed++;
            if (tour.status === "CANCELLED") monthlyData[key].cancelled++;
            monthlyData[key].applications += tour._count.applications;
            monthlyData[key].revenue += tour.payments.reduce((sum, p) => sum + p.amount, 0);
        }

        const timeline = Object.values(monthlyData);

        // ── Market breakdown ─────────────────────────────────────
        const marketBreakdown = tours.reduce((acc, tour) => {
            const mt = (tour as any).marketType || "INBOUND";
            acc[mt] = (acc[mt] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // ── City breakdown (top 10) ──────────────────────────────
        const cityCount = tours.reduce((acc, tour) => {
            const city = tour.city || "Unknown";
            acc[city] = (acc[city] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topCities = Object.entries(cityCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }));

        // ── Summary stats ────────────────────────────────────────
        const totalTours = tours.length;
        const completedTours = tours.filter(t => t.status === "COMPLETED").length;
        const cancelledTours = tours.filter(t => t.status === "CANCELLED").length;
        const totalRevenue = tours.reduce((s, t) => s + t.payments.reduce((ps, p) => ps + p.amount, 0), 0);
        const totalApplications = tours.reduce((s, t) => s + t._count.applications, 0);

        // ── Trends (compare last month vs previous) ──────────────
        const lastMonth = timeline[timeline.length - 1];
        const prevMonth = timeline.length >= 2 ? timeline[timeline.length - 2] : null;

        const trends = {
            tours: prevMonth && prevMonth.tours > 0
                ? Math.round(((lastMonth.tours - prevMonth.tours) / prevMonth.tours) * 100)
                : 0,
            revenue: prevMonth && prevMonth.revenue > 0
                ? Math.round(((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
                : 0,
            applications: prevMonth && prevMonth.applications > 0
                ? Math.round(((lastMonth.applications - prevMonth.applications) / prevMonth.applications) * 100)
                : 0,
        };

        return NextResponse.json({
            scope,
            period: { start: startDate.toISOString(), end: now.toISOString(), months },
            summary: {
                totalTours,
                completedTours,
                cancelledTours,
                completionRate: totalTours > 0 ? Math.round((completedTours / totalTours) * 100) : 0,
                totalRevenue,
                totalApplications,
                avgRevenuePerTour: totalTours > 0 ? Math.round(totalRevenue / totalTours) : 0,
            },
            trends,
            timeline,
            marketBreakdown,
            topCities,
        });
    } catch (error: any) {
        console.error("Error fetching time-series analytics:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
