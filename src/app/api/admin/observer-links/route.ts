import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'OPS'];

/**
 * POST /api/admin/observer-links
 * 
 * Admin creates an observer token.
 * Body: { type: "SYSTEM"|"INVESTOR"|"PARTNER", label: string, linkedOperatorId?: string, expiresInDays?: number }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const { type, label, linkedOperatorId, expiresInDays = 90 } = body;

        if (!type || !label) {
            return NextResponse.json({ success: false, error: 'type and label required' }, { status: 400 });
        }

        if (!['SYSTEM', 'INVESTOR', 'PARTNER'].includes(type)) {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        if (type === 'PARTNER' && !linkedOperatorId) {
            return NextResponse.json(
                { success: false, error: 'PARTNER type requires linkedOperatorId' },
                { status: 400 }
            );
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + Math.min(expiresInDays, 365)); // Max 1 year

        const token = await prisma.observerToken.create({
            data: {
                type,
                label,
                createdById: session.user.id,
                linkedOperatorId: linkedOperatorId || null,
                expiresAt,
            }
        });

        const baseUrl = process.env.NEXTAUTH_URL || '';
        return NextResponse.json({
            success: true,
            data: {
                id: token.id,
                token: token.token,
                url: `${baseUrl}/observer/${token.token}`,
                type: token.type,
                label: token.label,
                expiresAt: token.expiresAt.toISOString(),
            }
        });

    } catch (error: any) {
        console.error('[admin-observer-links] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/admin/observer-links
 * Lists all observer tokens (admin only).
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const tokens = await prisma.observerToken.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                token: true,
                type: true,
                label: true,
                linkedOperatorId: true,
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
            url: `${baseUrl}/observer/${t.token}`,
            isExpired: new Date() > t.expiresAt,
        }));

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/observer-links
 * Revoke an observer token. Body: { tokenId: string }
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const { tokenId } = body;

        if (!tokenId) {
            return NextResponse.json({ success: false, error: 'tokenId required' }, { status: 400 });
        }

        await prisma.observerToken.update({
            where: { id: tokenId },
            data: { isActive: false, revokedAt: new Date() },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
