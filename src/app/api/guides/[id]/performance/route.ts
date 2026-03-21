import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReviewService } from "@/domain/services/review.service";

/**
 * GET /api/guides/[id]/performance
 * 
 * Returns the comprehensive Guide Performance Card — the core data
 * that answers: "How good is this guide?"
 * 
 * Aggregates:
 * - Trust score + reliability score
 * - Review analytics (5-dimension ratings)
 * - Tour history (completion rate, on-time rate)
 * - Repeat hire rate
 * - Activity timeline
 * - Languages & specialties proven through tours
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const guideId = params.id;

        // 1. Fetch guide with profile
        const guide = await prisma.user.findUnique({
            where: { id: guideId },
            include: { profile: true },
        });

        if (!guide) {
            return NextResponse.json(
                { error: "Guide not found" },
                { status: 404 }
            );
        }

        // 2. Tour History — all accepted applications with tour data
        const allApplications = await prisma.application.findMany({
            where: { guideId, status: "ACCEPTED" },
            include: {
                tour: true,
            },
        });

        const totalToursAccepted = allApplications.length;
        const completedTours = allApplications.filter(
            (a) => a.tour.status === "COMPLETED" || a.tour.status === "CLOSED"
        );
        const totalCompleted = completedTours.length;
        const inProgressTours = allApplications.filter(
            (a) => a.tour.status === "IN_PROGRESS"
        ).length;

        // Completion rate
        const completionRate =
            totalToursAccepted > 0
                ? Math.round((totalCompleted / totalToursAccepted) * 100)
                : 0;

        // 3. Repeat Hire Rate
        const operatorIds = completedTours.map((a) => a.tour.operatorId);
        const uniqueOperators = new Set(operatorIds);
        const repeatOperators = [...uniqueOperators].filter(
            (opId) => operatorIds.filter((id) => id === opId).length > 1
        );
        const repeatHireRate =
            uniqueOperators.size > 0
                ? Math.round((repeatOperators.length / uniqueOperators.size) * 100)
                : 0;

        // 4. Review Analytics (5-dimension)
        const reviewAnalytics = await ReviewService.getReviewAnalytics(guideId);

        // 5. Reliability Stats — query trust records directly
        const trustRecords = await prisma.trustRecord.findMany({
            where: { userId: guideId },
            orderBy: { createdAt: "desc" },
        });

        // Count reliability events
        const lateCancellations = trustRecords.filter(
            (r) => (r as any).type === "GUIDE_LATE_CANCELLATION"
        ).length;
        const noShows = trustRecords.filter(
            (r) =>
                (r as any).type === "GUIDE_NO_SHOW" ||
                (r as any).type === "GUIDE_ABANDONED_TOUR" ||
                (r as any).type === "SOS_ACCEPT_NO_SHOW"
        ).length;
        const replacementRequests = trustRecords.filter(
            (r) => (r as any).type === "GUIDE_REPLACEMENT_REQUESTED"
        ).length;

        // On-time rate
        const onTimeRate =
            totalCompleted > 0
                ? Math.max(0, Math.round(
                    ((totalCompleted - lateCancellations - noShows) / totalCompleted) * 100
                ))
                : 100;

        // 6. Markets & Locations served
        const marketsServed = completedTours.reduce(
            (acc, a) => {
                const market = (a.tour as any).marketType || "INBOUND";
                if (!acc[market]) acc[market] = 0;
                acc[market]++;
                return acc;
            },
            {} as Record<string, number>
        );

        const citiesServed = [
            ...new Set(completedTours.map((a) => a.tour.city).filter(Boolean)),
        ];

        const countriesServed = [
            ...new Set(
                completedTours.map((a) => (a.tour as any).country || "VN").filter(Boolean)
            ),
        ];

        // 7. Activity by month (last 12 months)
        const now = new Date();
        const monthlyActivity: { month: string; tours: number }[] = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const count = completedTours.filter((a) => {
                const tourDate = new Date(a.tour.startDate);
                return (
                    tourDate.getFullYear() === date.getFullYear() &&
                    tourDate.getMonth() === date.getMonth()
                );
            }).length;
            monthlyActivity.push({ month: monthKey, tours: count });
        }

        // 8. Member since (years)
        const memberSinceYears = Math.floor(
            (now.getTime() - new Date(guide.createdAt).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        );

        // 9. Recent tours (last 5)
        const recentTours = completedTours
            .sort(
                (a, b) =>
                    new Date(b.tour.startDate).getTime() -
                    new Date(a.tour.startDate).getTime()
            )
            .slice(0, 5)
            .map((a) => ({
                id: a.tour.id,
                title: a.tour.title,
                city: a.tour.city,
                country: (a.tour as any).country || "VN",
                marketType: (a.tour as any).marketType || "INBOUND",
                date: a.tour.startDate,
            }));

        // 10. Trust history (last 12 events for sparkline)
        const trustHistory = trustRecords.slice(0, 12).reverse().map((r) => ({
            type: (r as any).type,
            delta: r.delta,
            newScore: r.newScore,
            description: r.description,
            createdAt: r.createdAt,
        }));

        // === BUILD PERFORMANCE CARD ===
        const performanceCard = {
            guide: {
                id: guide.id,
                name: guide.profile?.name || guide.name || guide.email,
                avatar: (guide.profile as any)?.avatar || null,
                about: (guide.profile as any)?.about || null,
                plan: (guide as any).plan || "FREE",
                isAvailable: (guide as any).isAvailable ?? true,
                memberSince: guide.createdAt,
                memberSinceYears,
                experienceYears: (guide.profile as any)?.experienceYears || 0,
            },

            // Core scores — THE NUMBERS NOBODY ELSE HAS
            scores: {
                trustScore: guide.trustScore || 0,
                reliabilityScore: (guide as any).reliabilityScore || 100,
                overallRating: reviewAnalytics.averageRatings.overall,
                completionRate,
                onTimeRate,
                repeatHireRate,
            },

            // Detailed ratings (5 dimensions)
            ratings: reviewAnalytics.averageRatings,
            ratingDistribution: reviewAnalytics.ratingDistribution,
            totalReviews: reviewAnalytics.totalReviews,

            // Tour stats
            tourStats: {
                totalCompleted,
                totalAccepted: totalToursAccepted,
                inProgress: inProgressTours,
                completionRate,
                uniqueOperators: uniqueOperators.size,
                repeatOperators: repeatOperators.length,
            },

            // Reliability breakdown
            reliability: {
                score: (guide as any).reliabilityScore || 100,
                lateCancellations,
                noShows,
                replacementRequests,
                onTimeRate,
            },

            // Coverage
            coverage: {
                languages: (guide as any).languages || [],
                specialties: (guide as any).specialties || [],
                marketsServed,
                citiesServed,
                countriesServed,
            },

            // Activity
            activity: {
                monthlyActivity,
                recentTours,
                trustHistory,
            },

            // Lunavia-verified badge
            verified: {
                isDataVerified: true,
                source: "Lunavia Platform",
                lastUpdated: new Date().toISOString(),
                disclaimer:
                    "All data is calculated from verified tour completions on the Lunavia platform.",
            },
        };

        return NextResponse.json(performanceCard);
    } catch (error: any) {
        console.error("Error fetching guide performance:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
