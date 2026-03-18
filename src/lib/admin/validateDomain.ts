/**
 * Domain Route Guard — Entity Validation
 *
 * Validates that an entity ID belongs to the expected admin domain.
 * Returns 400 "Invalid domain for this entity" on mismatch.
 * Logs CRITICAL audit entry on violation.
 */

import { prisma } from '@/lib/prisma';
import { AdminDomain } from '@/domain/admin/AdminDomain';
import { logDomainViolation } from '@/lib/audit';

// ══════════════════════════════════════════════════════════════════════
// ENTITY EXISTENCE CHECKERS (by domain)
// ══════════════════════════════════════════════════════════════════════

async function existsInVerification(entityId: string): Promise<boolean> {
    const sub = await prisma.verificationSubmission.findUnique({
        where: { id: entityId },
        select: { id: true },
    });
    return !!sub;
}

async function existsInPayments(entityId: string): Promise<boolean> {
    const payment = await prisma.subscriptionPaymentRequest.findUnique({
        where: { id: entityId },
        select: { id: true },
    });
    return !!payment;
}

async function existsInIncidents(entityId: string): Promise<boolean> {
    const incident = await prisma.incident.findUnique({
        where: { id: entityId },
        select: { id: true },
    });
    return !!incident;
}

async function existsInCancellation(entityId: string): Promise<boolean> {
    const sr = await prisma.serviceRequest.findFirst({
        where: {
            id: entityId,
            status: { in: ['FORCE_CANCEL_PENDING_REVIEW', 'CANCELLED'] },
        },
        select: { id: true },
    });
    return !!sr;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN VALIDATION FUNCTION
// ══════════════════════════════════════════════════════════════════════

export interface DomainValidationResult {
    valid: boolean;
    entityFound: boolean;
    message?: string;
}

/**
 * Validate that an entity ID belongs to the expected admin domain.
 * 
 * @param entityId - The ID of the entity to validate
 * @param expectedDomain - The domain the route expects
 * @param actorId - The user performing the action (for audit logging)
 * @returns Validation result with `valid`, `entityFound`, and optional `message`
 */
export async function validateEntityDomain(
    entityId: string,
    expectedDomain: AdminDomain,
    actorId?: string,
): Promise<DomainValidationResult> {
    if (!entityId) {
        return { valid: false, entityFound: false, message: 'Entity ID is required' };
    }

    let entityFound = false;

    switch (expectedDomain) {
        case AdminDomain.VERIFICATION:
            entityFound = await existsInVerification(entityId);
            break;
        case AdminDomain.PAYMENTS:
            entityFound = await existsInPayments(entityId);
            break;
        case AdminDomain.INCIDENTS:
            entityFound = await existsInIncidents(entityId);
            break;
        case AdminDomain.CANCELLATION:
            entityFound = await existsInCancellation(entityId);
            break;
        default:
            // For GOVERNANCE, RISK, SYSTEM — no entity-level validation needed
            return { valid: true, entityFound: true };
    }

    if (!entityFound) {
        // Log domain violation as CRITICAL
        await logDomainViolation({
            actorId: actorId || 'UNKNOWN',
            expectedDomain,
            entityId,
            message: `Entity ${entityId} not found in ${expectedDomain} domain`,
        });

        return {
            valid: false,
            entityFound: false,
            message: 'Invalid domain for this entity.',
        };
    }

    return { valid: true, entityFound: true };
}
