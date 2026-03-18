"use client";

import { useSession } from 'next-auth/react';
import { UserPlan } from '@/lib/plans';

/**
 * Hook to get current user's plan from session
 * Returns 'FREE' as default if not available
 */
export function useUserPlan(): { plan: UserPlan; isLoading: boolean } {
    const { data: session, status } = useSession();

    const isLoading = status === 'loading';
    const user = session?.user as any;
    const plan = (user?.plan as UserPlan) || 'FREE';

    return { plan, isLoading };
}

/**
 * Hook to check if user has access to a specific plan level
 */
export function useHasPlan(requiredPlan: UserPlan): boolean {
    const { plan } = useUserPlan();

    const planOrder: UserPlan[] = ['FREE', 'PRO', 'ELITE'];
    const currentIndex = planOrder.indexOf(plan);
    const requiredIndex = planOrder.indexOf(requiredPlan);

    return currentIndex >= requiredIndex;
}
