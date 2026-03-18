/**
 * Plan Definitions and Feature Gating
 *
 * Three product lines:
 *   MARKETPLACE — Open platform with guide discovery, escrow, SOS
 *   OPERATIONS  — Closed ecosystem, internal team only, no marketplace
 *   GUIDE       — For tour guides (Free or Pro)
 *
 * Plans:
 *   Marketplace: FREE → PRO → ELITE → ENTERPRISE
 *   Operations:  OPS_STARTER → OPS_BUSINESS → ENTERPRISE
 *   Guide:       GUIDE_FREE → GUIDE_PRO
 *   ENTERPRISE is shared — custom limits, contact sales
 */

// ── Product Lines ────────────────────────────────────────────────────

export type ProductLine = 'MARKETPLACE' | 'OPERATIONS';

// ── Plan Types ───────────────────────────────────────────────────────

export type UserPlan =
    | 'FREE'           // Marketplace — free tier
    | 'PRO'            // Marketplace — growing operators
    | 'ELITE'          // Marketplace — high-volume operators
    | 'OPS_STARTER'    // Operations — small teams
    | 'OPS_BUSINESS'   // Operations — medium teams
    | 'GUIDE_FREE'     // Guide — free tier (5% platform fee)
    | 'GUIDE_PRO'      // Guide — pro tier (2% platform fee)
    | 'ENTERPRISE';    // Either line — custom, contact sales

export const USER_PLANS: UserPlan[] = [
    'FREE', 'PRO', 'ELITE',
    'OPS_STARTER', 'OPS_BUSINESS',
    'GUIDE_FREE', 'GUIDE_PRO',
    'ENTERPRISE',
];

export const MARKETPLACE_PLANS: UserPlan[] = ['FREE', 'PRO', 'ELITE', 'ENTERPRISE'];
export const OPERATIONS_PLANS: UserPlan[] = ['OPS_STARTER', 'OPS_BUSINESS', 'ENTERPRISE'];
export const GUIDE_PLANS: UserPlan[] = ['GUIDE_FREE', 'GUIDE_PRO'];

// ── Helpers ──────────────────────────────────────────────────────────

export function getProductLine(plan: UserPlan): ProductLine {
    if (['OPS_STARTER', 'OPS_BUSINESS'].includes(plan)) return 'OPERATIONS';
    return 'MARKETPLACE'; // FREE, PRO, ELITE, ENTERPRISE default to marketplace
}

export function isMarketplacePlan(plan: UserPlan): boolean {
    return getProductLine(plan) === 'MARKETPLACE';
}

export function isOperationsPlan(plan: UserPlan): boolean {
    return ['OPS_STARTER', 'OPS_BUSINESS'].includes(plan);
}

export function isEnterprisePlan(plan: UserPlan): boolean {
    return plan === 'ENTERPRISE';
}

// ── Plan Pricing (VND) ───────────────────────────────────────────────

export type PlanDuration = 30 | 90 | 365;
export const PLAN_DURATIONS: PlanDuration[] = [30, 90, 365];

export const PLAN_PRICING: Partial<Record<UserPlan, Record<PlanDuration, number>>> = {
    // Marketplace (Operators) - Premium Platform Pricing (Includes Ops + Marketplace features)
    PRO:          { 30: 1_299_000, 90: 3_599_000,   365: 12_999_000 },
    ELITE:        { 30: 3_499_000, 90: 9_999_000,   365: 34_999_000 },
    // Operations (Operators) - Premium B2B Pricing
    OPS_STARTER:  { 30: 899_000,   90: 2_499_000, 365: 8_999_000 },
    OPS_BUSINESS: { 30: 2_499_000, 90: 6_999_000, 365: 24_999_000 },
    // Guide
    GUIDE_PRO:    { 30: 149_000, 90: 369_000,   365: 1_299_000 },
    // ENTERPRISE & GUIDE_FREE — no pricing entry (free / custom)
};

// ── Guide Platform Service Fees ─────────────────────────────────────
// Fee deducted from each guide payout to cover escrow + payment processing
export const GUIDE_PLATFORM_FEE: Record<string, number> = {
    GUIDE_FREE: 0.05, // 5%
    GUIDE_PRO:  0.02, // 2%
};

export function getGuidePlatformFeeRate(plan: UserPlan): number {
    return GUIDE_PLATFORM_FEE[plan] ?? 0.05; // Default to 5% for unknown plans
}

// ── Feature Definitions ──────────────────────────────────────────────

