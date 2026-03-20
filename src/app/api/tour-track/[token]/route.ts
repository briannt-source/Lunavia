import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tour-track/[token]
 * 
 * Public endpoint — no auth required.
 * Returns tour tracking data for external partners.
 * 
 * SECURITY:
 * - NO GPS data (latitude/longitude) is ever exposed
 * - Only progress, timeline, itinerary, and basic tour info
 * - Token must be active and not expired
 * - Access count is incremented for audit
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = await Promise.resolve(params);

        // Find the tracking token
        const trackingToken = await prisma.tourTrackingToken.findUnique({
            where: { token },
            include: {
                tour: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        startDate: true,
                        endDate: true,
                        city: true,
                        location: true,
                        language: true,
                        pax: true,
                        operatorId: true,
                        operator: {
                            select: {
                                profile: { select: { name: true } },
                                email: true,
                            }
                        },
                        assignedGuideId: true,
                        assignedGuide: {
                            select: {
                                profile: { select: { name: true, photoUrl: true } },
                            }
                        },
                    }
                }
            }
        });

        if (!trackingToken) {
            return NextResponse.json(
                { success: false, error: 'Tracking link not found or expired' },
                { status: 404 }
            );
        }

        // Check if active and not expired
        if (!trackingToken.isActive || trackingToken.revokedAt) {
            return NextResponse.json(
                { success: false, error: 'This tracking link has been revoked' },
                { status: 403 }
            );
        }

        if (new Date() > trackingToken.expiresAt) {
            return NextResponse.json(
                { success: false, error: 'This tracking link has expired' },
                { status: 410 }
            );
        }

        const tour = trackingToken.tour;

        // Increment access count (fire-and-forget)
        prisma.tourTrackingToken.update({
            where: { id: trackingToken.id },
            data: {
                accessCount: { increment: 1 },
                lastAccessedAt: new Date(),
            }
        }).catch(() => {}); // Don't fail the request if audit update fails

        // Calculate progress
        const now = new Date();
        const start = new Date(tour.startDate);
        const end = new Date(tour.endDate || tour.startDate);
        let percentage = 0;
        let phase = tour.status;

        if (tour.status === 'COMPLETED') {
            percentage = 100;
        } else if (tour.status === 'IN_PROGRESS') {
            const total = end.getTime() - start.getTime();
            const elapsed = now.getTime() - start.getTime();
            percentage = total > 0 ? Math.min(Math.round((elapsed / total) * 100), 99) : 50;
        } else if (tour.status === 'CONFIRMED' || tour.status === 'ASSIGNED') {
            percentage = 0;
        }

        const phaseLabels: Record<string, string> = {
            'DRAFT': 'Preparing',
            'PUBLISHED': 'Open for guides',
            'ASSIGNED': 'Guide assigned',
            'CONFIRMED': 'Confirmed',
            'IN_PROGRESS': 'Tour in progress',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
        };

        const data = {
            tour: {
                id: tour.id,
                title: tour.title,
                status: tour.status,
                startTime: tour.startDate,
                endTime: tour.endDate || tour.startDate,
                location: tour.location || tour.city,
                province: tour.city,
                language: tour.language,
                groupSize: tour.pax,
                operatorName: tour.operator?.profile?.name || tour.operator?.email?.split('@')[0] || 'Operator',
            },
            guide: tour.assignedGuide ? {
                name: tour.assignedGuide.profile?.name || 'Guide',
                avatarUrl: tour.assignedGuide.profile?.photoUrl || null,
            } : null,
            segments: [], // Tour segments/itinerary (can be populated if available)
            timeline: [], // Execution events (can be populated)
            progress: {
                percentage,
                label: phaseLabels[tour.status] || tour.status,
                phase: tour.status,
            },
            agencyName: trackingToken.agencyName || 'Partner',
            expiresAt: trackingToken.expiresAt.toISOString(),
        };

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('[tour-track] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
