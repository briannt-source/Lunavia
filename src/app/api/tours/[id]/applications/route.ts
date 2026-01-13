import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    // Get tour to verify ownership
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Check if user is operator or guide
    const isOperator = tour.operatorId === session.user.id;
    const isGuide = session.user.role === "TOUR_GUIDE";

    if (!isOperator && !isGuide) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = { tourId };
    if (status) {
      where.status = status;
    }
    if (role) {
      where.role = role;
    }

    // If guide, only show their own applications
    if (isGuide && !isOperator) {
      where.guideId = session.user.id;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        guide: {
          include: {
            profile: true,
            wallet: true,
            verifications: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
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
                reviewsReceived: true,
              },
            },
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            city: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














