import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/marketplace/guides
 * Public guide marketplace — search and browse verified guides.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const language = searchParams.get("language") || "";
    const city = searchParams.get("city") || "";
    const specialty = searchParams.get("specialty") || "";
    const skip = (page - 1) * limit;

    const where: any = {
      role: "TOUR_GUIDE",
      verificationStatus: "APPROVED",
      isActive: true,
    };

    if (search) {
      where.OR = [
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
        { profile: { about: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (language) {
      where.profile = {
        ...where.profile,
        languages: { has: language },
      };
    }

    if (city) {
      where.profile = {
        ...where.profile,
        city: { contains: city, mode: "insensitive" },
      };
    }

    if (specialty) {
      where.profile = {
        ...where.profile,
        skills: { has: specialty },
      };
    }

    const [guides, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          _count: {
            select: {
              guideApplications: { where: { status: "ACCEPTED" } },
              guideAssignments: { where: { status: "APPROVED" } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { trustScore: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.user.count({ where }),
    ]);

    const sanitized = guides.map((g) => ({
      id: g.id,
      name: g.profile?.fullName || g.name || "Guide",
      avatar: g.profile?.avatarUrl || g.image,
      about: g.profile?.about || "",
      languages: g.profile?.languages || [],
      skills: g.profile?.skills || [],
      city: g.profile?.city || "",
      experienceYears: g.profile?.experienceYears || 0,
      trustScore: g.trustScore,
      completedTours: (g._count?.guideApplications || 0) + (g._count?.guideAssignments || 0),
      verificationStatus: g.verificationStatus,
    }));

    return NextResponse.json({
      guides: sanitized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching marketplace guides:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
