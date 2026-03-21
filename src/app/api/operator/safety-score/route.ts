/**
 * GET /api/operator/safety-score
 * Calculate operator's average safety score across completed tours.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { TourSafetyScoreService } from "@/domain/services/tour-safety-score.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const operatorId = session.user.id;
    const result = await TourSafetyScoreService.calculateOperatorAverage(operatorId);

    return NextResponse.json({
      success: true,
      data: {
        averageScore: result.averageScore,
        totalTours: result.totalTours,
        verifiedSafeCount: result.verifiedSafeCount,
        certificate:
          result.averageScore >= 85
            ? "VERIFIED_SAFE_OPERATOR"
            : result.averageScore >= 50
            ? "STANDARD"
            : "NEEDS_IMPROVEMENT",
      },
    });
  } catch (error: any) {
    console.error("Error calculating operator safety score:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
