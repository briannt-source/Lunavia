import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guide/execution/:tourId
 * Returns tour execution data from the guide's perspective.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tourId } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: { include: { profile: true } },
        applications: {
          where: { guideId: session.user.id, status: "ACCEPTED" },
        },
        assignments: {
          where: { guideId: session.user.id, status: "APPROVED" },
        },
        safetyCheckIns: {
          where: { guideId: session.user.id },
          orderBy: { createdAt: "desc" },
        },
        emergencies: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Verify guide is assigned to this tour
    const isAssigned = tour.applications.length > 0 || tour.assignments.length > 0;
    if (!isAssigned) {
      return NextResponse.json({ error: "You are not assigned to this tour" }, { status: 403 });
    }

    return NextResponse.json({
      id: tour.id,
      title: tour.title,
      status: tour.status,
      startDate: tour.startDate,
      endDate: tour.endDate,
      city: tour.city,
      pax: tour.pax,
      operator: {
        id: tour.operator.id,
        name: tour.operator.profile?.fullName || tour.operator.name,
        phone: tour.operator.profile?.phone || null,
      },
      myRole: tour.applications[0]?.role || tour.assignments[0]?.role || "MAIN",
      safetyCheckIns: tour.safetyCheckIns,
      emergencies: tour.emergencies,
      itinerary: tour.itinerary,
      guideNotes: tour.guideNotes,
      inclusions: tour.inclusions,
      exclusions: tour.exclusions,
    });
  } catch (error: any) {
    console.error("Error fetching guide execution:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
