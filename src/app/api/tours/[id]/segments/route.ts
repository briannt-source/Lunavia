import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/segments — List segments for a tour
 * POST /api/tours/:id/segments — Create a segment
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

    // Try reading segments from the tour's itinerary or a dedicated model
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, itinerary: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Parse itinerary as segments if stored as JSON array
    let segments: any[] = [];
    if (tour.itinerary) {
      try {
        const parsed = typeof tour.itinerary === "string" ? JSON.parse(tour.itinerary) : tour.itinerary;
        if (Array.isArray(parsed)) {
          segments = parsed.map((s: any, idx: number) => ({
            id: s.id || `seg-${idx}`,
            title: s.title || s.name || `Segment ${idx + 1}`,
            description: s.description || "",
            startTime: s.startTime || null,
            endTime: s.endTime || null,
            location: s.location || "",
            order: idx,
            status: s.status || "PENDING",
          }));
        }
      } catch { /* itinerary not parseable as segments */ }
    }

    return NextResponse.json({ tourId, segments });
  } catch (error: any) {
    console.error("Error fetching segments:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();

    // Append segment to itinerary JSON
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, itinerary: true, operatorId: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    if (tour.operatorId !== session.user.id) {
      return NextResponse.json({ error: "Only the operator can add segments" }, { status: 403 });
    }

    const existing = tour.itinerary ? (typeof tour.itinerary === "string" ? JSON.parse(tour.itinerary) : tour.itinerary) : [];
    const segments = Array.isArray(existing) ? existing : [];

    const newSegment = {
      id: `seg-${Date.now()}`,
      title: body.title || "New Segment",
      description: body.description || "",
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      location: body.location || "",
      status: "PENDING",
    };

    segments.push(newSegment);

    await prisma.tour.update({
      where: { id: tourId },
      data: { itinerary: JSON.stringify(segments) },
    });

    return NextResponse.json(newSegment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating segment:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
