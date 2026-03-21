import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/marketplace/guides/:id
 * Public guide detail for marketplace.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guideId: string }> }
) {
  try {
    const { guideId } = await params;

    const guide = await prisma.user.findUnique({
      where: { id: guideId, role: "TOUR_GUIDE" },
      include: {
        profile: true,
        guideApplications: {
          where: { status: "ACCEPTED" },
          include: {
            tour: {
              select: { id: true, title: true, city: true, startDate: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        guideAssignments: {
          where: { status: "APPROVED" },
          include: {
            tour: {
              select: { id: true, title: true, city: true, startDate: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            guideApplications: { where: { status: "ACCEPTED" } },
            guideAssignments: { where: { status: "APPROVED" } },
          },
        },
      },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    // Merge tours from applications and assignments
    const pastTours = [
      ...guide.guideApplications.map((a) => a.tour),
      ...guide.guideAssignments.map((a) => a.tour),
    ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

    return NextResponse.json({
      id: guide.id,
      name: guide.profile?.fullName || guide.name || "Guide",
      avatar: guide.profile?.avatarUrl || guide.image,
      about: guide.profile?.about || "",
      languages: guide.profile?.languages || [],
      skills: guide.profile?.skills || [],
      city: guide.profile?.city || "",
      experienceYears: guide.profile?.experienceYears || 0,
      trustScore: guide.trustScore,
      completedTours: (guide._count?.guideApplications || 0) + (guide._count?.guideAssignments || 0),
      verificationStatus: guide.verificationStatus,
      recentTours: pastTours.slice(0, 10),
      joinedAt: guide.createdAt,
    });
  } catch (error: any) {
    console.error("Error fetching guide detail:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
