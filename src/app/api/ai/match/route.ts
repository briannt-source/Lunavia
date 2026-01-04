import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { LunaviaService } from "@/infrastructure/ai/lunavia.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tourId = searchParams.get("tourId");

    if (!tourId) {
      return NextResponse.json(
        { error: "tourId is required" },
        { status: 400 }
      );
    }

    // Get tour details
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Get all guides
    const guides = await prisma.user.findMany({
      where: {
        role: "TOUR_GUIDE",
        verifiedStatus: "APPROVED",
      },
      include: {
        profile: true,
        wallet: true,
      },
    });

    // Filter guides that can apply
    const eligibleGuides = [];
    for (const guide of guides) {
      const wallet = guide.wallet;
      if (wallet && wallet.balance >= 500000) {
        eligibleGuides.push(guide.id);
      }
    }

    // Use Lunavia AI to match
    const matches = await LunaviaService.matchGuidesToTour(
      tourId,
      eligibleGuides
    );

    // Enrich with guide details
    const enrichedMatches = await Promise.all(
      matches.matches.map(async (match) => {
        const guide = await prisma.user.findUnique({
          where: { id: match.guideId },
          include: { profile: true },
        });

        return {
          ...match,
          guide: guide
            ? {
                id: guide.id,
                name: guide.profile?.name,
                rating: guide.profile?.rating,
                languages: guide.profile?.languages,
                specialties: guide.profile?.specialties,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ matches: enrichedMatches });
  } catch (error: any) {
    console.error("Error in AI match:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

