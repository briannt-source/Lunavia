// Canonical role definitions — single source of truth
// Schema: User.role field (via Role table)
// Seeded: prisma/seed.js (8 canonical roles — CS merged into OPS)
// Assigned at signup: TOUR_OPERATOR | TOUR_GUIDE

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    OPS: 'OPS',
    FINANCE: 'FINANCE',
    KYC_ANALYST: 'KYC_ANALYST',
    OBSERVER: 'OBSERVER',
    TOUR_OPERATOR: 'TOUR_OPERATOR',
    TOUR_GUIDE: 'TOUR_GUIDE',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Role groups for access control
export const ADMIN_ROLES: readonly string[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPS, ROLES.FINANCE];
export const FINANCE_ROLES: readonly string[] = [ROLES.SUPER_ADMIN, ROLES.FINANCE];
export const OPS_ROLES: readonly string[] = [ROLES.SUPER_ADMIN, ROLES.OPS];
export const CONTENT_ADMIN_ROLES: readonly string[] = [ROLES.SUPER_ADMIN, ROLES.OPS];
export const KYC_ROLES: readonly string[] = [ROLES.SUPER_ADMIN, ROLES.KYC_ANALYST];

export function isAdminRole(role: string): boolean {
    return ADMIN_ROLES.includes(role);
}
