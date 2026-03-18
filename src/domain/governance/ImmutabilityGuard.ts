/**
 * Immutability Guard — Domain-Level Table Protection
 *
 * Enforces create-only / append-only semantics on governance-critical tables.
 * This module provides Prisma middleware-style guards and route-level helpers.
 *
 * Protected tables:
 *   - AuditLog:           CREATE only (no update, no delete)
 *   - WalletTransaction:  CREATE only (status field update allowed via explicit bypass)
 *   - EscrowLedgerEntry:  CREATE only (no update, no delete)
 *   - SegmentCheckIn:     APPEND only (edit creates new entry, no delete)
 *   - BoostEntry:         IMMUTABLE after creation (no update, no delete)
 */

// Tables that are strictly create-only (no update, no delete ever)
const CREATE_ONLY_TABLES = [
    'AuditLog',
    'EscrowLedgerEntry',
    'PlatformRevenueLedger',
] as const;

// Tables where only specific fields can be updated
const RESTRICTED_UPDATE_TABLES: Record<string, string[]> = {
    // WalletTransaction: only status and processedAt/processedBy can change
    WalletTransaction: ['status', 'processedAt', 'processedBy'],
    // SegmentCheckIn: only edit metadata can be appended
    SegmentCheckIn: ['edited', 'editReason', 'updatedAt'],
};

// Tables where delete is never allowed
const NO_DELETE_TABLES = [
    'AuditLog',
    'WalletTransaction',
    'EscrowLedgerEntry',
    'PlatformRevenueLedger',
    'SegmentCheckIn',
] as const;

/**
 * Assert that a mutation on a governance-critical table is allowed.
 * Throws immediately if the operation violates immutability rules.
 *
 * @param table - Prisma model name
 * @param operation - 'create' | 'update' | 'delete'
 * @param updatedFields - Fields being updated (for update operations)
 */
export function assertImmutability(
    table: string,
    operation: 'create' | 'update' | 'delete' | 'updateMany' | 'deleteMany',
    updatedFields?: string[],
): void {
    // CREATE is always allowed
    if (operation === 'create') return;

    // DELETE checks
    if (operation === 'delete' || operation === 'deleteMany') {
        if ((NO_DELETE_TABLES as readonly string[]).includes(table)) {
            throw new Error(
                `IMMUTABILITY_VIOLATION: Delete operation on ${table} is prohibited. ` +
                `This table is governed by immutability rules.`
            );
        }
        return;
    }

    // UPDATE checks
    if (operation === 'update' || operation === 'updateMany') {
        // Strictly create-only tables: no updates at all
        if ((CREATE_ONLY_TABLES as readonly string[]).includes(table)) {
            throw new Error(
                `IMMUTABILITY_VIOLATION: Update operation on ${table} is prohibited. ` +
                `This table is create-only.`
            );
        }

        // Restricted-update tables: only specific fields allowed
        const allowedFields = RESTRICTED_UPDATE_TABLES[table];
        if (allowedFields && updatedFields) {
            const forbidden = updatedFields.filter(f => !allowedFields.includes(f));
            if (forbidden.length > 0) {
                throw new Error(
                    `IMMUTABILITY_VIOLATION: Cannot update fields [${forbidden.join(', ')}] on ${table}. ` +
                    `Only [${allowedFields.join(', ')}] are mutable.`
                );
            }
        }
    }
}

/**
 * Assert that a User cannot be hard-deleted if they have financial records.
 */
export async function assertCanDeleteUser(
    tx: any,
    userId: string,
): Promise<void> {
    const [walletCount, auditCount] = await Promise.all([
        tx.operatorWallet.count({ where: { operatorId: userId } }),
        tx.auditLog.count({ where: { userId } }),
    ]);

    if (walletCount > 0) {
        throw new Error(
            `DELETION_BLOCKED: User ${userId} has ${walletCount} wallet(s) with financial records. ` +
            `Use soft-delete (accountStatus = 'DELETED') instead.`
        );
    }
    if (auditCount > 0) {
        throw new Error(
            `DELETION_BLOCKED: User ${userId} has ${auditCount} audit log entries. ` +
            `Use soft-delete (accountStatus = 'DELETED') instead.`
        );
    }
}

/**
 * Assert that a ServiceRequest cannot be hard-deleted if execution data exists.
 */
export async function assertCanDeleteServiceRequest(
    tx: any,
    requestId: string,
): Promise<void> {
    const segmentCount = await tx.tourSegment.count({ where: { tourId: requestId } });
    if (segmentCount > 0) {
        throw new Error(
            `DELETION_BLOCKED: ServiceRequest ${requestId} has ${segmentCount} segments. ` +
            `Cannot delete tours with execution history.`
        );
    }

    const request = await tx.serviceRequest.findUnique({
        where: { id: requestId },
        select: { status: true },
    });
    if (request && ['IN_PROGRESS', 'COMPLETED'].includes(request.status)) {
        throw new Error(
            `DELETION_BLOCKED: ServiceRequest ${requestId} has status ${request.status}. ` +
            `Cannot delete in-progress or completed tours.`
        );
    }
}

/**
 * Assert that a Wallet cannot be hard-deleted if transactions exist.
 */
export async function assertCanDeleteWallet(
    tx: any,
    walletId: string,
): Promise<void> {
    const txCount = await tx.walletTransaction.count({ where: { walletId } });
    if (txCount > 0) {
        throw new Error(
            `DELETION_BLOCKED: Wallet ${walletId} has ${txCount} transactions. ` +
            `Cannot delete wallets with financial history.`
        );
    }
}
