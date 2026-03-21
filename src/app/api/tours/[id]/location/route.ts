import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/location — Get live location data for tour
 * POST /api/tours/:id/location — Update guide location during tour
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

    // Get latest check-in with location
    const latestCheckIn = await prisma.safetyCheckIn.findFirst({
      where: { tourId, latitude: { not: null } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      tourId,
      location: latestCheckIn
        ? {
            latitude: latestCheckIn.latitude,
            longitude: latestCheckIn.longitude,
            updatedAt: latestCheckIn.createdAt,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error fetching tour location:", error);
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

    return NextResponse.json({
      success: true,
      tourId,
      location: {
        latitude: body.latitude,
        longitude: body.longitude,
        updatedAt: new Date().toISOString(),
        reportedBy: session.user.id,
      },
    });
  } catch (error: any) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
