/**
 * GuideMatchingEngine — Intelligent Guide Ranking
 *
 * Scores guides 0–100 based on:
 *   - Trust score: 40%
 *   - Experience: 20%
 *   - Language match: 20%
 *   - Availability: 10%
 *   - Past collaboration: 10%
 */

import { prisma } from '@/lib/prisma';

interface MatchScoreBreakdown {
    trustScore: number;
    experience: number;
    languageMatch: number;
    availability: number;
    collaboration: number;
    total: number;
}

interface RankedGuide {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    trustScore: number;
    experienceYears: number;
    languages: string | null;
    skills: string | null;
    bio: string | null;
    verificationStatus: string;
    matchScore: MatchScoreBreakdown;
    isAvailable: boolean;
}

/**
 * Calculate match score for a single guide against tour requirements
 */
function calculateGuideMatchScore(params: {
    guide: {
        trustScore: number;
        experienceYears: number | null;
        languages: string | null;
    };
    tour: {
        language: string | null;
        startTime: Date;
        operatorId: string;
    };
    isAvailable: boolean;
    completedToursWithOperator: number;
}): MatchScoreBreakdown {
    const { guide, tour, isAvailable, completedToursWithOperator } = params;

    // 1. Trust Score (40%) — normalize 0-100 to 0-40
    const trustComponent = Math.min(guide.trustScore, 100) * 0.4;

    // 2. Experience (20%) — 10+ years = max score
    const expYears = guide.experienceYears || 0;
    const experienceComponent = Math.min(expYears / 10, 1) * 20;

    // 3. Language Match (20%)
    let languageComponent = 0;
    if (tour.language && guide.languages) {
        try {
            const guideLangs: string[] = JSON.parse(guide.languages);
            const tourLang = tour.language.toUpperCase();
            if (guideLangs.some(l => l.toUpperCase() === tourLang)) {
                languageComponent = 20; // Full match
            } else {
                languageComponent = 5; // Partial credit for having languages listed
            }
        } catch {
            // languages is not JSON, try simple string match
            if (guide.languages.toUpperCase().includes(tour.language.toUpperCase())) {
                languageComponent = 20;
            }
        }
    } else if (!tour.language) {
        languageComponent = 10; // No language requirement = partial credit
    }

    // 4. Availability (10%)
    const availabilityComponent = isAvailable ? 10 : 0;

    // 5. Past Collaboration (10%) — 5+ tours = max
    const collaborationComponent = Math.min(completedToursWithOperator / 5, 1) * 10;

    const total = Math.round(
        trustComponent + experienceComponent + languageComponent +
        availabilityComponent + collaborationComponent
    );

    return {
        trustScore: Math.round(trustComponent * 10) / 10,
        experience: Math.round(experienceComponent * 10) / 10,
        languageMatch: Math.round(languageComponent * 10) / 10,
        availability: Math.round(availabilityComponent * 10) / 10,
        collaboration: Math.round(collaborationComponent * 10) / 10,
        total: Math.min(total, 100),
    };
}

/**
 * Rank all eligible guides for a specific tour
 */
async function rankGuidesForTour(tourId: string): Promise<RankedGuide[]> {
    // Fetch tour details
    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        select: {
            id: true, operatorId: true, language: true,
            startTime: true, endTime: true, status: true,
        },
    });

    if (!tour) throw new Error('Tour not found');

    // Fetch all active guides
    const guides = await prisma.user.findMany({
        where: {
            role: { name: 'TOUR_GUIDE' },
            accountStatus: 'ACTIVE',
        },
        select: {
            id: true, name: true, avatarUrl: true,
            trustScore: true, experienceYears: true,
            languages: true, skills: true, bio: true,
            verificationStatus: true,
        },
    });

    // Batch fetch availability for tour date
    const availabilityBlocks = await prisma.guideAvailability.findMany({
        where: {
            userId: { in: guides.map(g => g.id) },
            date: tour.startTime,
            status: 'AVAILABLE',
        },
        select: { userId: true },
    });
    const availableGuideIds = new Set(availabilityBlocks.map(a => a.userId));

    // Batch fetch collaboration counts
    const collaborations = await prisma.tour.groupBy({
        by: ['assignedGuideId'],
        where: {
            operatorId: tour.operatorId,
            status: 'COMPLETED',
            assignedGuideId: { in: guides.map(g => g.id) },
        },
        _count: { id: true },
    });
    const collabMap = new Map(
        collaborations.map(c => [c.assignedGuideId!, c._count.id])
    );

    // Score each guide
    const ranked: RankedGuide[] = guides.map(guide => {
        const isAvailable = availableGuideIds.has(guide.id);
        const completedToursWithOperator = collabMap.get(guide.id) || 0;

        const matchScore = calculateGuideMatchScore({
            guide,
            tour,
            isAvailable,
            completedToursWithOperator,
        });

        return {
            ...guide,
            trustScore: guide.trustScore,
            experienceYears: guide.experienceYears || 0,
            matchScore,
            isAvailable,
        };
    });

    // Sort by total score descending
    ranked.sort((a, b) => b.matchScore.total - a.matchScore.total);

    return ranked;
}

export const GuideMatchingEngine = {
    calculateGuideMatchScore,
    rankGuidesForTour,
};
