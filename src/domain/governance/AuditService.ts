/**
 * AuditService — Governance-grade before/after state audit logging.
 *
 * RULES:
 * - NEVER update an AuditLog record
 * - NEVER delete an AuditLog record
 * - This service must NEVER throw — all errors caught internally
 * - All financial and governance state changes MUST be logged
 */

import { prisma } from '@/lib/prisma';

// ══════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════

export interface CreateAuditEntryParams {
    actorId: string;
    actorRole?: string;
    action: string;
    entityType: string;
    entityId: string;
    beforeState?: Record<string, unknown> | null;
    afterState?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string;
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT ACTIONS REGISTRY
// ══════════════════════════════════════════════════════════════════════

export const AUDIT_ACTIONS = {
    // Financial — Withdrawals
    WITHDRAW_REQUESTED: 'WITHDRAW_REQUESTED',
    WITHDRAW_APPROVED: 'WITHDRAW_APPROVED',
    WITHDRAW_REJECTED: 'WITHDRAW_REJECTED',
    WITHDRAW_CANCELLED: 'WITHDRAW_CANCELLED',

    // Financial — Top-ups
    TOPUP_REQUESTED: 'TOPUP_REQUESTED',
    TOPUP_APPROVED: 'TOPUP_APPROVED',
    TOPUP_REJECTED: 'TOPUP_REJECTED',

    // Escrow
    ESCROW_RELEASED: 'ESCROW_RELEASED',
    ESCROW_REFUNDED: 'ESCROW_REFUNDED',

    // Verification
    VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
    VERIFICATION_REJECTED: 'VERIFICATION_REJECTED',

    // User Governance
    USER_SUSPENDED: 'USER_SUSPENDED',
    USER_REACTIVATED: 'USER_REACTIVATED',
    PLAN_CHANGED: 'PLAN_CHANGED',
    PLAN_CHANGED_REQUESTED: 'PLAN_CHANGED_REQUESTED',
    PLAN_CHANGED_APPROVED: 'PLAN_CHANGED_APPROVED',
    ROLE_CHANGED: 'ROLE_CHANGED',

    // Tour Execution
    SEGMENT_CHECKIN_CREATED: 'SEGMENT_CHECKIN_CREATED',
    SEGMENT_CHECKIN_EDITED: 'SEGMENT_CHECKIN_EDITED',

    // System / Admin Governance
    SYSTEM_CONFIG_UPDATED: 'SYSTEM_CONFIG_UPDATED',
    STAFF_CREATED: 'STAFF_CREATED',
    MAINTENANCE_TOGGLED: 'MAINTENANCE_TOGGLED',
    DEMO_RESET_EXECUTED: 'DEMO_RESET_EXECUTED',
    VOUCHER_CREATED: 'VOUCHER_CREATED',
    VERIFICATION_RESET: 'VERIFICATION_RESET',
    PERMISSION_UPDATED: 'PERMISSION_UPDATED',
    BOOST_PURCHASED: 'BOOST_PURCHASED',

    // Governed mutations
    TOUR_COMPLETED: 'TOUR_COMPLETED',
    EXECUTION_ARCHIVE_CREATED: 'EXECUTION_ARCHIVE_CREATED',
    RECONCILIATION_ALERT: 'RECONCILIATION_ALERT',
    NOTIFICATION_FAILURE: 'NOTIFICATION_FAILURE',
    GOVERNANCE_CHECK_FAILED: 'GOVERNANCE_CHECK_FAILED',
} as const;

export const ENTITY_TYPES = {
    WITHDRAW_REQUEST: 'EscrowWithdrawRequest',
    TOPUP_REQUEST: 'EscrowTopUpRequest',
    ESCROW_HOLD: 'EscrowHold',
    WALLET: 'OperatorWallet',
    USER: 'User',
    VERIFICATION: 'OperatorVerification',
    TOUR_SEGMENT: 'TourSegment',
    SEGMENT_CHECKIN: 'SegmentCheckIn',
    SYSTEM_CONFIG: 'SystemConfig',
    STAFF: 'Staff',
    VOUCHER: 'Voucher',
} as const;

// ══════════════════════════════════════════════════════════════════════
// CORE FUNCTION
// ══════════════════════════════════════════════════════════════════════

/**
 * Create an immutable audit log entry.
 *
 * This function NEVER throws. All errors are caught and logged.
 * Audit logging must never break business logic.
 */
export async function createAuditEntry(params: CreateAuditEntryParams): Promise<void> {
    const {
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        beforeState,
        afterState,
        metadata,
        ipAddress,
    } = params;

    try {
        await prisma.auditLog.create({
            data: {
                userId: actorId,
                actorRole: actorRole ?? null,
                action,
                entityType,
                entityId,
                beforeState: (beforeState as any) ?? undefined,
                afterState: (afterState as any) ?? undefined,
                metadata: (metadata as any) ?? undefined,
                ipAddress: ipAddress ?? null,
                // Also populate legacy fields for backward compatibility
                targetId: entityId,
                targetType: entityType,
            },
        });
    } catch (error) {
        // Audit must never break business logic
        console.error('[AuditService] Failed to create audit entry:', {
            action,
            entityType,
            entityId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

/**
 * Snapshot a record for beforeState / afterState storage.
 * Strips Prisma internal fields and converts Dates to ISO strings.
 */
export function snapshotRecord(record: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
    if (!record) return null;
    const snapshot: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        if (value instanceof Date) {
            snapshot[key] = value.toISOString();
        } else if (value !== undefined) {
            snapshot[key] = value;
        }
    }
    return snapshot;
}
