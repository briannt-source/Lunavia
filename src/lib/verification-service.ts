// ══════════════════════════════════════════════════════════════════════
// Verification Service — Shared query functions
// ══════════════════════════════════════════════════════════════════════
// Single source of truth for verification-related queries.
// Used by: admin dashboard, signals API, monitoring.

import { prisma } from '@/lib/prisma';

/**
 * Returns the count of PENDING verification submissions.
 * Used by dashboard metrics and signals API.
 */
export async function getPendingVerificationCount(): Promise<number> {
    return prisma.verificationSubmission.count({
        where: { status: 'PENDING' },
    });
}
