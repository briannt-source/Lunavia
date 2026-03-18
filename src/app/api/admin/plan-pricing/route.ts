import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentDomain } from '@/domain/payment/PaymentDomain';

export const dynamic = 'force-dynamic';
// Valid plans and role types
const VALID_PLANS = ['FREE', 'PRO', 'ELITE', 'ENTERPRISE', 'INTERN'];
const VALID_ROLE_TYPES = ['OPERATOR', 'GUIDE'];
const VALID_PERIODS = ['monthly', 'yearly'];

/**
 * GET /api/admin/plan-pricing
 * List all plan pricing entries
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        if (!['SUPER_ADMIN', 'FINANCE'].includes(user.role)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const roleType = searchParams.get('roleType');
        const activeOnly = searchParams.get('active') === 'true';

        let whereClause: any = {};
        if (roleType && VALID_ROLE_TYPES.includes(roleType)) {
            whereClause.roleType = roleType;
        }
        if (activeOnly) {
            whereClause.active = true;
        }

        const pricing = await (prisma as any).planPricing.findMany({
            where: whereClause,
            orderBy: [
                { roleType: 'asc' },
                { plan: 'asc' },
            ]
        });

        return NextResponse.json({
            pricing,
            count: pricing.length
        });

    } catch (error) {
        console.error('List plan pricing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/admin/plan-pricing
 * Create new plan pricing entry
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        if (!['SUPER_ADMIN', 'FINANCE'].includes(user.role)) {
            return NextResponse.json({ error: 'Only admins can create pricing' }, { status: 403 });
        }

        const body = await req.json();
        const { plan, roleType, price, currency, period, description, features, tourLimit } = body;

        // Validation
        if (!plan || !VALID_PLANS.includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan', validPlans: VALID_PLANS }, { status: 400 });
        }
        if (!roleType || !VALID_ROLE_TYPES.includes(roleType)) {
            return NextResponse.json({ error: 'Invalid roleType', validRoleTypes: VALID_ROLE_TYPES }, { status: 400 });
        }
        if (typeof price !== 'number' || price < 0) {
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
        }

        const validPeriod = period && VALID_PERIODS.includes(period) ? period : 'monthly';

        // Check for duplicate
        const existing = await (prisma as any).planPricing.findFirst({
            where: { plan, roleType, period: validPeriod }
        });
        if (existing) {
            return NextResponse.json({
                error: 'Pricing already exists',
                message: `${plan} for ${roleType} (${validPeriod}) already exists. Use PATCH to update.`
            }, { status: 409 });
        }

        const newPricing = await PaymentDomain.createPlanPricing({
            plan, roleType, price, currency: currency || 'VND',
            period: validPeriod, description, features, tourLimit,
            adminId: user.id,
        });

        return NextResponse.json({
            success: true,
            pricing: newPricing
        }, { status: 201 });

    } catch (error) {
        console.error('Create plan pricing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