export type PlanFeature =
    | 'CREATE_TOUR'
    | 'MARKETPLACE_ACCESS'      // Guide discovery, search, applications
    | 'ADVANCED_FILTERS'
    | 'PRIORITY_VISIBILITY'
    | 'OPS_INSIGHTS'
    | 'SOS_BROADCAST'
    | 'COMMAND_CENTER'
    | 'TEAM_MANAGEMENT'
    | 'MULTI_GUIDE'
    | 'EXTERNAL_TRACKING'
    | 'TOUR_SEGMENTS_FULL'
    | 'VOUCHERS'
    | 'ESCROW_WALLET';          // Escrow payment system

// ── Plan Configuration ───────────────────────────────────────────────

export interface PlanConfig {
    displayName: string;
    productLine: ProductLine;
    maxActiveTours: number;        // No more null — everything capped
    maxTeamGuides: number;
    maxGuidesPerTour: number;
    maxSegmentsPerTour: number;
    features: PlanFeature[];
    description: string;
    commissionRate: string;        // Display label (e.g. "5%", "0%", "Custom")
}

export const PLAN_CONFIG: Record<UserPlan, PlanConfig> = {
    // ── MARKETPLACE ──────────────────────────────────────────────────
    FREE: {
        displayName: 'Free',
        productLine: 'MARKETPLACE',
        maxActiveTours: 10,
        maxTeamGuides: 5,
        maxGuidesPerTour: 2,
        maxSegmentsPerTour: 3,
        features: ['CREATE_TOUR', 'MARKETPLACE_ACCESS', 'ESCROW_WALLET'],
        description: 'Get started with the marketplace',
        commissionRate: '5%',
    },
    PRO: {
        displayName: 'Pro',
        productLine: 'MARKETPLACE',
        maxActiveTours: 50,
        maxTeamGuides: 20,
        maxGuidesPerTour: 5,
        maxSegmentsPerTour: 20,
        features: [
            'CREATE_TOUR', 'MARKETPLACE_ACCESS', 'ESCROW_WALLET',
            'ADVANCED_FILTERS', 'OPS_INSIGHTS',
            'SOS_BROADCAST', 'COMMAND_CENTER',
            'TEAM_MANAGEMENT', 'MULTI_GUIDE',
            'TOUR_SEGMENTS_FULL', 'VOUCHERS',
        ],
        description: 'For growing operations',
        commissionRate: '3%',
    },
    ELITE: {
        displayName: 'Elite',
        productLine: 'MARKETPLACE',
        maxActiveTours: 9999, // Unlimited
        maxTeamGuides: 100,
        maxGuidesPerTour: 10,
        maxSegmentsPerTour: 50,
        features: [
            'CREATE_TOUR', 'MARKETPLACE_ACCESS', 'ESCROW_WALLET',
            'ADVANCED_FILTERS', 'PRIORITY_VISIBILITY', 'OPS_INSIGHTS',
            'SOS_BROADCAST', 'COMMAND_CENTER',
            'TEAM_MANAGEMENT', 'MULTI_GUIDE',
            'EXTERNAL_TRACKING', 'TOUR_SEGMENTS_FULL', 'VOUCHERS',
        ],
        description: 'For high-volume operations',
        commissionRate: '1.5%',
    },

    // ── OPERATIONS ───────────────────────────────────────────────────
    OPS_STARTER: {
        displayName: 'Ops Starter',
        productLine: 'OPERATIONS',
        maxActiveTours: 30,
        maxTeamGuides: 15,
        maxGuidesPerTour: 5,
        maxSegmentsPerTour: 20,
        features: [
            'CREATE_TOUR',
            'COMMAND_CENTER', 'TEAM_MANAGEMENT', 'MULTI_GUIDE',
            'TOUR_SEGMENTS_FULL',
        ],
        description: 'Internal team management for small operators',
        commissionRate: '0%',
    },
    OPS_BUSINESS: {
        displayName: 'Ops Business',
        productLine: 'OPERATIONS',
        maxActiveTours: 100,
        maxTeamGuides: 50,
        maxGuidesPerTour: 10,
        maxSegmentsPerTour: 50,
        features: [
            'CREATE_TOUR',
            'COMMAND_CENTER', 'TEAM_MANAGEMENT', 'MULTI_GUIDE',
            'OPS_INSIGHTS', 'EXTERNAL_TRACKING',
            'TOUR_SEGMENTS_FULL', 'VOUCHERS',
        ],
        description: 'Full operations suite for established companies',
        commissionRate: '0%',
    },

    // ── ENTERPRISE (shared) ──────────────────────────────────────────
    ENTERPRISE: {
        displayName: 'Enterprise',
        productLine: 'MARKETPLACE', // Default — actual line stored on user
        maxActiveTours: 9999,
        maxTeamGuides: 9999,
        maxGuidesPerTour: 99,
        maxSegmentsPerTour: 999,
        features: [
            'CREATE_TOUR', 'MARKETPLACE_ACCESS', 'ESCROW_WALLET',
            'ADVANCED_FILTERS', 'PRIORITY_VISIBILITY', 'OPS_INSIGHTS',
            'SOS_BROADCAST', 'COMMAND_CENTER',
            'TEAM_MANAGEMENT', 'MULTI_GUIDE',
            'EXTERNAL_TRACKING', 'TOUR_SEGMENTS_FULL', 'VOUCHERS',
        ],
        description: 'Custom package — contact sales',
        commissionRate: 'Custom',
    },

    // ── GUIDE ────────────────────────────────────────────────────────
    GUIDE_FREE: {
        displayName: 'Guide Free',
        productLine: 'MARKETPLACE',
        maxActiveTours: 999,     // Guides don't create tours — N/A
        maxTeamGuides: 0,
        maxGuidesPerTour: 0,
        maxSegmentsPerTour: 0,
        features: ['MARKETPLACE_ACCESS'],
        description: 'Free — 5% platform service fee on payouts',
        commissionRate: '5% platform fee',
    },
    GUIDE_PRO: {
        displayName: 'Guide Pro',
        productLine: 'MARKETPLACE',
        maxActiveTours: 999,
        maxTeamGuides: 0,
        maxGuidesPerTour: 0,
        maxSegmentsPerTour: 0,
        features: ['MARKETPLACE_ACCESS', 'PRIORITY_VISIBILITY', 'OPS_INSIGHTS'],
        description: 'Pro — 2% platform service fee, priority matching, verified badge',
        commissionRate: '2% platform fee',
    },
};

