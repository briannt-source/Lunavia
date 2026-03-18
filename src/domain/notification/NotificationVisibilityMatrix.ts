/**
 * NotificationVisibilityMatrix — Role-Domain Access Control
 *
 * Defines which roles can VIEW notifications from each domain.
 * Used by the GET /api/notifications endpoint to filter results.
 *
 * SYSTEM domain is visible to ALL roles.
 * Other domains are restricted to specific admin/operational roles.
 * End-user roles (TOUR_OPERATOR, TOUR_GUIDE) always see their OWN
 * notifications regardless of domain (userId filter is applied first).
 * This matrix adds an additional layer for admin-panel views.
 */

import { NotificationDomain } from './NotificationService';

// ══════════════════════════════════════════════════════════════════════
// ROLE-DOMAIN VISIBILITY MATRIX
// ══════════════════════════════════════════════════════════════════════

/**
 * Maps each NotificationDomain to the roles that can view notifications
 * in that domain. 'ALL' means every role can see it.
 */
const VISIBILITY_MATRIX: Record<NotificationDomain, string[] | 'ALL'> = {
    [NotificationDomain.ESCROW]: ['SUPER_ADMIN', 'FINANCE', 'TOUR_OPERATOR'],
    [NotificationDomain.REVENUE]: ['SUPER_ADMIN', 'FINANCE', 'TOUR_GUIDE'],
    [NotificationDomain.VERIFICATION]: ['SUPER_ADMIN', 'ADMIN', 'KYC_ANALYST'],
    [NotificationDomain.GOVERNANCE]: ['SUPER_ADMIN', 'ADMIN', 'TOUR_OPERATOR', 'TOUR_GUIDE'],
    [NotificationDomain.SYSTEM]: 'ALL',
    [NotificationDomain.INCIDENT]: ['SUPER_ADMIN', 'OPS'],
    [NotificationDomain.RISK]: ['SUPER_ADMIN', 'OPS'],
    [NotificationDomain.CANCELLATION]: ['SUPER_ADMIN', 'OPS', 'TOUR_OPERATOR', 'TOUR_GUIDE'],
};

// ══════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════

/**
 * Check if a specific role can view notifications from a given domain.
 */
export function canViewDomain(role: string, domain: NotificationDomain): boolean {
    const allowed = VISIBILITY_MATRIX[domain];
    if (allowed === 'ALL') return true;
    return allowed.includes(role);
}

/**
 * Get all domains visible to a given role.
 * Returns the list of NotificationDomain values the role is allowed to read.
 */
export function getVisibleDomains(role: string): NotificationDomain[] {
    return Object.values(NotificationDomain).filter(domain =>
        canViewDomain(role, domain)
    );
}

/**
 * Get the full visibility matrix (for audit/debug output).
 */
export function getVisibilityMatrix(): Record<string, string[] | 'ALL'> {
    return { ...VISIBILITY_MATRIX };
}
