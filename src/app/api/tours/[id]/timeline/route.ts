import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/timeline
 * Returns the timeline of events for a tour.
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
      select: {
        id: true, status: true, startDate: true, endDate: true, createdAt: true,
        safetyCheckIns: { orderBy: { createdAt: "asc" } },
        emergencies: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Build timeline from available events
    const events: any[] = [];

    events.push({ type: "CREATED", timestamp: tour.createdAt, description: "Tour created" });
    events.push({ type: "SCHEDULED", timestamp: tour.startDate, description: "Tour start" });

    tour.safetyCheckIns.forEach((c) => {
      events.push({
        type: "SAFETY_CHECKIN",
        timestamp: c.createdAt,
        description: `Safety check-in: ${c.status}`,
        data: c,
      });
    });

    tour.emergencies.forEach((e) => {
      events.push({
        type: "EMERGENCY",
        timestamp: e.createdAt,
        description: `Emergency reported: ${e.type}`,
        data: e,
      });
    });

    if (tour.endDate) {
      events.push({ type: "END", timestamp: tour.endDate, description: "Tour end" });
    }

    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ tourId, events });
  } catch (error: any) {
    console.error("Error fetching tour timeline:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
