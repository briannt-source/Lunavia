export const PRICING_PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        features: ['Up to 3 Tours/Month', 'Basic Support', 'Community Access'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 49,
        currency: 'USD',
        features: ['Unlimited Tours', 'Priority Support', 'Advanced Analytics', 'Verified Badge'],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        currency: 'USD',
        features: ['Dedicated Account Manager', 'Custom API Access', 'SLA', 'White Labeling'],
    }
];

export async function getPricingPlans() {
    // In a real implementation this would fetch from prisma.pricingPlan.findMany()
    // For Phase 6 strict "No Schema Changes", we use this constant as the "DB Source of Truth" wrapper.
    return PRICING_PLANS;
}
