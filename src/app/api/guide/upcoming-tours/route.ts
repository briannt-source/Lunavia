import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guide/upcoming-tours
 * Returns future tours assigned to the guide.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const [applicationTours, assignmentTours] = await Promise.all([
      prisma.tour.findMany({
        where: {
          applications: {
            some: {
              guideId: session.user.id,
              status: "ACCEPTED",
            },
          },
          startDate: { gt: now },
          status: { in: ["OPEN", "CLOSED"] },
        },
        include: {
          operator: { include: { profile: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { startDate: "asc" },
        take: 20,
      }),
      prisma.tour.findMany({
        where: {
          assignments: {
            some: {
              guideId: session.user.id,
              status: "APPROVED",
            },
          },
          startDate: { gt: now },
          status: { in: ["OPEN", "CLOSED"] },
        },
        include: {
          operator: { include: { profile: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { startDate: "asc" },
        take: 20,
      }),
    ]);

    const seen = new Set<string>();
    const tours = [...applicationTours, ...assignmentTours]
      .filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 20);

    return NextResponse.json(tours);
  } catch (error: any) {
    console.error("Error fetching upcoming tours:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
