import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { AvailabilityService } from "@/domain/services/availability.service";

interface MatchingCriteria {
  prioritizeExperience?: boolean;
  prioritizeRating?: boolean;
  prioritizeLanguages?: string[];
  minRating?: number;
  minExperience?: number;
}

/**
 * Calculate matching score for a guide based on tour requirements
 */
function calculateMatchScore(
  guide: any,
  tour: any,
  criteria: MatchingCriteria = {}
): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // 1. City match (30 points)
  // Note: Profile doesn't have city, but we can check specialties
  if (guide.profile?.specialties?.some((s: string) => 
    s.toLowerCase().includes(tour.city.toLowerCase())
  )) {
    score += 30;
    reasons.push(`Có chuyên môn về ${tour.city}`);
  }

  // 2. Language match (25 points)
  if (tour.languages && tour.languages.length > 0) {
    const matchingLanguages = tour.languages.filter((lang: string) =>
      guide.profile?.languages?.includes(lang)
    );
    if (matchingLanguages.length > 0) {
      const languageScore = (matchingLanguages.length / tour.languages.length) * 25;
      score += languageScore;
      reasons.push(`Thành thạo ${matchingLanguages.join(", ")}`);
    }
  }

  // 3. Specialty match (20 points)
  if (tour.specialties && tour.specialties.length > 0) {
    const matchingSpecialties = tour.specialties.filter((spec: string) =>
      guide.profile?.specialties?.includes(spec)
    );
    if (matchingSpecialties.length > 0) {
      const specialtyScore = (matchingSpecialties.length / tour.specialties.length) * 20;
      score += specialtyScore;
      reasons.push(`Chuyên về ${matchingSpecialties.join(", ")}`);
    }
  }

  // 4. Experience (15 points)
  const experienceYears = guide.profile?.experienceYears || 0;
  if (criteria.prioritizeExperience) {
    // Boost experience weight if prioritized
    const experienceScore = Math.min(experienceYears * 3, 20);
    score += experienceScore;
    if (experienceYears > 0) {
      reasons.push(`${experienceYears} years of experience`);
    }
  } else {
    const experienceScore = Math.min(experienceYears * 2, 15);
    score += experienceScore;
    if (experienceYears > 0) {
      reasons.push(`${experienceYears} years of experience`);
    }
  }

  // 5. Rating (10 points)
  const rating = guide.profile?.rating || 0;
  if (criteria.prioritizeRating) {
    // Boost rating weight if prioritized
    const ratingScore = Math.min(rating * 2, 15);
    score += ratingScore;
    if (rating >= 4.5) {
      reasons.push(`Reviews xuất sắc (${rating.toFixed(1)}⭐)`);
    } else if (rating >= 4.0) {
      reasons.push(`Reviews tốt (${rating.toFixed(1)}⭐)`);
    }
  } else {
    const ratingScore = Math.min(rating * 2, 10);
    score += ratingScore;
    if (rating >= 4.5) {
      reasons.push(`Reviews xuất sắc (${rating.toFixed(1)}⭐)`);
    }
  }

  // 6. Review count (bonus points)
  const reviewCount = guide.profile?.reviewCount || 0;
  if (reviewCount > 10) {
    score += 5;
    reasons.push(`Nhiều đánh giá tích cực (${reviewCount} reviews)`);
  }

  // 7. Availability status
  if (guide.profile?.availabilityStatus === "AVAILABLE") {
    score += 5;
    reasons.push("Available");
  }

  // Apply filters
  if (criteria.minRating && (guide.profile?.rating || 0) < criteria.minRating) {
    return { score: 0, reasons: [] };
  }

  if (criteria.minExperience && (guide.profile?.experienceYears || 0) < criteria.minExperience) {
    return { score: 0, reasons: [] };
  }

  // Language priority filter
  if (criteria.prioritizeLanguages && criteria.prioritizeLanguages.length > 0) {
    const hasPriorityLanguage = criteria.prioritizeLanguages.some((lang) =>
      guide.profile?.languages?.includes(lang)
    );
    if (hasPriorityLanguage) {
      score += 10; // Bonus for priority languages
      reasons.push(`Có ngôn ngữ ưu tiên: ${criteria.prioritizeLanguages.join(", ")}`);
    }
  }

  return { score, reasons };
}

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
    const searchParams = req.nextUrl.searchParams;
    
    // Parse matching criteria
    const criteria: MatchingCriteria = {
      prioritizeExperience: searchParams.get("prioritizeExperience") === "true",
      prioritizeRating: searchParams.get("prioritizeRating") === "true",
      prioritizeLanguages: searchParams.get("prioritizeLanguages")?.split(",").filter(Boolean),
      minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
      minExperience: searchParams.get("minExperience") ? parseInt(searchParams.get("minExperience")!) : undefined,
    };

    // Get tour details
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: true,
        applications: {
          select: {
            guideId: true,
            status: true,
          },
        },
        assignments: {
          select: {
            guideId: true,
            status: true,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Check if user is the operator
    if (session.user.id !== tour.operatorId) {
      return NextResponse.json(
        { error: "Only tour operators can use this feature" },
        { status: 403 }
      );
    }

    // Get all verified guides
    const allGuides = await prisma.user.findMany({
      where: {
        role: "TOUR_GUIDE",
        verifiedStatus: "APPROVED",
        profile: {
          isNot: null,
        },
      },
      include: {
        profile: true,
        wallet: true,
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
    });

    // Filter eligible guides
    const eligibleGuides = allGuides.filter((guide) => {
      // Check wallet balance (minimum 500k)
      if (!guide.wallet || guide.wallet.balance < 500000) {
        return false;
      }

      // Exclude guides who already applied or were assigned
      const hasApplied = tour.applications.some((app) => app.guideId === guide.id);
      const hasAssigned = tour.assignments.some((assign) => assign.guideId === guide.id);
      
      if (hasApplied || hasAssigned) {
        return false;
      }

      return true;
    });

    // Calculate match scores and check availability
    const matches = await Promise.all(
      eligibleGuides.map(async (guide) => {
        // Check availability
        const availability = await AvailabilityService.isAvailable(
          guide.id,
          tour.startDate,
          tour.endDate || tour.startDate
        );

        // Calculate match score
        const matchResult = calculateMatchScore(guide, tour, criteria);

        return {
          guide: {
            id: guide.id,
            code: guide.code,
            email: guide.email,
            profile: {
              name: guide.profile?.name,
              photoUrl: guide.profile?.photoUrl,
              bio: guide.profile?.bio,
              languages: guide.profile?.languages || [],
              specialties: guide.profile?.specialties || [],
              experienceYears: guide.profile?.experienceYears || 0,
              rating: guide.profile?.rating || 0,
              reviewCount: guide.profile?.reviewCount || 0,
              availabilityStatus: guide.profile?.availabilityStatus,
            },
            wallet: {
              balance: guide.wallet?.balance || 0,
            },
            company: guide.companyMember?.company
              ? {
                  id: guide.companyMember.company.id,
                  name: guide.companyMember.company.name,
                }
              : null,
            employmentType: guide.employmentType,
            acceptedApplicationsCount: guide._count.applications,
          },
          score: matchResult.score,
          reasons: matchResult.reasons,
          available: availability.available,
          availabilityReason: availability.reason,
          conflictingTours: availability.conflictingTours || [],
        };
      })
    );

    // Filter out unavailable guides and sort by score
    const availableMatches = matches
      .filter((match) => match.available && match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 matches

    // Categorize matches
    const topMatches = availableMatches.slice(0, 5); // Top 5
    const goodMatches = availableMatches.slice(5, 10); // Next 5
    const otherMatches = availableMatches.slice(10); // Rest

    return NextResponse.json({
      tour: {
        id: tour.id,
        title: tour.title,
        city: tour.city,
        startDate: tour.startDate,
        endDate: tour.endDate,
        languages: tour.languages,
        specialties: tour.specialties,
        visibility: tour.visibility,
      },
      matches: {
        top: topMatches,
        good: goodMatches,
        other: otherMatches,
      },
      total: availableMatches.length,
      criteria,
    });
  } catch (error: any) {
    console.error("Error in AI matching:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

