import { prisma } from '@/lib/prisma';

/**
 * Plan Quota System
 *
 * Operator Limits (concurrent active tours):
 *   FREE: 10 | PRO: 50 | ELITE: Unlimited
 *   OPS_STARTER: 30 | OPS_BUSINESS: 100 | ENTERPRISE: Unlimited
 *
 * Guide Limits (per month):
 *   GUIDE_FREE: 10 applications | GUIDE_PRO: Unlimited
 *
 * NOTE: The primary enforcement for operator tour limits happens in
 * POST /api/requests (route.ts) via PLAN_CONFIG.maxActiveTours + getCategoryTourLimit.
 * This module provides the quota check API used by the /api/plan/quota info endpoint.
 */

export interface QuotaResult {
    allowed: boolean;
    currentUsage: number;
    limit: number;
    plan: string;
    remainingQuota: number;
    message?: string;
}

/**
 * Check operator quota for creating tours.
 * Counts currently active tours (concurrent), aligned with route.ts enforcement.
 */
export async function checkOperatorQuota(userId: string): Promise<QuotaResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, role: { select: { name: true } } }
    });

    if (!user || user.role.name !== 'TOUR_OPERATOR') {
        return {
            allowed: false,
            currentUsage: 0,
            limit: 0,
            plan: 'NONE',
            remainingQuota: 0,
            message: 'Invalid user or not an operator'
        };
    }

    const plan = user.plan || 'FREE';

    // Get limit from PlanPricing (fallback to defaults)
    const pricing = await (prisma as any).planPricing.findFirst({
        where: { plan, roleType: 'OPERATOR', active: true }
    });

    const limit = pricing?.tourLimit ?? getPlanLimitDefault(plan);

    // Unlimited plans
    if (limit === -1) {
        return {
            allowed: true,
            currentUsage: 0,
            limit: -1,
            plan,
            remainingQuota: -1,
            message: 'Unlimited quota'
        };
    }

    // Count currently active tours (matches route.ts enforcement)
    const currentUsage = await prisma.serviceRequest.count({
        where: {
            operatorId: userId,
            status: { in: ['DRAFT', 'PUBLISHED', 'OPEN', 'OFFERED', 'IN_PROGRESS'] }
        }
    });

    const allowed = currentUsage < limit;
    const remainingQuota = Math.max(0, limit - currentUsage);

    return {
        allowed,
        currentUsage,
        limit,
        plan,
        remainingQuota,
        message: allowed
            ? `${remainingQuota} active tour slot(s) remaining`
            : `Active tour limit of ${limit} reached. Upgrade your plan for more.`
    };
}

// Get start of current month
function getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Check guide quota for applying to tours
 * GUIDE_FREE: 10 per month
 * GUIDE_PRO: Unlimited
 */
export async function checkGuideQuota(userId: string): Promise<QuotaResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, role: { select: { name: true } } }
    });

    if (!user || user.role.name !== 'TOUR_GUIDE') {
        return {
            allowed: false,
            currentUsage: 0,
            limit: 0,
            plan: 'NONE',
            remainingQuota: 0,
            message: 'Invalid user or not a guide'
        };
    }

    const plan = user.plan || 'GUIDE_FREE';

    // Get limit from PlanPricing (fallback to defaults)
    const pricing = await (prisma as any).planPricing.findFirst({
        where: { plan, roleType: 'GUIDE', active: true }
    });

    const limit = pricing?.tourLimit ?? getPlanLimitDefault(plan);

    // Unlimited plans (GUIDE_PRO)
    if (limit === -1) {
        return {
            allowed: true,
            currentUsage: 0,
            limit: -1,
            plan,
            remainingQuota: -1,
            message: 'Unlimited applications'
        };
    }

    // Count applications this MONTH
    const monthStart = getMonthStart();
    const currentUsage = await prisma.guideApplication.count({
        where: {
            guideId: userId,
            createdAt: { gte: monthStart },
            status: { notIn: ['REJECTED', 'WITHDRAWN'] }
        }
    });

    const allowed = currentUsage < limit;
    const remainingQuota = Math.max(0, limit - currentUsage);

    return {
        allowed,
        currentUsage,
        limit,
        plan,
        remainingQuota,
        message: allowed
            ? `${remainingQuota} application(s) remaining this month`
            : `Monthly limit of ${limit} applications reached. Upgrade to Pro for unlimited applications.`
    };
}

/**
 * Default limits if PlanPricing not found.
 * Operator: concurrent active tours. Guide: monthly applications.
 */
function getPlanLimitDefault(plan: string): number {
    switch (plan) {
        // Operator plans (concurrent active tours)
        case 'FREE': return 10;
        case 'PRO': return 50;
        case 'OPS_STARTER': return 30;
        case 'OPS_BUSINESS': return 100;
        
        // Guide plans (monthly applications)
        case 'GUIDE_FREE': return 10;
        case 'GUIDE_PRO': return -1;
        
        // Unlimited
        case 'ELITE': return -1;
        case 'ENTERPRISE': return -1;
        default: return 10;
    }
}

/**
 * Check if a guide can receive payment based on their guideType.
 * Interns cannot receive direct payment — their compensation is handled
 * by the operator internally.
 */
export function canReceivePayment(guideType: string | null | undefined): boolean {
    return guideType !== 'INTERN';
}

/**
 * Check if plan is Enterprise (internal only, no marketplace)
 */
export function isEnterprisePlan(plan: string): boolean {
    return plan === 'ENTERPRISE';
}

