import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guide/today-tours
 * Returns tours assigned to the guide that are happening today.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Find tours where the guide has an accepted application or approved assignment today
    const [applicationTours, assignmentTours] = await Promise.all([
      prisma.tour.findMany({
        where: {
          applications: {
            some: {
              guideId: session.user.id,
              status: "ACCEPTED",
            },
          },
          startDate: { gte: startOfDay, lt: endOfDay },
        },
        include: {
          operator: { include: { profile: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { startDate: "asc" },
      }),
      prisma.tour.findMany({
        where: {
          assignments: {
            some: {
              guideId: session.user.id,
              status: "APPROVED",
            },
          },
          startDate: { gte: startOfDay, lt: endOfDay },
        },
        include: {
          operator: { include: { profile: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { startDate: "asc" },
      }),
    ]);

    // Deduplicate by ID
    const seen = new Set<string>();
    const tours = [...applicationTours, ...assignmentTours].filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    return NextResponse.json(tours);
  } catch (error: any) {
    console.error("Error fetching today tours:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
