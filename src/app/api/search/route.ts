import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/search
 * 
 * Enhanced full-text search across tours, users, and cities.
 * Query params: q (search term), type (tour|user|city|all), limit
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q')?.trim();
        const type = searchParams.get('type') || 'all';
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

        if (!q || q.length < 2) {
            return NextResponse.json({ success: false, error: 'Search query must be at least 2 characters' }, { status: 400 });
        }

        const results: any = {};
        const searchTerm = `%${q}%`;

        // ── Tour Search ──────────────────────────────────────────
        if (type === 'all' || type === 'tour') {
            const tours = await prisma.tour.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { location: { contains: q, mode: 'insensitive' } },
                        { city: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    city: true,
                    location: true,
                    status: true,
                    startDate: true,
                    pax: true,
                    operator: {
                        select: {
                            profile: { select: { name: true } },
                        },
                    },
                },
            });

            results.tours = tours.map(t => ({
                id: t.id,
                title: t.title,
                city: t.city,
                location: t.location,
                status: t.status,
                startDate: t.startDate,
                pax: t.pax,
                operatorName: t.operator?.profile?.name || 'Unknown',
                type: 'tour',
            }));
        }

        // ── User Search (Admin only) ────────────────────────────
        if ((type === 'all' || type === 'user') && ['SUPER_ADMIN', 'ADMIN', 'OPS'].includes(session.user.role)) {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { email: { contains: q, mode: 'insensitive' } },
                        { profile: { name: { contains: q, mode: 'insensitive' } } },
                    ],
                },
                take: limit,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                    profile: { select: { name: true, photoUrl: true } },
                },
            });

            results.users = users.map(u => ({
                id: u.id,
                name: u.profile?.name || u.email?.split('@')[0],
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                avatar: u.profile?.photoUrl,
                type: 'user',
            }));
        }

        // ── City Search ─────────────────────────────────────────
        if (type === 'all' || type === 'city') {
            const cities = await prisma.city.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { nameLocal: { contains: q, mode: 'insensitive' } },
                        { region: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    nameLocal: true,
                    region: true,
                    country: true,
                },
            });

            results.cities = cities.map(c => ({
                id: c.id,
                name: c.name,
                nameLocal: c.nameLocal,
                region: c.region,
                country: c.country,
                type: 'city',
            }));
        }

        const totalResults = Object.values(results).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0);

        return NextResponse.json({
            success: true,
            query: q,
            totalResults,
            data: results,
        });

    } catch (error: any) {
        console.error('[search] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
