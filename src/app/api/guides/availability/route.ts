import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { AvailabilityService } from "@/domain/services/availability.service";

/**
 * GET /api/guides/availability
 * Get guide availability for a date range
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can view availability" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const availabilities = await prisma.guideAvailability.findMany({
      where: {
        guideId: session.user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get profile availability status
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { availabilityStatus: true },
    });

    // Fetch assigned tours (accepted applications + approved assignments)
    const [acceptedApps, approvedAssignments] = await Promise.all([
      prisma.application.findMany({
        where: {
          guideId: session.user.id,
          status: "ACCEPTED",
          tour: { status: { in: ["OPEN", "CLOSED", "IN_PROGRESS"] } },
        },
        select: {
          tour: {
            select: { id: true, title: true, startDate: true, endDate: true, status: true },
          },
        },
      }),
      prisma.assignment.findMany({
        where: {
          guideId: session.user.id,
          status: "APPROVED",
          tour: { status: { in: ["OPEN", "CLOSED", "IN_PROGRESS"] } },
        },
        select: {
          tour: {
            select: { id: true, title: true, startDate: true, endDate: true, status: true },
          },
        },
      }),
    ]);

    const assignedTours = [
      ...acceptedApps.filter((a) => a.tour.endDate !== null).map((a) => a.tour),
      ...approvedAssignments.filter((a) => a.tour.endDate !== null).map((a) => a.tour),
    ];

    return NextResponse.json({
      availabilities,
      currentStatus: profile?.availabilityStatus || "AVAILABLE",
      assignedTours,
    });
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/guides/availability
 * Update guide availability
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can update availability" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, date, slots } = body;

    // Update profile availability status
    if (status && ["AVAILABLE", "BUSY", "ON_TOUR"].includes(status)) {
      await AvailabilityService.updateAvailabilityStatus(
        session.user.id,
        status as "AVAILABLE" | "BUSY" | "ON_TOUR"
      );
    }

    // Update specific date availability
    if (date && slots) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      await prisma.guideAvailability.upsert({
        where: {
          guideId_date: {
            guideId: session.user.id,
            date: dateObj,
          },
        },
        update: {
          slots: slots,
        },
        create: {
          guideId: session.user.id,
          date: dateObj,
          slots: slots,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update availability" },
      { status: 500 }
    );
  }
}

