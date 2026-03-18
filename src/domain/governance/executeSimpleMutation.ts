/**
 * Simple Mutation Kernel
 *
 * Wrapper for all non-state-machine atomic mutations.
 * Use this for operations that need:
 *   1. Atomic transactions (prisma.$transaction)
 *   2. Optional governance-grade audit logging
 *   3. Guaranteed notifications (never silently fail)
 *
 * For state-machine mutations, use executeGovernedMutation instead.
 *
 * Usage:
 *   return executeSimpleMutation({
 *     entityName: 'User',
 *     entityId: userId,
 *     actorId: session.user.id,
 *     actorRole: session.user.role,
 *     atomicMutation: async (tx) => {
 *       return tx.user.update({ ... });
 *     },
 *     auditAction: 'PROFILE_UPDATED',
 *     auditBefore: { name: 'old' },
 *     auditAfter: (result) => ({ name: result.name }),
 *     notification: async () => {
 *       await guaranteedNotification({ ... });
 *     },
 *   });
 */

import { prisma } from '@/lib/prisma';
import { createAuditEntry } from '@/domain/governance/AuditService';

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export interface SimpleMutationOptions<T> {
    // ── Identity ──────────────────────────────────────
    entityName: string;
    entityId?: string;
    actorId: string;
    actorRole: string;

    // ── Core Mutation (inside transaction) ─────────────
    atomicMutation: (tx: PrismaTx) => Promise<T>;

    // ── Audit (optional — inside transaction) ──────────
    auditAction?: string;
    auditBefore?: any;
    auditAfter?: ((result: T) => any) | any;

    // ── Post-commit (outside transaction, non-blocking) ─
    notification?: () => Promise<void>;

    // ── Metadata ──────────────────────────────────────
    ipAddress?: string;
    metadata?: Record<string, any>;
}

/**
 * Execute a simple mutation with atomic transaction and optional audit.
 *
 * Order of operations:
 *   1. $transaction begins
 *   2. atomicMutation runs
 *   3. If auditAction provided → audit entry created
 *   4. $transaction commits
 *   5. Notification sent (non-blocking, failure-logged)
 *
 * Returns the result of atomicMutation.
 */
export async function executeSimpleMutation<T>(
    options: SimpleMutationOptions<T>,
): Promise<T> {
    const {
        entityName,
        entityId,
        actorId,
        actorRole,
        atomicMutation,
        auditAction,
        auditBefore,
        auditAfter,
        notification,
        ipAddress,
        metadata,
    } = options;

    // ── Step 1–3: Atomic transaction ────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
        // Step 2: Execute the core mutation
        const mutationResult = await atomicMutation(tx);

        // Step 3: Create audit entry if action provided (inside transaction)
        if (auditAction) {
            const afterState = typeof auditAfter === 'function'
                ? auditAfter(mutationResult)
                : (auditAfter ?? {});

            await createAuditEntry({
                actorId,
                actorRole,
                action: auditAction,
                entityType: entityName,
                entityId: entityId ?? 'unknown',
                beforeState: auditBefore ?? {},
                afterState,
                metadata: metadata ?? {},
                ipAddress: ipAddress ?? 'server',
            });
        }

        return mutationResult;
    });

    // ── Step 5: Notification (post-commit, non-blocking) ────────
    if (notification) {
        try {
            await notification();
        } catch (error) {
            console.error(`[SimpleMutation] Notification failed for ${entityName}:${entityId}`, error);
        }
    }

    return result;
}
