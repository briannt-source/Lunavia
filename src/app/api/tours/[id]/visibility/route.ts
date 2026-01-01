import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();
    const { visibility } = body;

    if (!visibility || !["PUBLIC", "PRIVATE"].includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility. Must be PUBLIC or PRIVATE" },
        { status: 400 }
      );
    }

    // Check if tour exists and belongs to operator
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    if (tour.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own tours" },
        { status: 403 }
      );
    }

    // Update visibility
    const updatedTour = await prisma.tour.update({
      where: { id: tourId },
      data: { visibility },
    });

    return NextResponse.json(updatedTour);
  } catch (error: any) {
    console.error("Error updating tour visibility:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}








