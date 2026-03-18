import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pricing
 * Public API - No authentication required
 * Returns active pricing for marketing page
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const roleType = searchParams.get('roleType');

        let whereClause: any = { active: true };

        if (roleType === 'OPERATOR' || roleType === 'GUIDE') {
            whereClause.roleType = roleType;
        }

        const pricing = await (prisma as any).planPricing.findMany({
            where: whereClause,
            select: {
                id: true,
                plan: true,
                roleType: true,
                price: true,
                currency: true,
                period: true,
                description: true,
                features: true,
                tourLimit: true,
            },
            orderBy: [
                { roleType: 'asc' },
                { price: 'asc' },
            ]
        });

        // Parse features JSON for each pricing
        const formattedPricing = pricing.map((p: any) => ({
            ...p,
            features: p.features ? JSON.parse(p.features) : [],
        }));

        // Group by roleType for easier frontend consumption
        const operatorPlans = formattedPricing.filter((p: any) => p.roleType === 'OPERATOR');
        const guidePlans = formattedPricing.filter((p: any) => p.roleType === 'GUIDE');

        return NextResponse.json({
            operatorPlans,
            guidePlans,
            allPlans: formattedPricing,
        });

    } catch (error) {
        console.error('Get public pricing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
