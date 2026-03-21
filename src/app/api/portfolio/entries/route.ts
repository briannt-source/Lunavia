import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** GET /api/portfolio/entries — Get portfolio entries for current user */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { prisma } = await import("@/lib/prisma");
    const assignments = await prisma.assignment.findMany({
      where: { guideId: session.user.id, status: "APPROVED" },
      include: { tour: { select: { id: true, title: true, city: true, startDate: true, endDate: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments.map(a => ({
      id: a.id, tourId: a.tour.id, title: a.tour.title, city: a.tour.city,
      startDate: a.tour.startDate, endDate: a.tour.endDate, status: a.tour.status, role: a.role,
    })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
