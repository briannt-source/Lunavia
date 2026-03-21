import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guide/sos-broadcasts — List SOS broadcasts available to the guide
 * POST /api/guide/sos-broadcasts — Create a new SOS broadcast
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active SOS broadcasts for tours in the guide's area
    const broadcasts = await prisma.emergencyReport.findMany({
      where: {
        status: { in: ["PENDING", "ACKNOWLEDGED", "IN_PROGRESS"] },
        tour: {
          OR: [
            { applications: { some: { guideId: session.user.id, status: "ACCEPTED" } } },
            { assignments: { some: { guideId: session.user.id, status: "APPROVED" } } },
          ],
        },
      },
      include: {
        tour: {
          select: { id: true, title: true, city: true, startDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(broadcasts);
  } catch (error: any) {
    console.error("Error fetching SOS broadcasts:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tourId, type, description, latitude, longitude } = body;

    if (!tourId) {
      return NextResponse.json({ error: "tourId is required" }, { status: 400 });
    }

    const emergency = await prisma.emergencyReport.create({
      data: {
        tourId,
        type: type || "SOS",
        description: description || "SOS broadcast initiated by guide",
        severity: "CRITICAL",
        status: "PENDING",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        guideId: session.user.id,
      },
    });

    // Notify operator
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { operatorId: true, title: true },
    });

    if (tour) {
      await prisma.notification.create({
        data: {
          userId: tour.operatorId,
          title: "🚨 SOS Alert",
          message: `SOS triggered for tour: ${tour.title}`,
          type: "SOS",
          link: `/dashboard/operator/tours/${tourId}/live`,
        },
      });
    }

    return NextResponse.json(emergency, { status: 201 });
  } catch (error: any) {
    console.error("Error creating SOS broadcast:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
