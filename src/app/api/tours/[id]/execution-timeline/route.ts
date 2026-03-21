import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/execution-timeline
 * Returns execution timeline (same as timeline, optimized for live view).
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
        id: true, status: true, startDate: true, endDate: true,
        safetyCheckIns: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { guide: { select: { id: true, name: true } } },
        },
        emergencies: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    return NextResponse.json({
      tourId,
      status: tour.status,
      checkIns: tour.safetyCheckIns,
      emergencies: tour.emergencies,
      startDate: tour.startDate,
      endDate: tour.endDate,
    });
  } catch (error: any) {
    console.error("Error fetching execution timeline:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