// ── Feature Display Info ─────────────────────────────────────────────

export const FEATURE_DISPLAY: Record<PlanFeature, {
    name: string;
    description: string;
}> = {
    CREATE_TOUR: {
        name: 'Create Tours',
        description: 'Create and manage tour requests',
    },
    MARKETPLACE_ACCESS: {
        name: 'Guide Marketplace',
        description: 'Discover and hire guides from the open marketplace',
    },
    ADVANCED_FILTERS: {
        name: 'Advanced Filters',
        description: 'Filter guides by skills, ratings, and more',
    },
    PRIORITY_VISIBILITY: {
        name: 'Priority Visibility',
        description: 'Get featured placement in guide searches',
    },
    OPS_INSIGHTS: {
        name: 'Operations Insights',
        description: 'Access detailed analytics and reports',
    },
    SOS_BROADCAST: {
        name: 'SOS Guide Broadcast',
        description: 'Urgently find replacement guides via broadcast',
    },
    COMMAND_CENTER: {
        name: 'Command Center',
        description: 'Live real-time tour monitoring dashboard',
    },
    TEAM_MANAGEMENT: {
        name: 'Team Management',
        description: 'Invite and manage in-house guide team',
    },
    MULTI_GUIDE: {
        name: 'Multi-Guide Teams',
        description: 'Assign multiple guides per tour',
    },
    EXTERNAL_TRACKING: {
        name: 'External Tracking',
        description: 'Share live tour status with partner agencies',
    },
    TOUR_SEGMENTS_FULL: {
        name: 'Full Tour Segments',
        description: 'Unlimited segments with check-in tracking',
    },
    VOUCHERS: {
        name: 'Voucher System',
        description: 'Create and manage promotional vouchers',
    },
    ESCROW_WALLET: {
        name: 'Escrow & Wallet',
        description: 'Secure payment escrow for guide transactions',
    },
};

// ── Core Functions ───────────────────────────────────────────────────

/**
 * Check if a plan has access to a specific feature
 */
export function canAccessFeature(plan: UserPlan, feature: PlanFeature): boolean {
    return PLAN_CONFIG[plan].features.includes(feature);
}

/**
 * Get max active tours for a plan
 */
export function getMaxActiveTours(plan: UserPlan): number | null {
    const max = PLAN_CONFIG[plan].maxActiveTours;
    return max >= 9999 ? null : max; // Enterprise = effectively unlimited
}

