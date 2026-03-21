import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guides/:id — Get guide profile by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guideId } = await params;

    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: {
        profile: true,
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

    return NextResponse.json({
      id: guide.id,
      name: guide.profile?.fullName || guide.name || "Guide",
      email: guide.email,
      avatar: guide.profile?.avatarUrl || guide.image,
      about: guide.profile?.about || "",
      languages: guide.profile?.languages || [],
      skills: guide.profile?.skills || [],
      city: guide.profile?.city || "",
      experienceYears: guide.profile?.experienceYears || 0,
      trustScore: guide.trustScore,
      verificationStatus: guide.verificationStatus,
      completedTours: (guide._count?.guideApplications || 0) + (guide._count?.guideAssignments || 0),
      createdAt: guide.createdAt,
    });
  } catch (error: any) {
    console.error("Error fetching guide:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
