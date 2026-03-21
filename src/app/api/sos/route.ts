import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/sos — Get SOS status */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { prisma } = await import("@/lib/prisma");
    const active = await prisma.emergency.findMany({
      where: { reportedBy: session.user.id, status: "ACTIVE" },
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
    const { prisma } = await import("@/lib/prisma");
    const emergency = await prisma.emergency.create({
      data: {
        tourId: body.tourId,
        type: "SOS",
        description: body.description || "Emergency SOS triggered",
        status: "ACTIVE",
        reportedBy: session.user.id,
      },
    });
    return NextResponse.json(emergency, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
