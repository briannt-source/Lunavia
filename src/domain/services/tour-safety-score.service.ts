// ══════════════════════════════════════════════════════════════════════
// Tour Safety Score Service
//
// Computes a 0-100 safety score for a tour based on:
//   30% check-in completion rate
//   25% incident-free rate 
//   20% guide trust score
//   15% operator response time
//   10% review safety rating
//
// Tours scoring > 85 → "Verified Safe" certificate
// ══════════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";

export interface TourSafetyScore {
  tourId: string;
  overallScore: number;
  components: {
    checkInScore: number;      // 0-30
    incidentScore: number;     // 0-25
    guideTrustScore: number;   // 0-20
    responseTimeScore: number; // 0-15
    reviewScore: number;       // 0-10
  };
  isVerifiedSafe: boolean;
  certificate: "VERIFIED_SAFE" | "STANDARD" | "NEEDS_IMPROVEMENT" | "NOT_RATED";
}

export class TourSafetyScoreService {
  private static readonly VERIFIED_SAFE_THRESHOLD = 85;
  private static readonly NEEDS_IMPROVEMENT_THRESHOLD = 50;

  /**
   * Calculate safety score for a single tour.
   */
  static async calculateForTour(tourId: string): Promise<TourSafetyScore> {
    const [checkInScore, incidentScore, guideTrustScore, responseTimeScore, reviewScore] =
      await Promise.all([
        this.getCheckInScore(tourId),
        this.getIncidentScore(tourId),
        this.getGuideTrustScore(tourId),
        this.getResponseTimeScore(tourId),
        this.getReviewScore(tourId),
      ]);

    const overallScore = Math.round(
      checkInScore + incidentScore + guideTrustScore + responseTimeScore + reviewScore
    );

    let certificate: TourSafetyScore["certificate"];
    if (overallScore >= this.VERIFIED_SAFE_THRESHOLD) {
      certificate = "VERIFIED_SAFE";
    } else if (overallScore >= this.NEEDS_IMPROVEMENT_THRESHOLD) {
      certificate = "STANDARD";
    } else if (overallScore > 0) {
      certificate = "NEEDS_IMPROVEMENT";
    } else {
      certificate = "NOT_RATED";
    }

    return {
      tourId,
      overallScore,
      components: {
        checkInScore,
        incidentScore,
        guideTrustScore,
        responseTimeScore,
        reviewScore,
      },
      isVerifiedSafe: certificate === "VERIFIED_SAFE",
      certificate,
    };
  }

  /**
   * Calculate average safety score for an operator.
   */
  static async calculateOperatorAverage(
    operatorId: string
  ): Promise<{
    averageScore: number;
    totalTours: number;
    verifiedSafeCount: number;
    scores: TourSafetyScore[];
  }> {
    const completedTours = await prisma.tour.findMany({
      where: {
        operatorId,
        status: { in: ["COMPLETED", "CLOSED"] },
      },
      select: { id: true },
      take: 50, // Limit for performance
      orderBy: { updatedAt: "desc" },
    });

    const scores: TourSafetyScore[] = [];
    for (const tour of completedTours) {
      try {
        const score = await this.calculateForTour(tour.id);
        scores.push(score);
      } catch {
        // Skip tours with calculation errors
      }
    }

    const totalScores = scores.length;
    const averageScore =
      totalScores > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / totalScores)
        : 0;
    const verifiedSafeCount = scores.filter((s) => s.isVerifiedSafe).length;

    return {
      averageScore,
      totalTours: totalScores,
      verifiedSafeCount,
      scores,
    };
  }

  // ── Component Calculators ──────────────────────────────────────

  /**
   * Check-in completion rate → 0-30 points
   */
  private static async getCheckInScore(tourId: string): Promise<number> {
    const checkIns = await prisma.safetyCheckIn.findMany({
      where: { tourId },
      select: { checkedInAt: true, missed: true },
    });

    if (checkIns.length === 0) return 15; // Neutral if no check-ins scheduled

    const completed = checkIns.filter((c) => c.checkedInAt !== null).length;
    const completionRate = completed / checkIns.length;
    return Math.round(completionRate * 30);
  }

  /**
   * Incident-free rate → 0-25 points
   * Higher score = fewer incidents
   */
  private static async getIncidentScore(tourId: string): Promise<number> {
    const incidentCount = await prisma.tourIncident.count({
      where: { tourId },
    });

    if (incidentCount === 0) return 25; // Perfect — no incidents
    if (incidentCount === 1) return 15;
    if (incidentCount === 2) return 8;
    return 0; // 3+ incidents
  }

  /**
   * Guide trust score → 0-20 points
   */
  private static async getGuideTrustScore(tourId: string): Promise<number> {
    // Get guides assigned to this tour
    const assignments = await prisma.application.findMany({
      where: { tourId, status: "ACCEPTED" },
      select: {
        guide: { select: { trustScore: true } },
      },
    });

    if (assignments.length === 0) return 10; // Neutral

    const avgTrust =
      assignments.reduce((sum, a) => sum + (a.guide.trustScore || 50), 0) / assignments.length;
    return Math.round((avgTrust / 100) * 20);
  }

  /**
   * Operator response time → 0-15 points
   * Based on how quickly operator responds to incidents
   */
  private static async getResponseTimeScore(tourId: string): Promise<number> {
    const incidents = await prisma.tourIncident.findMany({
      where: { tourId, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    if (incidents.length === 0) return 15; // No incidents = full score

    const avgResponseHours =
      incidents.reduce((sum: number, inc: { createdAt: Date; resolvedAt: Date | null }) => {
        const responseHours =
          (new Date(inc.resolvedAt!).getTime() - new Date(inc.createdAt).getTime()) /
          (1000 * 60 * 60);
        return sum + responseHours;
      }, 0) / incidents.length;

    // < 1h = 15pts, < 4h = 12pts, < 12h = 8pts, < 24h = 5pts, > 24h = 0pts
    if (avgResponseHours < 1) return 15;
    if (avgResponseHours < 4) return 12;
    if (avgResponseHours < 12) return 8;
    if (avgResponseHours < 24) return 5;
    return 0;
  }

  /**
   * Review safety rating → 0-10 points
   */
  private static async getReviewScore(tourId: string): Promise<number> {
    const reviews = await prisma.review.findMany({
      where: { tourId },
      select: { overallRating: true },
    });

    if (reviews.length === 0) return 5; // Neutral

    const avgRating =
      reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

    // Map 1-5 star rating to 0-10 points
    return Math.round(((avgRating - 1) / 4) * 10);
  }
}
