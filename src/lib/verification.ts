/**
 * Verification Status Helper
 * 
 * Governance Rule: Single source of truth for verification status checks.
 * 
 * Verification gates:
 * - TOUR_OPERATOR: kybStatus === 'APPROVED'
 * - TOUR_GUIDE: kycStatus === 'APPROVED'
 * - Either: verificationStatus === 'APPROVED' (legacy fallback)
 */

export interface VerificationContext {
    role?: string;
    kybStatus?: string;
    kycStatus?: string;
    verificationStatus?: string;
}

/**
 * Canonical verification check.
 * Use this function everywhere instead of inline checks.
 */
export function isUserVerified(user: VerificationContext | null | undefined): boolean {
    if (!user) return false;

    // Operator: KYB
    if (user.role === 'TOUR_OPERATOR') {
        return user.kybStatus === 'APPROVED';
    }

    // Guide: KYC
    if (user.role === 'TOUR_GUIDE') {
        return user.kycStatus === 'APPROVED';
    }

    // Fallback for legacy or unknown roles
    return (
        user.kybStatus === 'APPROVED' ||
        user.kycStatus === 'APPROVED' ||
        user.verificationStatus === 'APPROVED'
    );
}

/**
 * Get verification status label for display.
 */
export function getVerificationStatus(user: VerificationContext | null | undefined): string {
    if (!user) return 'UNKNOWN';

    if (user.role === 'TOUR_OPERATOR') {
        return user.kybStatus || 'NOT_STARTED';
    }

    if (user.role === 'TOUR_GUIDE') {
        return user.kycStatus || 'NOT_STARTED';
    }

    return user.verificationStatus || user.kybStatus || user.kycStatus || 'NOT_STARTED';
}
