import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; emergencyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId, emergencyId } = await params;
    const body = await req.json();

    // Get emergency report
    const emergency = await prisma.emergencyReport.findUnique({
      where: { id: emergencyId },
      include: {
        tour: true,
      },
    });

    if (!emergency) {
      return NextResponse.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Verify operator owns the tour
    if (emergency.tour.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update emergency status
    const updated = await prisma.emergencyReport.update({
      where: { id: emergencyId },
      data: {
        status: body.status || "ACKNOWLEDGED",
        operatorResponse: body.response,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error acknowledging emergency:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}






