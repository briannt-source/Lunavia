import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/tours/[id]/share-link
 * 
 * Creates a tracking token for external partners.
 * 
 * SECURITY:
 * - Only the tour's operator can create tracking links
 * - Default expiry: tour end date + 24 hours
 * - Max 5 active links per tour (prevent abuse)
 * - Operator must be verified
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: tourId } = await Promise.resolve(params);
        const body = await req.json();
        const { agencyName, expiresInHours } = body;

        // Verify tour exists and user is the operator
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: {
                id: true,
                operatorId: true,
                title: true,
                endDate: true,
                startDate: true,
                status: true,
            }
        });

        if (!tour) {
            return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
        }

        if (tour.operatorId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Only the tour operator can create tracking links' },
                { status: 403 }
            );
        }

        // Check active link count (max 5 per tour)
        const activeLinks = await prisma.tourTrackingToken.count({
            where: {
                tourId,
                isActive: true,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            }
        });

        if (activeLinks >= 5) {
            return NextResponse.json(
                { success: false, error: 'Maximum 5 active tracking links per tour. Revoke an existing link first.' },
                { status: 429 }
            );
        }

        // Calculate expiry — default: tour end + 24h, or custom
        const defaultExpiry = new Date(tour.endDate || tour.startDate);
        defaultExpiry.setHours(defaultExpiry.getHours() + 24);

        let expiresAt = defaultExpiry;
        if (expiresInHours && typeof expiresInHours === 'number') {
            const custom = new Date();
            custom.setHours(custom.getHours() + Math.min(expiresInHours, 720)); // Max 30 days
            expiresAt = custom;
        }

        // Create token
        const trackingToken = await prisma.tourTrackingToken.create({
            data: {
                tourId,
                createdById: session.user.id,
                agencyName: agencyName || null,
                expiresAt,
            }
        });

        const trackingUrl = `${process.env.NEXTAUTH_URL || ''}/tour-track/${trackingToken.token}`;

        return NextResponse.json({
            success: true,
            data: {
                id: trackingToken.id,
                token: trackingToken.token,
                url: trackingUrl,
                agencyName: trackingToken.agencyName,
                expiresAt: trackingToken.expiresAt.toISOString(),
            }
        });

    } catch (error: any) {
        console.error('[share-link] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tours/[id]/share-link
 * 
 * Lists all tracking tokens for a tour.
 * Only the operator of the tour can see them.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: tourId } = await Promise.resolve(params);

        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { operatorId: true }
        });

        if (!tour || tour.operatorId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const tokens = await prisma.tourTrackingToken.findMany({
            where: { tourId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                token: true,
                agencyName: true,
                expiresAt: true,
                isActive: true,
                revokedAt: true,
                accessCount: true,
                lastAccessedAt: true,
                createdAt: true,
            }
        });

        const baseUrl = process.env.NEXTAUTH_URL || '';
        const data = tokens.map(t => ({
            ...t,
            url: `${baseUrl}/tour-track/${t.token}`,
            isExpired: new Date() > t.expiresAt,
        }));

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('[share-link-list] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/tours/[id]/share-link
 * 
 * Revoke a tracking token. Body: { tokenId: string }
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: tourId } = await Promise.resolve(params);
        const body = await req.json();
        const { tokenId } = body;

        if (!tokenId) {
            return NextResponse.json({ success: false, error: 'tokenId required' }, { status: 400 });
        }

        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { operatorId: true }
        });

        if (!tour || tour.operatorId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        await prisma.tourTrackingToken.update({
            where: { id: tokenId },
            data: {
                isActive: false,
                revokedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[share-link-revoke] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
