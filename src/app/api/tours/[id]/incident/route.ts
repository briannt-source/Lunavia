import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tours/:id/incident — Report an incident during a tour
 */
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
      select: { id: true, operatorId: true, title: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const emergency = await prisma.emergency.create({
      data: {
        tourId,
        type: body.type || "INCIDENT",
        description: body.description || "Incident reported",
        status: "ACTIVE",
        reportedBy: session.user.id,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
      },
    });

    // Notify operator
    const { NotificationService } = await import("@/domain/services/notification.service");
    await NotificationService.create({
      userId: tour.operatorId,
      title: "⚠️ Incident Report",
      message: `Incident reported on tour: ${tour.title}`,
      type: "INCIDENT",
      link: `/dashboard/operator/tours/${tourId}/live`,
    });

    return NextResponse.json(emergency, { status: 201 });
  } catch (error: any) {
    console.error("Error reporting incident:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
