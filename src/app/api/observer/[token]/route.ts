import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/observer/[token]
 * 
 * Public endpoint — no auth required.
 * Returns observer dashboard data scoped to the token's type.
 * 
 * SECURITY:
 * - Token must be active and not expired
 * - Data is anonymized (no PII)
 * - Access is audited
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = await Promise.resolve(params);

        const observerToken = await prisma.observerToken.findUnique({
            where: { token },
        });

        if (!observerToken) {
            return NextResponse.json(
                { success: false, error: 'Observer link not found' },
                { status: 404 }
            );
        }

        if (!observerToken.isActive || observerToken.revokedAt) {
            return NextResponse.json(
                { success: false, error: 'This observer link has been revoked' },
                { status: 403 }
            );
        }

        if (new Date() > observerToken.expiresAt) {
            return NextResponse.json(
                { success: false, error: 'This observer link has expired' },
                { status: 410 }
            );
        }

        // Audit: increment access count
        prisma.observerToken.update({
            where: { id: observerToken.id },
            data: {
                accessCount: { increment: 1 },
                lastAccessedAt: new Date(),
            }
        }).catch(() => {});

        let data: any = {};

        if (observerToken.type === 'SYSTEM') {
            // Government / regulatory: anonymized system-wide metrics
            const [totalTours, statusCounts, openEmergencies] = await Promise.all([
                prisma.tour.count(),
                prisma.tour.groupBy({
                    by: ['status'],
                    _count: { id: true },
                }),
                prisma.emergencyReport.count({
                    where: { status: { in: ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS'] } }
                }),
            ]);

            const activeTours = statusCounts.find(s => s.status === 'IN_PROGRESS')?._count?.id || 0;
            const completedTours = statusCounts.find(s => s.status === 'COMPLETED')?._count?.id || 0;

            data = {
                totalTours,
                activeTours,
                completedTours,
                openSOS: openEmergencies,
                statusBreakdown: statusCounts.map(s => ({
                    status: s.status,
                    count: s._count.id,
                })),
            };

        } else if (observerToken.type === 'INVESTOR') {
            // Founder / investors: growth and revenue metrics
            const [totalUsers, totalTours, completedTours, revenue] = await Promise.all([
                prisma.user.count(),
                prisma.tour.count(),
                prisma.tour.count({ where: { status: 'COMPLETED' } }),
                prisma.platformRevenue.aggregate({ _sum: { amount: true } }),
            ]);

            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const [activeOperators, activeGuides, toursThisMonth] = await Promise.all([
                prisma.user.count({
                    where: { role: 'TOUR_OPERATOR', lastLogin: { gte: thirtyDaysAgo } }
                }),
                prisma.user.count({
                    where: { role: 'TOUR_GUIDE', lastLogin: { gte: thirtyDaysAgo } }
                }),
                prisma.tour.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                }),
            ]);

            data = {
                userGrowth: {
                    totalSignups: totalUsers,
                    active30d: {
                        operators: activeOperators,
                        guides: activeGuides,
                    },
                },
                tourVolume: {
                    total: totalTours,
                    completed: completedTours,
                    thisMonth: toursThisMonth,
                },
                revenue: {
                    totalGMV: revenue._sum.amount || 0,
                },
            };

        } else if (observerToken.type === 'PARTNER') {
            // Partner: specific operator performance
            const opId = observerToken.linkedOperatorId;
            if (!opId) {
                return NextResponse.json(
                    { success: false, error: 'No operator linked to this token' },
                    { status: 400 }
                );
            }

            const [totalTours, completed, cancelled, incidents, disputes] = await Promise.all([
                prisma.tour.count({ where: { operatorId: opId } }),
                prisma.tour.count({ where: { operatorId: opId, status: 'COMPLETED' } }),
                prisma.tour.count({ where: { operatorId: opId, status: 'CANCELLED' } }),
                prisma.emergencyReport.count({
                    where: { tour: { operatorId: opId } }
                }),
                prisma.dispute.count({
                    where: { tour: { operatorId: opId } }
                }),
            ]);

            const completionRate = totalTours > 0 ? Math.round((completed / totalTours) * 100) : 0;
            const cancellationRate = totalTours > 0 ? Math.round((cancelled / totalTours) * 100) : 0;

            data = {
                tourStats: {
                    totalTours,
                    completionRate,
                    cancellationRate,
                },
                safety: {
                    incidentsReported: incidents,
                    disputesReceived: disputes,
                },
                financial: {
                    totalPayoutsGenerated: 0, // Anonymized
                },
                recentFeedback: [],
            };
        }

        return NextResponse.json({
            success: true,
            data,
            meta: {
                type: observerToken.type,
                label: observerToken.label,
                expiresAt: observerToken.expiresAt.toISOString(),
            }
        });

    } catch (error: any) {
        console.error('[observer] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
