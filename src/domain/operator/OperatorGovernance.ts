// ══════════════════════════════════════════════════════════════════════
// Operator Governance — Single Source of Truth
// Vietnam tourism regulation-aware operator tier model
// ══════════════════════════════════════════════════════════════════════

export type OperatorCategory = 'LICENSED' | 'TRAVEL_AGENCY' | 'SOLE';
export type LicenseScope = 'DOMESTIC' | 'INBOUND' | 'OUTBOUND';
export type LegalTier = LicenseScope; // Alias for regulatory naming
export type AddressVisibility = 'PUBLIC' | 'VERIFIED_ONLY' | 'PRIVATE';
export type TourMarket = 'DOMESTIC' | 'INBOUND' | 'OUTBOUND';

export const OPERATOR_CATEGORIES: OperatorCategory[] = ['LICENSED', 'TRAVEL_AGENCY', 'SOLE'];
export const LICENSE_SCOPES: LicenseScope[] = ['DOMESTIC', 'INBOUND', 'OUTBOUND'];
export const TOUR_MARKETS: TourMarket[] = ['DOMESTIC', 'INBOUND', 'OUTBOUND'];
export const ADDRESS_VISIBILITIES: AddressVisibility[] = ['PUBLIC', 'VERIFIED_ONLY', 'PRIVATE'];

// ── Trust Ceiling ────────────────────────────────────────────────────
export const TRUST_MAX: Record<OperatorCategory, number> = {
    LICENSED: 100,
    TRAVEL_AGENCY: 85,
    SOLE: 70,
};

/**
 * Get the trust ceiling for a given operator category.
 * Falls back to SOLE (70) if category is unknown.
 */
export function getTrustMax(category: string | null | undefined): number {
    if (category && category in TRUST_MAX) {
        return TRUST_MAX[category as OperatorCategory];
    }
    return TRUST_MAX.SOLE; // Default: most restrictive
}

// ── Guide Trust Ceiling ──────────────────────────────────────────────
export type GuideCertification = 'MAIN_GUIDE' | 'SUPPORT_GUIDE' | 'INTERN';

export const GUIDE_TRUST_MAX: Record<GuideCertification, number> = {
    MAIN_GUIDE: 100,
    SUPPORT_GUIDE: 80,
    INTERN: 60,
};

export const GUIDE_CERTIFICATION_LABELS: Record<GuideCertification, { label: string; badge: string; notice: string }> = {
    MAIN_GUIDE: {
        label: 'Licensed Guide',
        badge: '✅',
        notice: 'This guide holds a professional Tour Guide License.',
    },
    SUPPORT_GUIDE: {
        label: 'Support Guide — No Tour Guide License',
        badge: '⚠️',
        notice: 'This guide does not hold a professional Tour Guide License. They may assist but cannot lead tours independently per regulations.',
    },
    INTERN: {
        label: 'Intern Guide',
        badge: '📘',
        notice: 'This is a trainee guide still building experience. Lower base trust score applies (max 60/100).',
    },
};

/**
 * Get the trust ceiling for a given guide certification level.
 */
export function getGuideTrustMax(certification: string | null | undefined): number {
    if (certification && certification in GUIDE_TRUST_MAX) {
        return GUIDE_TRUST_MAX[certification as GuideCertification];
    }
    return GUIDE_TRUST_MAX.SUPPORT_GUIDE; // Default: most restrictive non-intern
}

/**
 * Get display info for a guide's certification level.
 */
export function getGuideCertificationInfo(certification: string | null | undefined) {
    const cert = (certification && certification in GUIDE_CERTIFICATION_LABELS)
        ? certification as GuideCertification
        : 'SUPPORT_GUIDE';
    return GUIDE_CERTIFICATION_LABELS[cert];
}

// ── Compliance Level ─────────────────────────────────────────────────
export type ComplianceLevel = 'GOLD' | 'STANDARD' | 'PROBATION';
export const COMPLIANCE_LEVELS: ComplianceLevel[] = ['GOLD', 'STANDARD', 'PROBATION'];

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

/**
 * Compute compliance level from operator metrics.
 *   GOLD       = KYB approved + 10+ tours + <5% dispute rate + GREEN risk
 *   PROBATION  = RED risk OR >20% dispute rate
 *   STANDARD   = everything else
 */
export function computeComplianceLevel(params: {
    kybStatus: string;
    completedTours: number;
    disputeRate: number;
    riskLevel: RiskLevel;
}): ComplianceLevel {
    const { kybStatus, completedTours, disputeRate, riskLevel } = params;
    if (riskLevel === 'RED' || disputeRate > 0.2) return 'PROBATION';
    if (kybStatus === 'APPROVED' && completedTours >= 10 && disputeRate < 0.05 && riskLevel === 'GREEN') return 'GOLD';
    return 'STANDARD';
}

// ── Active Tour Limit ────────────────────────────────────────────────
/**
 * Apply category-based tour limit scaling on top of plan limit.
 *   LICENSED       → 100% of plan limit (no cap)
 *   TRAVEL_AGENCY  → 80% of plan limit (min 10)
 *   SOLE           → 60% of plan limit (min 5)
 *
 * This ensures paid plans still give meaningful value to unlicensed operators
 * while maintaining a trust differential with licensed ones.
 */
