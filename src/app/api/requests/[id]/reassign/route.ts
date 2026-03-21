import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** POST /api/requests/:id/reassign — Reassign guide on a request */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: tourId } = await params;
    const body = await req.json();

    // Remove old assignment
    if (body.oldGuideId) {
      await prisma.assignment.updateMany({
        where: { tourId, guideId: body.oldGuideId },
        data: { status: "CANCELLED" },
      });
    }

    // Create new assignment
    const assignment = await prisma.assignment.create({
      data: {
        tourId,
        guideId: body.guideId || body.newGuideId,
        role: body.role || "MAIN",
        status: "APPROVED",
        assignedBy: session.user.id,
      },
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
