import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Allow public access to guide profiles (for tour operators to view)
    // Authentication is optional but recommended
    const session = await getServerSession(authOptions);

    const { id: guideId } = await params;

    // Get guide profile with full details
    const guide = await prisma.user.findUnique({
      where: { id: guideId },
      include: {
        profile: true,
        wallet: {
          select: {
            balance: true,
            lockedDeposit: true,
            reserved: true,
          },
        },
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        companyMember: {
          include: {
            company: {
              select: {
                id: true,
                companyId: true,
                name: true,
                logo: true,
              },
            },
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
        // Get tour statistics
        applications: {
          select: {
            status: true,
            tour: {
              select: {
                status: true,
              },
            },
          },
        },
        reviewsReceived: {
          take: 20, // Show more reviews
          orderBy: { createdAt: "desc" },
          include: {
            reviewer: {
              include: {
                profile: {
                  select: {
                    id: true,
                    name: true,
                    companyName: true,
                    photoUrl: true,
                  },
                },
              },
            },
            tour: {
              select: {
                id: true,
                title: true,
                city: true,
                startDate: true,
              },
            },
          },
        },
      },
    });

    if (!guide || guide.role !== "TOUR_GUIDE") {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    // Calculate badges
    const badges = [];
    if (guide.verifiedStatus === "APPROVED") {
      badges.push("KYC_VERIFIED");
    }
    if (guide.employmentType === "FREELANCE") {
      badges.push("FREELANCE_GUIDE");
    } else if (guide.employmentType === "IN_HOUSE") {
      badges.push("IN_HOUSE_GUIDE");
    }
    if (guide.profile?.rating && guide.profile.rating >= 4.5) {
      badges.push("TOP_RATED");
    }
    if (guide._count.applications >= 10) {
      badges.push("EXPERIENCED");
    }

    // Calculate tour statistics
    const completedTours = guide.applications.filter(
      (app: any) => app.status === "ACCEPTED" && app.tour.status === "COMPLETED"
    ).length;
    
    const cancelledTours = guide.applications.filter(
      (app: any) => app.status === "ACCEPTED" && app.tour.status === "CANCELLED"
    ).length;

    // Calculate average rating from reviews
    const reviews = guide.reviewsReceived || [];
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : guide.profile?.rating || 0;

    return NextResponse.json({
      ...guide,
      badges,
      stats: {
        completedTours,
        cancelledTours,
        totalAcceptedApplications: guide._count.applications,
        totalReviews: guide._count.reviewsReceived,
        averageRating,
      },
    });
  } catch (error: any) {
    console.error("Error fetching guide profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



