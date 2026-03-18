// ══════════════════════════════════════════════════════════════════════
// Canonical Permission Registry — Single Source of Truth
// ══════════════════════════════════════════════════════════════════════
// All permission codes used in the system MUST be defined here.
// Guards, API routes, and the seed file all reference this object.
// Adding a new permission: add it here, then run `prisma db seed`.

export const PERMISSIONS = {
    // ── User Management ──────────────────────────────────────────────
    USER_READ: 'USER_READ',
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_SUSPEND: 'USER_SUSPEND',
    ROLE_ASSIGN: 'ROLE_ASSIGN',
    PERMISSION_ASSIGN: 'PERMISSION_ASSIGN',

    // ── System Administration ────────────────────────────────────────
    SYSTEM_CONFIG_UPDATE: 'SYSTEM_CONFIG_UPDATE',
    VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
    MANAGE_STAFF: 'MANAGE_STAFF',
    MANAGE_VOUCHERS: 'MANAGE_VOUCHERS',
    VIEW_ANALYTICS: 'VIEW_ANALYTICS',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',

    // ── Service Request Operations ───────────────────────────────────
    SERVICE_REQUEST_MANAGE: 'SERVICE_REQUEST_MANAGE',
    INCIDENT_RESOLVE: 'INCIDENT_RESOLVE',
    GUIDE_ASSIGN: 'GUIDE_ASSIGN',

    // ── Financial Operations ─────────────────────────────────────────
    WALLET_READ: 'WALLET_READ',
    WALLET_TOPUP_APPROVE: 'WALLET_TOPUP_APPROVE',
    WALLET_WITHDRAW_APPROVE: 'WALLET_WITHDRAW_APPROVE',
    ESCROW_RELEASE: 'ESCROW_RELEASE',
    ESCROW_REFUND: 'ESCROW_REFUND',
    VIEW_FINANCE: 'VIEW_FINANCE',

    // ── Verification / KYC / KYB ─────────────────────────────────────
    VERIFICATION_READ: 'VERIFICATION_READ',
    VERIFICATION_REVIEW: 'VERIFICATION_REVIEW',
    VERIFICATION_APPROVE: 'VERIFICATION_APPROVE',
    VERIFICATION_REJECT: 'VERIFICATION_REJECT',

    // ── Plan Management ──────────────────────────────────────────────
    PLAN_PRICING_UPDATE: 'PLAN_PRICING_UPDATE',

    // ── Tour Operations (operators/guides) ───────────────────────────
    TOUR_CREATE: 'TOUR_CREATE',
    TOUR_APPLY: 'TOUR_APPLY',
    TOUR_MANAGE_OWN: 'TOUR_MANAGE_OWN',
} as const;

/** Union type of all valid permission codes. Compile-time enforced. */
export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ── Category Mapping ─────────────────────────────────────────────────
// Used by UI to group permissions into collapsible sections.

export type PermissionCategory =
    | 'User Management'
    | 'System Administration'
    | 'Service Operations'
    | 'Financial Operations'
    | 'Verification / KYC'
    | 'Plan & Pricing'
    | 'Tour Operations';

export const PERMISSION_CATEGORIES: Record<string, PermissionCategory> = {
    USER_READ: 'User Management',
    USER_CREATE: 'User Management',
    USER_UPDATE: 'User Management',
    USER_SUSPEND: 'User Management',
    ROLE_ASSIGN: 'User Management',
    PERMISSION_ASSIGN: 'User Management',

    SYSTEM_CONFIG_UPDATE: 'System Administration',
    VIEW_AUDIT_LOG: 'System Administration',
    MANAGE_STAFF: 'System Administration',
    MANAGE_VOUCHERS: 'System Administration',
    VIEW_ANALYTICS: 'System Administration',
    SYSTEM_MAINTENANCE: 'System Administration',

    SERVICE_REQUEST_MANAGE: 'Service Operations',
    INCIDENT_RESOLVE: 'Service Operations',
    GUIDE_ASSIGN: 'Service Operations',

    WALLET_READ: 'Financial Operations',
    WALLET_TOPUP_APPROVE: 'Financial Operations',
    WALLET_WITHDRAW_APPROVE: 'Financial Operations',
    ESCROW_RELEASE: 'Financial Operations',
    ESCROW_REFUND: 'Financial Operations',
    VIEW_FINANCE: 'Financial Operations',

    VERIFICATION_READ: 'Verification / KYC',
    VERIFICATION_REVIEW: 'Verification / KYC',
    VERIFICATION_APPROVE: 'Verification / KYC',
    VERIFICATION_REJECT: 'Verification / KYC',

    PLAN_PRICING_UPDATE: 'Plan & Pricing',

    TOUR_CREATE: 'Tour Operations',
    TOUR_APPLY: 'Tour Operations',
    TOUR_MANAGE_OWN: 'Tour Operations',
};

export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
    USER_READ: 'View user profiles and lists',
    USER_CREATE: 'Create new user accounts',
    USER_UPDATE: 'Edit user profile information',
    USER_SUSPEND: 'Suspend or reactivate user accounts',
    ROLE_ASSIGN: 'Assign roles to users',
    PERMISSION_ASSIGN: 'Manage role-permission mappings',

    SYSTEM_CONFIG_UPDATE: 'Modify system configuration settings',
    VIEW_AUDIT_LOG: 'Access audit trail and activity logs',
    MANAGE_STAFF: 'Manage internal staff accounts',
    MANAGE_VOUCHERS: 'Create and manage promotional vouchers',
    VIEW_ANALYTICS: 'Access analytics dashboards and reports',
    SYSTEM_MAINTENANCE: 'Toggle maintenance mode on/off',

    SERVICE_REQUEST_MANAGE: 'Manage tour service requests',
    INCIDENT_RESOLVE: 'Resolve reported incidents',
    GUIDE_ASSIGN: 'Assign guides to tour requests',

    WALLET_READ: 'View operator wallet balances',
    WALLET_TOPUP_APPROVE: 'Approve wallet top-up requests',
    WALLET_WITHDRAW_APPROVE: 'Approve wallet withdrawal requests',
    ESCROW_RELEASE: 'Release escrowed funds to operators',
    ESCROW_REFUND: 'Process escrow refunds to travelers',
    VIEW_FINANCE: 'Access financial reports and ledger',

    VERIFICATION_READ: 'View verification submissions',
    VERIFICATION_REVIEW: 'Review verification submissions',
    VERIFICATION_APPROVE: 'Approve identity/business verification',
    VERIFICATION_REJECT: 'Reject verification submissions',

    PLAN_PRICING_UPDATE: 'Modify subscription plan pricing',

    TOUR_CREATE: 'Create new tour service requests',
    TOUR_APPLY: 'Apply to open tour opportunities',
    TOUR_MANAGE_OWN: 'Manage own tours and assignments',
};

/** High-risk permissions that warrant visual warnings */
export const HIGH_RISK_PERMISSIONS = [
    'WALLET_WITHDRAW_APPROVE',
    'ESCROW_RELEASE',
    'SYSTEM_CONFIG_UPDATE',
    'SYSTEM_MAINTENANCE',
    'PERMISSION_ASSIGN',
] as const;

/** All category names in display order */
export const CATEGORY_ORDER: PermissionCategory[] = [
    'User Management',
    'System Administration',
    'Service Operations',
    'Financial Operations',
    'Verification / KYC',
    'Plan & Pricing',
    'Tour Operations',
];
