/**
 * Governed Mutation Kernel
 *
 * All critical state-changing mutations MUST go through this kernel.
 * It enforces:
 *   1. State machine validation (transitions)
 *   2. Invariant checks (domain rules)
 *   3. Atomic transactions (prisma.$transaction)
 *   4. Governance-grade audit logging
 *   5. Guaranteed notifications (never silently fail)
 *
 * Usage:
 *   return executeGovernedMutation({
 *     entityName: 'Tour',
 *     entityId: tourId,
 *     actorId: session.user.id,
 *     actorRole: session.user.role,
 *     stateMachine: TOUR_MACHINE,
 *     fromState: tour.status,
 *     toState: 'COMPLETED',
 *     invariants: [
 *       async (tx) => assertAllSegmentsResolved(tx, tourId),
 *     ],
 *     atomicMutation: async (tx) => {
 *       return tx.tour.update({ ... });
 *     },
 *     auditAction: 'TOUR_COMPLETED',
 *     auditBefore: snapshotRecord(tour),
 *     auditAfter: (result) => snapshotRecord(result),
 *     notification: async () => {
 *       await guaranteedNotification({ ... });
 *     },
 *     ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
 *   });
 */

import { prisma } from '@/lib/prisma';
import { validateTransition } from '@/lib/state-machine';
import { createAuditEntry } from '@/domain/governance/AuditService';

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export interface GovernedMutationOptions<T> {
    // ── Identity ──────────────────────────────────────
    entityName: string;
    entityId: string;
    actorId: string;
    actorRole: string;

    // ── State Machine (optional — skip for non-stateful mutations) ──
    stateMachine?: Record<string, string[]>;
    fromState?: string;
    toState?: string;

    // ── Invariants (run inside transaction, before mutation) ──
    invariants?: ((tx: PrismaTx) => Promise<void>)[];

    // ── Core Mutation (inside transaction) ─────────────
    atomicMutation: (tx: PrismaTx) => Promise<T>;

    // ── Audit (inside transaction) ────────────────────
    auditAction: string;
    auditBefore?: any;
    auditAfter?: (result: T) => any;

    // ── Post-commit (outside transaction, non-blocking) ─
    notification?: () => Promise<void>;

    // ── Metadata ──────────────────────────────────────
    ipAddress?: string;
    metadata?: Record<string, any>;
}

/**
 * Execute a governed mutation with full invariant enforcement.
 *
 * Order of operations:
 *   1. State machine validation (throws if invalid transition)
 *   2. $transaction begins
 *   3. All invariants run (throw on failure)
 *   4. atomicMutation runs
 *   5. Audit entry created
 *   6. $transaction commits
 *   7. Notification sent (non-blocking, failure-logged)
 *
 * Returns the result of atomicMutation.
 */
export async function executeGovernedMutation<T>(
    options: GovernedMutationOptions<T>,
): Promise<T> {
    const {
        entityName,
        entityId,
        actorId,
        actorRole,
        stateMachine,
        fromState,
        toState,
        invariants,
        atomicMutation,
        auditAction,
        auditBefore,
        auditAfter,
        notification,
        ipAddress,
        metadata,
    } = options;

    // ── Step 1: State machine validation (before transaction) ──
    if (stateMachine && fromState && toState) {
        validateTransition(stateMachine, entityName, fromState, toState);
    }

    // ── Step 2–5: Atomic transaction ────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
        // Step 3: Run all invariants
        if (invariants && invariants.length > 0) {
            for (const invariant of invariants) {
                await invariant(tx);
            }
        }

        // Step 4: Execute the core mutation
        const mutationResult = await atomicMutation(tx);

        // Step 5: Create audit entry (inside transaction)
        await createAuditEntry({
            actorId,
            actorRole,
            action: auditAction,
            entityType: entityName,
            entityId,
            beforeState: auditBefore ?? {},
            afterState: auditAfter ? auditAfter(mutationResult) : {},
            metadata: metadata ?? {},
            ipAddress: ipAddress ?? 'unknown',
        });

        return mutationResult;
    });

    // ── Step 7: Notification (post-commit, non-blocking) ────────
    if (notification) {
        try {
            await notification();
        } catch (error) {
            // Notification failure is logged by guaranteedNotification
            // but we also log here for belt-and-suspenders
            console.error(`[GovernedMutation] Notification failed for ${entityName}:${entityId}`, error);
        }
    }

    return result;
}
