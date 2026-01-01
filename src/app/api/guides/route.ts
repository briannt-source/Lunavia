import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const availabilityStatus = searchParams.get("availabilityStatus");
    const specialties = searchParams.get("specialties")?.split(",").filter(Boolean);
    const languages = searchParams.get("languages")?.split(",").filter(Boolean);

    // Exclude test guides (guide1@lunavia.com to guide25@lunavia.com)
    const testGuideEmails = Array.from({ length: 25 }, (_, i) => `guide${i + 1}@lunavia.com`);

    const where: any = {
      role: "TOUR_GUIDE",
      verifiedStatus: "APPROVED", // Only show verified guides
      email: {
        notIn: testGuideEmails,
        not: null, // Ensure email exists
      },
      profile: {
        isNot: null, // Ensure profile exists
      },
    };

    // Build profile filters
    const profileWhere: any = {};
    
    // Note: Profile model doesn't have a city field
    // City filter can be based on specialties if needed, but for now we skip city filter for guides
    // Guides can be filtered by specialties which may include city names

    if (availabilityStatus && availabilityStatus !== "all") {
      profileWhere.availabilityStatus = availabilityStatus;
    }

    if (specialties && specialties.length > 0) {
      profileWhere.specialties = {
        hasSome: specialties,
      };
    }

    if (languages && languages.length > 0) {
      profileWhere.languages = {
        hasSome: languages,
      };
    }

    if (Object.keys(profileWhere).length > 0) {
      where.profile = {
        ...where.profile,
        ...profileWhere,
      };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const guides = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        companyMember: {
          include: {
            company: true,
          },
        },
        _count: {
          select: {
            applications: {
              where: {
                status: "ACCEPTED",
              },
            },
          },
        },
      },
      orderBy: {
        profile: {
          rating: "desc",
        },
      },
      take: 50,
    });

    // Filter out guides without valid email or profile
    const validGuides = guides.filter(
      (guide) => guide.email && guide.profile
    );

    return NextResponse.json({ guides: validGuides });
  } catch (error: any) {
    console.error("Error fetching guides:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch guides" },
      { status: 500 }
    );
  }
}

