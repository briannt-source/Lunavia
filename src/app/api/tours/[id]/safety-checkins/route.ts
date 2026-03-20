import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { SafetyCheckInService } from "@/domain/services/safety-checkin.service";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/[id]/safety-checkins
 * Get scheduled check-ins for a tour
 */
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

    const checkIns = await prisma.safetyCheckIn.findMany({
      where: { tourId },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({ checkIns });
  } catch (error: any) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tours/[id]/safety-checkins
 * Schedule check-ins for a tour OR perform a check-in
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "schedule") {
      // Schedule check-ins for the tour (operator action)
      const checkIns = await SafetyCheckInService.scheduleCheckInsForTour(
        tourId,
        body.guideId || session.user.id
      );
      return NextResponse.json({ checkIns }, { status: 201 });
    }

    if (action === "checkin") {
      // Guide performing a check-in
      const { checkInId, status, location, latitude, longitude, notes } = body;
      if (!checkInId) {
        return NextResponse.json(
          { error: "checkInId is required for check-in" },
          { status: 400 }
        );
      }

      const result = await SafetyCheckInService.performCheckIn({
        checkInId,
        guideId: session.user.id,
        status: status || "SAFE",
        location,
        latitude,
        longitude,
        notes,
      });
      return NextResponse.json({ checkIn: result });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'schedule' or 'checkin'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error with safety check-in:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
