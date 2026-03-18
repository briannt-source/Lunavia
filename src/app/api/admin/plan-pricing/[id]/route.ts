import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentDomain } from '@/domain/payment/PaymentDomain';

export const dynamic = 'force-dynamic';
/**
 * GET /api/admin/plan-pricing/[id]
 * Get single pricing entry
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        if (!['SUPER_ADMIN', 'FINANCE'].includes(user.role)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const pricing = await (prisma as any).planPricing.findUnique({
            where: { id: params.id }
        });

        if (!pricing) {
            return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
        }

        return NextResponse.json({ pricing });

    } catch (error) {
        console.error('Get plan pricing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/plan-pricing/[id]
 * Update plan pricing
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        if (!['SUPER_ADMIN', 'FINANCE'].includes(user.role)) {
            return NextResponse.json({ error: 'Only admins can update pricing' }, { status: 403 });
        }

        const existing = await (prisma as any).planPricing.findUnique({
            where: { id: params.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
        }

        const body = await req.json();
        const { price, currency, description, features, tourLimit, active } = body;

        const updateData: any = {};

        if (typeof price === 'number' && price >= 0) {
            updateData.price = price;
        }
        if (currency && typeof currency === 'string') {
            updateData.currency = currency;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (features !== undefined) {
            updateData.features = Array.isArray(features) ? JSON.stringify(features) : features;
        }
        if (typeof tourLimit === 'number') {
            updateData.tourLimit = tourLimit;
        }
        if (typeof active === 'boolean') {
            updateData.active = active;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const updated = await PaymentDomain.updatePlanPricing({
            pricingId: params.id,
            updateData,
            adminId: user.id,
            existingPlan: existing.plan,
            existingRoleType: existing.roleType,
        });

        return NextResponse.json({
            success: true,
            pricing: updated
        });

    } catch (error) {
        console.error('Update plan pricing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/plan-pricing/[id]
 * Soft delete (deactivate) pricing
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        if (!['SUPER_ADMIN', 'FINANCE'].includes(user.role)) {
            return NextResponse.json({ error: 'Only admins can delete pricing' }, { status: 403 });
        }

        const existing = await (prisma as any).planPricing.findUnique({
            where: { id: params.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
        }

        // Soft delete - just deactivate
        await PaymentDomain.deactivatePlanPricing(params.id, user.id, existing.plan, existing.roleType);

        return NextResponse.json({
            success: true,
            message: 'Pricing deactivated'
        });

    } catch (error) {
        console.error('Delete plan pricing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
