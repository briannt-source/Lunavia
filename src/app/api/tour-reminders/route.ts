import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/tour-reminders — Get upcoming tour reminders */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { prisma } = await import("@/lib/prisma");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTours = await prisma.tour.findMany({
      where: {
        OR: [
          { operatorId: session.user.id },
          { assignments: { some: { guideId: session.user.id, status: "APPROVED" } } },
        ],
        startDate: { gte: tomorrow, lte: nextWeek },
        status: { in: ["CLOSED", "CONFIRMED"] },
      },
      select: { id: true, title: true, city: true, startDate: true },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(upcomingTours);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
