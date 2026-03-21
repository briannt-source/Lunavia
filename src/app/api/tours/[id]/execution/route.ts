import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/execution
 * Returns execution state data for a live tour.
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

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: { include: { profile: true } },
        applications: {
          where: { status: "ACCEPTED" },
          include: { guide: { include: { profile: true } } },
        },
        assignments: {
          where: { status: "APPROVED" },
          include: { guide: { include: { profile: true } } },
        },
        safetyCheckIns: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        emergencies: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Check access: must be operator, assigned guide, or admin
    const isOperator = tour.operatorId === session.user.id;
    const isGuide = tour.applications.some((a) => a.guideId === session.user.id) ||
      tour.assignments.some((a) => a.guideId === session.user.id);
    const role = (session.user as any)?.role;
    const isAdmin = role?.startsWith("ADMIN_");

    if (!isOperator && !isGuide && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      id: tour.id,
      title: tour.title,
      status: tour.status,
      startDate: tour.startDate,
      endDate: tour.endDate,
      city: tour.city,
      pax: tour.pax,
      operator: {
        id: tour.operator.id,
        name: tour.operator.profile?.name || tour.operator.name,
        avatar: tour.operator.profile?.avatarUrl || tour.operator.image,
      },
      guides: [
        ...tour.applications.map((a) => ({
          id: a.guide.id,
          name: a.guide.profile?.name || a.guide.name,
          avatar: a.guide.profile?.avatarUrl || a.guide.image,
          role: a.role,
          source: "application",
        })),
        ...tour.assignments.map((a) => ({
          id: a.guide.id,
          name: a.guide.profile?.name || a.guide.name,
          avatar: a.guide.profile?.avatarUrl || a.guide.image,
          role: a.role,
          source: "assignment",
        })),
      ],
      safetyCheckIns: tour.safetyCheckIns,
      emergencies: tour.emergencies,
      itinerary: tour.itinerary,
      guideNotes: tour.guideNotes,
    });
  } catch (error: any) {
    console.error("Error fetching tour execution:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
