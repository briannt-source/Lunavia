import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/incidents/[id]/resolve
 * Resolve an incident (admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can resolve incidents" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { resolution, notes } = body;

    const incident = await prisma.emergencyReport.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    if (incident.status === "RESOLVED") {
      return NextResponse.json({ error: "Incident already resolved" }, { status: 400 });
    }

    const updated = await prisma.emergencyReport.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
        resolutionNotes: notes || resolution || "Resolved by admin",
      },
    });

    return NextResponse.json({ incident: updated });
  } catch (error: any) {
    console.error("Error resolving incident:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
