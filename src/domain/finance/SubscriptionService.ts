import { prisma } from '@/lib/prisma';
import { PlanUpgradeRequest, User } from '@prisma/client';
import { executeSimpleMutation } from '@/domain/governance/executeSimpleMutation';
import {
    NotificationDomain,
    NotificationType,
    getDefaultTargetUrl,
    withRouteDomain,
} from '@/domain/notification/NotificationService';
import { AUDIT_ACTIONS } from '@/domain/governance/AuditService';

// Hardcoded for now, matches frontend pricing page
export const PLANS = ['FREE', 'PRO', 'ELITE'];
export const PLAN_PRICES: Record<string, number> = {
    FREE: 0,
    PRO: 499999,
    ELITE: 999999,
};

export class SubscriptionService {
    /**
     * Request a plan upgrade.
     * Validates eligibility and creates request.
     * Triggers notifications and audit logs.
     */
    static async requestUpgrade(
        userId: string,
        requestedPlan: string,
        price: number,
    ): Promise<PlanUpgradeRequest> {
        // 1. Validation
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { planUpgradeRequests: { where: { status: 'PENDING' } } },
        });

        if (!user) throw new Error('User not found');

        // Check pending requests
        if (user.planUpgradeRequests.length > 0) {
            throw new Error('You already have a pending upgrade request.');
        }

        // Check downgrade/lateral
        const currentPlanIndex = PLANS.indexOf(user.plan.toUpperCase());
        const requestedPlanIndex = PLANS.indexOf(requestedPlan.toUpperCase());

        if (requestedPlanIndex === -1) throw new Error('Invalid plan requested');
        if (requestedPlanIndex <= currentPlanIndex) {
            throw new Error('Cannot downgrade or request same plan via upgrade flow.');
        }

        // Check suspension
        if (user.accountStatus !== 'ACTIVE') {
            throw new Error('Account is not active.');
        }

        // 2. Transactional Creation via kernel
        return executeSimpleMutation({
            entityName: 'PlanUpgradeRequest',
            actorId: userId,
            actorRole: 'USER',
            auditAction: AUDIT_ACTIONS.PLAN_CHANGED_REQUESTED,
            auditBefore: { plan: user.plan },
            auditAfter: (r: PlanUpgradeRequest) => ({ requestedPlan: r.requestedPlan, status: 'PENDING' }),
            metadata: { price },
            atomicMutation: async (tx) => {
                return tx.planUpgradeRequest.create({
                    data: {
                        userId,
                        currentPlan: user.plan,
                        requestedPlan,
                        price,
                        status: 'PENDING',
                    },
                });
            },
            notification: async () => {
                try {
                    const admin = await prisma.user.findFirst({
                        where: { role: { name: 'SUPER_ADMIN' } }
                    });

                    if (admin) {
                        await withRouteDomain(NotificationDomain.REVENUE).create({
                            userId: admin.id,
                            targetUrl: getDefaultTargetUrl(NotificationDomain.REVENUE),
                            type: NotificationType.PLAN_UPGRADE_REQUESTED,
                            title: 'New Plan Upgrade Request',
                            message: `User ${user.email} requested upgrade to ${requestedPlan}`,
                        });
                    }
                } catch (error) {
                    console.error('[SubscriptionService] Notification failed', error);
                }
            },
        });
    }

    /**
     * Get upgrade history for a user
     */
    static async getUpgradeHistory(userId: string) {
        return prisma.subscriptionPaymentRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get current subscription details
     */
    static async getSubscriptionDetails(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                plan: true,
                planStartAt: true,
                planExpiresAt: true,
                subscriptionPayments: {
                    where: { status: 'PENDING' },
                    take: 1,
                }
            }
        });

        if (!user) return null;

        // Map it back to the expected `planUpgradeRequests` prop for backward compatibility
        return {
            ...user,
            planUpgradeRequests: user.subscriptionPayments
        };
    }
}