/**
 * Get max team guides for a plan
 */
export function getMaxTeamGuides(plan: UserPlan): number | null {
    const max = PLAN_CONFIG[plan].maxTeamGuides;
    return max >= 9999 ? null : max;
}

/**
 * Get max guides per tour for a plan
 */
export function getMaxGuidesPerTour(plan: UserPlan): number {
    return PLAN_CONFIG[plan].maxGuidesPerTour;
}

/**
 * Check if a plan has reached its tour limit
 */
export function hasReachedTourLimit(plan: UserPlan, currentTours: number): boolean {
    const max = getMaxActiveTours(plan);
    if (max === null) return false;
    return currentTours >= max;
}

/**
 * Get minimum plan required for a feature
 */
export function getMinPlanForFeature(feature: PlanFeature): UserPlan {
    for (const plan of USER_PLANS) {
        if (canAccessFeature(plan, feature)) {
            return plan;
        }
    }
    return 'ENTERPRISE';
}

/**
 * Validate if a string is a valid plan
 */
export function isValidPlan(plan: string): plan is UserPlan {
    return USER_PLANS.includes(plan as UserPlan);
}

/**
 * Get the next upgrade plan for a given plan
 */
export function getUpgradePath(plan: UserPlan): UserPlan | null {
    switch (plan) {
        case 'FREE': return 'PRO';
        case 'PRO': return 'ELITE';
        case 'ELITE': return 'ENTERPRISE';
        case 'OPS_STARTER': return 'OPS_BUSINESS';
        case 'OPS_BUSINESS': return 'ENTERPRISE';
        case 'ENTERPRISE': return null;
        default: return null;
    }
}

// ── Plan Expiry ──────────────────────────────────────────────────────

export interface PlanStatus {
    storedPlan: UserPlan;
    effectivePlan: UserPlan;
    isExpired: boolean;
    expiresAt: Date | null;
    expiredAt?: Date;
}

/**
 * Check if a paid plan has expired
 * Free-tier plans (FREE, GUIDE_FREE) never expire
 */
export function isPlanExpired(
    plan: UserPlan,
    planExpiresAt: Date | null | undefined
): boolean {
    if (plan === 'FREE' || plan === 'GUIDE_FREE') return false;
    if (!planExpiresAt) return false;
    return new Date(planExpiresAt) < new Date();
}

/**
 * Get the effective plan considering expiry.
 *
 * Fallback chains:
 *   Marketplace operator: PRO/ELITE → FREE
 *   Operations operator:  OPS_BUSINESS → OPS_STARTER; OPS_STARTER → FREE (locked)
 *   Guide:                GUIDE_PRO → GUIDE_FREE
 */
export function getEffectivePlan(
    storedPlan: UserPlan,
    planExpiresAt: Date | null | undefined
): UserPlan {
    if (!isPlanExpired(storedPlan, planExpiresAt)) return storedPlan;

    // Expired — determine fallback
    if (storedPlan === 'OPS_BUSINESS') return 'OPS_STARTER';
    if (storedPlan === 'OPS_STARTER') return 'FREE'; // Trial expired → locked (no create tour)
    if (storedPlan === 'GUIDE_PRO') return 'GUIDE_FREE';
    return 'FREE'; // PRO, ELITE → FREE
}

/**
 * Get full plan status including expiry info
 */
export function getPlanStatus(
    storedPlan: UserPlan,
    planExpiresAt: Date | null | undefined
): PlanStatus {
    const isExpired = isPlanExpired(storedPlan, planExpiresAt);
    const fallback = isOperationsPlan(storedPlan) ? 'OPS_STARTER' : 'FREE';

    return {
        storedPlan,
        effectivePlan: isExpired ? fallback : storedPlan,
        isExpired,
        expiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
        ...(isExpired && planExpiresAt ? { expiredAt: new Date(planExpiresAt) } : {})
    };
}

/**
 * Check feature access considering expiry
 */
export function canAccessFeatureWithExpiry(
    storedPlan: UserPlan,
    planExpiresAt: Date | null | undefined,
    feature: PlanFeature
): boolean {
    const effectivePlan = getEffectivePlan(storedPlan, planExpiresAt);
    return canAccessFeature(effectivePlan, feature);
}

/**
 * Format expiry date for display
 */
export function formatPlanExpiryDate(expiresAt: Date | null | undefined): string {
    if (!expiresAt) return 'No expiry';
    return new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
