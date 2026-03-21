import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/tours/:id/sos-broadcast — Create SOS broadcast for a tour (operator-facing)
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
    const body = await req.json().catch(() => ({}));

    const emergency = await prisma.emergencyReport.create({
      data: {
        tourId,
        type: "SOS",
        description: body.description || body.message || "SOS broadcast from tour",
        severity: "CRITICAL",
        status: "PENDING",
        guideId: session.user.id,
      },
    });

    return NextResponse.json(emergency, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tour SOS broadcast:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
