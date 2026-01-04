import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["TOUR_OPERATOR", "TOUR_AGENCY"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only operators can view emergencies" },
        { status: 403 }
      );
    }

    // Get all tours owned by operator
    const tours = await prisma.tour.findMany({
      where: { operatorId: session.user.id },
      select: { id: true },
    });

    const tourIds = tours.map((t) => t.id);

    // Get all emergencies for operator's tours
    const emergencies = await prisma.emergencyReport.findMany({
      where: {
        tourId: { in: tourIds },
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
        guide: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(emergencies);
  } catch (error: any) {
    console.error("Error fetching operator emergencies:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}







