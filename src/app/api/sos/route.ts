import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/sos — Get active SOS reports */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const active = await prisma.emergencyReport.findMany({
      where: { guideId: session.user.id, status: { in: ["PENDING", "ACKNOWLEDGED", "IN_PROGRESS"] } },
      include: { tour: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ activeAlerts: active, count: active.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

/** POST /api/sos — Trigger SOS alert */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const emergency = await prisma.emergencyReport.create({
      data: {
        tourId: body.tourId,
        guideId: session.user.id,
        type: "SOS",
        description: body.description || "Emergency SOS triggered",
        severity: "CRITICAL",
        status: "PENDING",
      },
    });
    return NextResponse.json(emergency, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
