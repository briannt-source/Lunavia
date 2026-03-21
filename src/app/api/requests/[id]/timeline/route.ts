import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/requests/:id/timeline — Get timeline events for a request */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: tourId } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true, status: true, createdAt: true, startDate: true, endDate: true,
        applications: { select: { id: true, status: true, createdAt: true, guideId: true }, orderBy: { createdAt: "asc" } },
        assignments: { select: { id: true, status: true, createdAt: true, guideId: true }, orderBy: { createdAt: "asc" } },
        safetyCheckIns: { select: { id: true, status: true, createdAt: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const events: any[] = [
      { type: "CREATED", timestamp: tour.createdAt },
      ...tour.applications.map(a => ({ type: `APPLICATION_${a.status}`, timestamp: a.createdAt, actor: a.guideId })),
      ...tour.assignments.map(a => ({ type: `ASSIGNMENT_${a.status}`, timestamp: a.createdAt, actor: a.guideId })),
      ...tour.safetyCheckIns.map(c => ({ type: `CHECKIN_${c.status}`, timestamp: c.createdAt })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ tourId, events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
