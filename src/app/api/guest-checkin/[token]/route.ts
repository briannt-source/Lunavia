import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guest-checkin/:token — Guest self-check-in via tour ID
 * POST /api/guest-checkin/:token — Submit guest check-in
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the tour by ID (token = tour ID)
    const tour = await prisma.tour.findUnique({
      where: { id: token },
      select: { id: true, title: true, city: true, startDate: true, status: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Invalid check-in link" }, { status: 404 });
    }

    return NextResponse.json({
      tourId: tour.id,
      title: tour.title,
      city: tour.city,
      startDate: tour.startDate,
      status: tour.status,
    });
  } catch (error: any) {
    console.error("Error fetching guest check-in:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const guestName = body.name || "Guest";

    // Find the tour by ID
    const tour = await prisma.tour.findUnique({
      where: { id: token },
      select: { id: true, title: true, status: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Invalid check-in link" }, { status: 404 });
    }

    if (tour.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Check-in is only available for tours currently in progress" },
        { status: 400 }
      );
    }

    // Save check-in as a timeline event
    const checkedInAt = new Date();
    await prisma.tourTimelineEvent.create({
      data: {
        tourId: tour.id,
        actorRole: "GUEST",
        eventType: "GUEST_CHECKIN",
        title: `Guest checked in: ${guestName}`,
        description: body.notes || null,
        metadata: JSON.stringify({
          guestName,
          checkedInAt: checkedInAt.toISOString(),
          guestCount: body.guestCount || 1,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      token,
      guestName,
      tourTitle: tour.title,
      checkedInAt: checkedInAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error processing guest check-in:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
