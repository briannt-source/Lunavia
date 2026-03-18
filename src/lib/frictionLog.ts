import { prisma } from '@/lib/prisma';

// Phase 16: Friction logging utility for pilot observability
// Logs events that indicate user friction without changing business logic

export type FrictionEventType =
    | 'APPLY_BLOCKED'      // Guide tried to apply but was blocked (KYC)
    | 'CANCEL'             // Operator cancelled a request
    | 'ABANDON_APPLY'      // Guide viewed but didn't apply (future)
    | 'OPEN_STALE'         // Request stayed OPEN too long
    | 'ASSIGNED_NOT_STARTED'; // Assigned but never started

interface FrictionLogParams {
    eventType: FrictionEventType;
    userId?: string | null;
    userRole?: string | null;
    requestId?: string | null;
    reason?: string | null;
    metadata?: Record<string, any>;
}

export async function logFriction(params: FrictionLogParams): Promise<void> {
    try {
        await prisma.frictionLog.create({
            data: {
                eventType: params.eventType,
                userId: params.userId || null,
                userRole: params.userRole || null,
                requestId: params.requestId || null,
                reason: params.reason || null,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            },
        });
    } catch (error) {
        // Silent fail - friction logging should never break the main flow
        console.error('[FrictionLog] Failed to log:', error);
    }
}
