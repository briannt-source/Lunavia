import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const role = (session.user as any).role;

        // Fetch user profile data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                code: true,
                email: true,
                role: true,
                verifiedStatus: true,
                trustScore: true,
                createdAt: true,
                profile: {
                    select: {
                        name: true,
                        photoUrl: true,
                        bio: true,
                        languages: true,
                        experienceYears: true,
                        specialties: true,
                        rating: true,
                        reviewCount: true,
                        companyName: true,
                        companyLogo: true,
                        address: true,
                        phone: true,
                        companyEmail: true,
                        availabilityStatus: true,
                    }
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Flatten profile into user object for convenience
        const profile = {
            ...user,
            name: user.profile?.name || user.email,
            photoUrl: user.profile?.photoUrl || null,
            bio: user.profile?.bio || '',
            languages: user.profile?.languages || [],
            experienceYears: user.profile?.experienceYears || 0,
            specialties: user.profile?.specialties || [],
            rating: user.profile?.rating || 0,
            reviewCount: user.profile?.reviewCount || 0,
            companyName: user.profile?.companyName || null,
            companyLogo: user.profile?.companyLogo || null,
            address: user.profile?.address || null,
            phone: user.profile?.phone || null,
            companyEmail: user.profile?.companyEmail || null,
            availabilityStatus: user.profile?.availabilityStatus || 'AVAILABLE',
        };

        let stats: any = {};
        let portfolioTours: any[] = [];

        if (role === 'TOUR_OPERATOR' || role === 'TOUR_AGENCY') {
            // Operator stats
            const [toursCreated, toursCompleted, totalTours] = await Promise.all([
                prisma.tour.count({ where: { operatorId: userId } }),
                prisma.tour.count({ where: { operatorId: userId, status: 'COMPLETED' } }),
                prisma.tour.count({ where: { operatorId: userId, status: { notIn: ['DRAFT'] } } }),
            ]);

            // Collaborating guides count
            const collaborators = await prisma.application.groupBy({
                by: ['guideId'],
                where: { tour: { operatorId: userId }, status: 'ACCEPTED' },
            });

            stats = {
                toursCreated,
                toursCompleted,
                completionRate: totalTours > 0 ? Math.round((toursCompleted / totalTours) * 100) : 0,
                collaborators: collaborators.length,
            };

            // Recent completed tours for portfolio display
            portfolioTours = await prisma.tour.findMany({
                where: { operatorId: userId, status: 'COMPLETED' },
                select: {
                    id: true,
                    title: true,
                    city: true,
                    startDate: true,
                    endDate: true,
                    pax: true,
                    languages: true,
                },
                orderBy: { startDate: 'desc' },
                take: 10,
            });

        } else if (role === 'TOUR_GUIDE') {
            // Guide stats
            const [acceptedApps, completedApps, totalReviews] = await Promise.all([
                prisma.application.count({ where: { guideId: userId, status: 'ACCEPTED' } }),
                prisma.application.count({
                    where: { guideId: userId, status: 'ACCEPTED', tour: { status: 'COMPLETED' } }
                }),
                prisma.review.count({ where: { subjectId: userId } }),
            ]);

            const avgRating = await prisma.review.aggregate({
                where: { subjectId: userId },
                _avg: { overallRating: true },
            });

            stats = {
                toursCompleted: completedApps,
                toursAccepted: acceptedApps,
                totalReviews,
                avgRating: avgRating._avg?.overallRating?.toFixed(1) || null,
            };

            // Recent completed tours
            const recentApps = await prisma.application.findMany({
                where: { guideId: userId, status: 'ACCEPTED', tour: { status: 'COMPLETED' } },
                select: {
                    tour: {
                        select: {
                            id: true,
                            title: true,
                            city: true,
                            startDate: true,
                            endDate: true,
                            pax: true,
                            languages: true,
                        }
                    }
                },
                orderBy: { tour: { startDate: 'desc' } },
                take: 10,
            });

            portfolioTours = recentApps.map(a => a.tour);
        }

        return NextResponse.json({ profile, stats, portfolioTours });

    } catch (error: any) {
        console.error('[API /portfolio GET]', error);
        return NextResponse.json(
            { error: 'Failed to load portfolio data' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { bio, languages, experienceYears, specialties } = body;

        // Update profile
        await prisma.profile.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...(bio !== undefined && { bio }),
                ...(languages !== undefined && { languages }),
                ...(experienceYears !== undefined && { experienceYears }),
                ...(specialties !== undefined && { specialties }),
            },
            update: {
                ...(bio !== undefined && { bio }),
                ...(languages !== undefined && { languages }),
                ...(experienceYears !== undefined && { experienceYears }),
                ...(specialties !== undefined && { specialties }),
            },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API /portfolio PUT]', error);
        return NextResponse.json(
            { error: 'Failed to update portfolio' },
            { status: 500 }
        );
    }
}
