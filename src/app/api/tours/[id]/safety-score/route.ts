/**
 * GET /api/tours/[id]/safety-score
 * Calculate and return safety score for a tour.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { TourSafetyScoreService } from "@/domain/services/tour-safety-score.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const score = await TourSafetyScoreService.calculateForTour(tourId);

    return NextResponse.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    console.error("Error calculating safety score:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
