import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guides/[id]/calendar
 * Get a guide's availability and tour schedule
 * Used by operators on the team page to view guide schedules
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

    const { id: guideId } = await params;
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get availability blocks
    const availability = await prisma.guideAvailability.findMany({
      where: {
        guideId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Get accepted tour applications in the date range
    const tourApplications = await prisma.application.findMany({
      where: {
        guideId,
        status: "ACCEPTED",
        tour: {
          startDate: { lte: endDate },
          OR: [
            { endDate: { gte: startDate } },
            { endDate: null },
          ],
        },
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Get assignments in the date range
    const assignments = await prisma.assignment.findMany({
      where: {
        guideId,
        status: "APPROVED",
        tour: {
          startDate: { lte: endDate },
          OR: [
            { endDate: { gte: startDate } },
            { endDate: null },
          ],
        },
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Merge into calendar events
    const events: any[] = [];

    // Availability blocks → BLOCK events
    for (const block of availability) {
      const slots = block.slots as any[];
      if (!slots || slots.length === 0) {
        events.push({
          id: block.id,
          type: "BLOCK",
          title: "Unavailable",
          start: block.date,
          end: block.date,
        });
      }
    }

    // Tours → TOUR events
    for (const app of tourApplications) {
      events.push({
        id: app.id,
        type: "TOUR",
        title: app.tour.title,
        start: app.tour.startDate,
        end: app.tour.endDate || app.tour.startDate,
        tourId: app.tour.id,
        status: app.tour.status,
      });
    }

    for (const assign of assignments) {
      events.push({
        id: assign.id,
        type: "TOUR",
        title: assign.tour.title,
        start: assign.tour.startDate,
        end: assign.tour.endDate || assign.tour.startDate,
        tourId: assign.tour.id,
        status: assign.tour.status,
      });
    }

    // Sort by start date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Error fetching guide calendar:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