export function getCategoryTourLimit(
    category: string | null | undefined,
    planLimit: number | null
): number | null {
    const cat = (category && OPERATOR_CATEGORIES.includes(category as OperatorCategory))
        ? category as OperatorCategory
        : 'SOLE';

    if (cat === 'LICENSED') return planLimit;
    if (planLimit === null) return cat === 'TRAVEL_AGENCY' ? 9999 : 9999; // Unlimited stays unlimited

    if (cat === 'TRAVEL_AGENCY') return Math.max(10, Math.floor(planLimit * 0.8));
    return Math.max(5, Math.floor(planLimit * 0.6)); // SOLE
}

// ── Market Access Rules ──────────────────────────────────────────────
/**
 * Determine whether an operator can create a tour in a given market.
 *
 * Licensed operators:
 *   DOMESTIC  → DOMESTIC only
 *   INBOUND   → DOMESTIC + INBOUND
 *   OUTBOUND  → all markets
 *
 * Agency / Sole:
 *   Can create in any market while ALLOW_UNLICENSED_OPERATOR_CREATE = true,
 *   but receive no licensed badge, trust is capped, and lower matching priority.
 */
export function canAccessMarket(
    category: string | null | undefined,
    scope: string | null | undefined,
    market: TourMarket
): boolean {
    const cat = (category && OPERATOR_CATEGORIES.includes(category as OperatorCategory))
        ? category as OperatorCategory
        : 'SOLE';

    // Non-licensed operators can access all markets (gated by regulatory toggle separately)
    if (cat !== 'LICENSED') return true;

    // Licensed: scope-based access
    const licenseScope = (scope && LICENSE_SCOPES.includes(scope as LicenseScope))
        ? scope as LicenseScope
        : 'DOMESTIC';

    if (licenseScope === 'OUTBOUND') return true; // All markets
    if (licenseScope === 'INBOUND') return market !== 'OUTBOUND'; // DOMESTIC + INBOUND
    return market === 'DOMESTIC'; // DOMESTIC only
}

// ── Default Address Visibility ───────────────────────────────────────
export const DEFAULT_ADDRESS_VISIBILITY: Record<OperatorCategory, AddressVisibility> = {
    LICENSED: 'PUBLIC',
    TRAVEL_AGENCY: 'VERIFIED_ONLY',
    SOLE: 'PRIVATE',
};

/**
 * Get the default address visibility for a category.
 */
export function getDefaultAddressVisibility(category: string | null | undefined): AddressVisibility {
    if (category && category in DEFAULT_ADDRESS_VISIBILITY) {
        return DEFAULT_ADDRESS_VISIBILITY[category as OperatorCategory];
    }
    return 'PRIVATE';
}

// ── Profile Completeness ─────────────────────────────────────────────
export interface OperatorProfile {
    operatorCategory: string | null;
    roleMetadata?: string | null;
    kybStatus: string;
}

/**
 * Check if operator profile is complete enough to publish tours.
 * For verified operators (kybStatus APPROVED):
 *   - operatorCategory defaults to 'SOLE' if not set
 *   - roleMetadata business fields are recommended but not blocking
 * For unverified operators:
 *   - operatorCategory is required
 *   - operatorType, businessRegistration, tourLicense are required
 * Bio, avatar, and portfolio are NEVER required.
 */
export function isOperatorProfileComplete(profile: OperatorProfile): { complete: boolean; missing: string[] } {
    const missing: string[] = [];
    const isVerified = profile.kybStatus === 'APPROVED';

    // operatorCategory: default to SOLE for verified operators
    if (!profile.operatorCategory && !isVerified) {
        missing.push('operatorCategory');
    }

    // Parse roleMetadata to check business fields
    let meta: Record<string, any> = {};
    if (profile.roleMetadata) {
        try {
            meta = typeof profile.roleMetadata === 'string' ? JSON.parse(profile.roleMetadata) : profile.roleMetadata;
        } catch { /* ignore parse errors */ }
    }

    // Business fields are only strictly required for unverified operators
    // Verified operators have already passed external verification
    if (!isVerified) {
        if (!meta.operatorType) missing.push('operatorType');
        if (!meta.businessRegistrationNumber) missing.push('businessRegistration');
        if (!meta.tourLicenseNumber) missing.push('tourLicense');
    }

    return { complete: missing.length === 0, missing };
}

// ── Validation Helpers ───────────────────────────────────────────────
export function isValidOperatorCategory(value: string): value is OperatorCategory {
    return OPERATOR_CATEGORIES.includes(value as OperatorCategory);
}

export function isValidLicenseScope(value: string): value is LicenseScope {
    return LICENSE_SCOPES.includes(value as LicenseScope);
}

export function isValidTourMarket(value: string): value is TourMarket {
    return TOUR_MARKETS.includes(value as TourMarket);
}

export function isValidAddressVisibility(value: string): value is AddressVisibility {
    return ADDRESS_VISIBILITIES.includes(value as AddressVisibility);
}
