/**
 * Admin Domain Separation — Domain Integrity Layer
 *
 * Every admin entity maps to exactly ONE domain.
 * No entity may belong to multiple domains.
 * Cross-domain access is rejected at the route level.
 */

// ══════════════════════════════════════════════════════════════════════
// DOMAIN ENUM
// ══════════════════════════════════════════════════════════════════════

export enum AdminDomain {
    VERIFICATION = 'VERIFICATION',
    PAYMENTS = 'PAYMENTS',
    INCIDENTS = 'INCIDENTS',
    CANCELLATION = 'CANCELLATION',
    RISK = 'RISK',
    GOVERNANCE = 'GOVERNANCE',
    SYSTEM = 'SYSTEM',
}

// ══════════════════════════════════════════════════════════════════════
// ENTITY → DOMAIN MAPPING
// ══════════════════════════════════════════════════════════════════════

export const ENTITY_DOMAIN_MAP = {
    VerificationSubmission: AdminDomain.VERIFICATION,
    VerificationDocument: AdminDomain.VERIFICATION,
    GuideApplication: AdminDomain.VERIFICATION,
    PaymentRequest: AdminDomain.PAYMENTS,
    OperatorWallet: AdminDomain.PAYMENTS,
    WalletTransaction: AdminDomain.PAYMENTS,
    Incident: AdminDomain.INCIDENTS,
    SOSRequest: AdminDomain.INCIDENTS,
    ServiceRequest_FORCE_CANCEL: AdminDomain.CANCELLATION,
    UserRoleChange: AdminDomain.GOVERNANCE,
    SystemConfig: AdminDomain.SYSTEM,
} as const;

// ══════════════════════════════════════════════════════════════════════
// ATTENTION ITEM TYPE → DOMAIN MAPPING
// ══════════════════════════════════════════════════════════════════════

export const ATTENTION_DOMAIN_MAP = {
    // Ops attention queue types
    SOS: AdminDomain.INCIDENTS,
    TOUR_URGENT: AdminDomain.INCIDENTS,
    CHECK_IN_MISSED: AdminDomain.INCIDENTS,
    PENDING_APP: AdminDomain.VERIFICATION,
    PENDING_CONTRACT: AdminDomain.VERIFICATION,
    INACTIVE_GUIDE: AdminDomain.VERIFICATION,
    FORCE_CANCEL: AdminDomain.CANCELLATION,
    FORCE_CANCEL_REVIEW: AdminDomain.CANCELLATION,
    ESCROW_PENDING: AdminDomain.PAYMENTS,
    STALE_COMPLETED: AdminDomain.PAYMENTS,
    LEDGER_DRIFT: AdminDomain.PAYMENTS,
    HIGH_BOOST_FREQUENCY: AdminDomain.RISK,
    STALE_RISK: AdminDomain.RISK,
    PENDING_APPLICATION: AdminDomain.VERIFICATION,
} as const;

export type AttentionItemType = keyof typeof ATTENTION_DOMAIN_MAP;

// ══════════════════════════════════════════════════════════════════════
// DOMAIN ENVELOPE — Standardized API Response
// ══════════════════════════════════════════════════════════════════════

export interface DomainEnvelope<T> {
    domain: AdminDomain;
    items: T[];
    total: number;
    pending: number;
}

// ══════════════════════════════════════════════════════════════════════
// DOMAIN-GROUPED ATTENTION RESULT
// ══════════════════════════════════════════════════════════════════════

export interface AttentionItem {
    id: string;
    type: string;
    domain: AdminDomain;
    severity: 'critical' | 'high' | 'warning' | 'normal';
    title: string;
    description: string;
    tourId?: string;
    userId?: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

export interface DomainGroupedAttention {
    verification: DomainEnvelope<AttentionItem>;
    payments: DomainEnvelope<AttentionItem>;
    incidents: DomainEnvelope<AttentionItem>;
    cancellations: DomainEnvelope<AttentionItem>;
    risk: DomainEnvelope<AttentionItem>;
    counts: {
        total: number;
        critical: number;
        high: number;
        normal: number;
    };
}

// ══════════════════════════════════════════════════════════════════════
// DOMAIN LABELS (for UI)
// ══════════════════════════════════════════════════════════════════════

export const DOMAIN_LABELS: Record<AdminDomain, string> = {
    [AdminDomain.VERIFICATION]: 'Verification',
    [AdminDomain.PAYMENTS]: 'Payments',
    [AdminDomain.INCIDENTS]: 'Incidents',
    [AdminDomain.CANCELLATION]: 'Cancellations',
    [AdminDomain.RISK]: 'Risk Monitoring',
    [AdminDomain.GOVERNANCE]: 'Governance',
    [AdminDomain.SYSTEM]: 'System',
};

export const DOMAIN_ICONS: Record<AdminDomain, string> = {
    [AdminDomain.VERIFICATION]: '📋',
    [AdminDomain.PAYMENTS]: '💳',
    [AdminDomain.INCIDENTS]: '🚨',
    [AdminDomain.CANCELLATION]: '⚠️',
    [AdminDomain.RISK]: '🛡️',
    [AdminDomain.GOVERNANCE]: '⚖️',
    [AdminDomain.SYSTEM]: '⚙️',
};
