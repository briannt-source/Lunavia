import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/checkins/:id — Edit a safety check-in
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: checkInId } = await params;
    const body = await req.json();

    const checkIn = await prisma.safetyCheckIn.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }

    if (checkIn.guideId !== session.user.id) {
      return NextResponse.json({ error: "Can only edit your own check-ins" }, { status: 403 });
    }

    const updated = await prisma.safetyCheckIn.update({
      where: { id: checkInId },
      data: {
        notes: body.notes !== undefined ? body.notes : checkIn.notes,
        status: body.status || checkIn.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating check-in:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
