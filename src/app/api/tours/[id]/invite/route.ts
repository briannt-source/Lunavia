import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tours/:id/invite — Invite a guide to apply for a tour
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
    const guideId = body.guideId;

    if (!guideId) {
      return NextResponse.json({ error: "guideId is required" }, { status: 400 });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, title: true, operatorId: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    if (tour.operatorId !== session.user.id) {
      return NextResponse.json({ error: "Only the operator can invite guides" }, { status: 403 });
    }

    // Create notification for the guide
    await prisma.notification.create({
      data: {
        userId: guideId,
        title: "Tour Invitation",
        message: `You've been invited to apply for tour: ${tour.title}`,
        type: "TOUR_INVITE",
        link: `/dashboard/guide/tours/${tourId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      tourId,
      guideId,
    });
  } catch (error: any) {
    console.error("Error inviting guide to tour:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
