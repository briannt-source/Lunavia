import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guest-checkin/:token — Guest self-check-in via token link
 * POST /api/guest-checkin/:token — Submit guest check-in
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Try to find the tour associated with this guest check-in token
    const tour = await prisma.tour.findFirst({
      where: {
        OR: [
          { shareToken: token },
          { id: token },
        ],
      },
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

    return NextResponse.json({
      success: true,
      token,
      guestName: body.name || "Guest",
      checkedInAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error processing guest check-in:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
