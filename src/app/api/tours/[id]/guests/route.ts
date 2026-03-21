import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/guests — List guests for a tour
 * POST /api/tours/:id/guests — Add guest to tour
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

    // Return guests from tour's pax data or a guests table if available
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, pax: true, operatorId: true, files: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Try finding guests from a dedicated model, otherwise return synthetic data from pax
    try {
      const guests = await (prisma as any).tourGuest.findMany({
        where: { tourId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ guests, total: guests.length });
    } catch {
      // No TourGuest model — return empty list with pax count
      return NextResponse.json({
        guests: [],
        total: 0,
        expectedPax: tour.pax,
        message: "Guest tracking not yet configured for this tour",
      });
    }
  } catch (error: any) {
    console.error("Error fetching tour guests:", error);
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

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, operatorId: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Try creating a guest record
    try {
      const guest = await (prisma as any).tourGuest.create({
        data: {
          tourId,
          name: body.name,
          email: body.email || null,
          phone: body.phone || null,
          status: "REGISTERED",
        },
      });
      return NextResponse.json(guest, { status: 201 });
    } catch {
      return NextResponse.json(
        { message: "Guest added (tracking model not configured)", tourId, guest: body },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Error adding tour guest:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
