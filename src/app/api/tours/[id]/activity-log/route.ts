import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * GET /api/tours/:id/activity-log — Activity log for a tour
 * Returns a chronological log of all actions taken on the tour.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;

    // Try to fetch from audit logs if available
    const { prisma } = await import("@/lib/prisma");

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true, status: true, createdAt: true, updatedAt: true,
        safetyCheckIns: {
          select: { id: true, status: true, createdAt: true, guideId: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        emergencies: {
          select: { id: true, type: true, description: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        applications: {
          select: { id: true, status: true, createdAt: true, guideId: true },
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          select: { id: true, status: true, createdAt: true, guideId: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const log: any[] = [];

    log.push({ action: "TOUR_CREATED", timestamp: tour.createdAt, actor: null });

    tour.applications.forEach((a) => {
      log.push({ action: `APPLICATION_${a.status}`, timestamp: a.createdAt, actor: a.guideId, targetId: a.id });
    });

    tour.assignments.forEach((a) => {
      log.push({ action: `ASSIGNMENT_${a.status}`, timestamp: a.createdAt, actor: a.guideId, targetId: a.id });
    });

    tour.safetyCheckIns.forEach((c) => {
      log.push({ action: `CHECKIN_${c.status}`, timestamp: c.createdAt, actor: c.guideId, targetId: c.id });
    });

    tour.emergencies.forEach((e) => {
      log.push({ action: "EMERGENCY", timestamp: e.createdAt, description: e.description, targetId: e.id });
    });

    log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ tourId, log });
  } catch (error: any) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
