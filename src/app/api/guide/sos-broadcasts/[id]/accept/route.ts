import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/guide/sos-broadcasts/:id/accept — Accept/respond to an SOS broadcast
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

    const { id: emergencyId } = await params;

    const emergency = await prisma.emergency.findUnique({
      where: { id: emergencyId },
      include: { tour: { select: { operatorId: true, title: true } } },
    });

    if (!emergency) {
      return NextResponse.json({ error: "SOS broadcast not found" }, { status: 404 });
    }

    // Update emergency status
    const updated = await prisma.emergency.update({
      where: { id: emergencyId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedBy: session.user.id,
        acknowledgedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, emergency: updated });
  } catch (error: any) {
    console.error("Error accepting SOS broadcast:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
