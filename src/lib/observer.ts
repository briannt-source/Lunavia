import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Observer Access Guards
 * 
 * Governance: Observers exist to increase trust, not control outcomes.
 * - Read-only access only
 * - Type A: System-wide aggregated data
 * - Type B: Operator-scoped performance data
 */

export type ObserverType = 'SYSTEM' | 'OPERATOR_PERFORMANCE';

interface ObserverSession {
    userId: string;
    email: string;
    role: string;
    observerType: ObserverType;
    linkedOperatorId: string | null;
}

/**
 * Validates observer access and returns session if authorized
 * @param method HTTP method (must be GET for observers)
 * @param requiredType Optional: specific observer type required
 * @param requiredOperatorId Optional: specific operator ID for Type B
 */
export async function requireObserver(
    method: string,
    requiredType?: ObserverType,
    requiredOperatorId?: string
): Promise<ObserverSession> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error('UNAUTHENTICATED');
    }

    const user = session.user;

    // Admins bypass observer checks but still logged
    if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
        return {
            userId: user.id,
            email: user.email ?? '',
            role: user.role,
            observerType: 'SYSTEM', // Admins can see everything
            linkedOperatorId: null
        };
    }

    // Must be OBSERVER role
    if (user.role !== 'OBSERVER') {
        throw new Error('FORBIDDEN');
    }

    // Observers can ONLY read
    if (method !== 'GET') {
        throw new Error('OBSERVER_READ_ONLY');
    }

    // Validate observer type
    const observerType = user.observerType as ObserverType;
    if (!observerType) {
        throw new Error('OBSERVER_TYPE_NOT_CONFIGURED');
    }

    // If specific type required, validate
    if (requiredType && observerType !== requiredType) {
        throw new Error('OBSERVER_TYPE_MISMATCH');
    }

    // For Type B, validate operator access
    if (observerType === 'OPERATOR_PERFORMANCE') {
        if (!user.linkedOperatorId) {
            throw new Error('OBSERVER_NO_LINKED_OPERATOR');
        }

        if (requiredOperatorId && user.linkedOperatorId !== requiredOperatorId) {
            throw new Error('OBSERVER_OPERATOR_MISMATCH');
        }
    }

    return {
        userId: user.id,
        email: user.email ?? '',
        role: user.role,
        observerType,
        linkedOperatorId: user.linkedOperatorId || null
    };
}

/**
 * Logs observer access for audit trail
 */
export async function logObserverAccess(
    observer: ObserverSession,
    endpoint: string,
    dataType: string,
    recordCount?: number
): Promise<void> {
    try {
        await (prisma as any).observerAccessLog.create({
            data: {
                observerId: observer.userId,
                observerType: observer.observerType,
                endpoint,
                dataType,
                recordCount: recordCount ?? null,
                linkedOperatorId: observer.linkedOperatorId
            }
        });
    } catch (error) {
        // Log error but don't fail the request
        console.error('Failed to log observer access:', error);
    }
}

/**
 * Standard error response for observer routes
 */
export function observerErrorResponse(error: any): NextResponse {
    const code = error.message || 'UNKNOWN_ERROR';
    const statusMap: Record<string, number> = {
        'UNAUTHENTICATED': 401,
        'FORBIDDEN': 403,
        'OBSERVER_READ_ONLY': 403,
        'OBSERVER_TYPE_NOT_CONFIGURED': 403,
        'OBSERVER_TYPE_MISMATCH': 403,
        'OBSERVER_NO_LINKED_OPERATOR': 403,
        'OBSERVER_OPERATOR_MISMATCH': 403,
    };

    const status = statusMap[code] || 500;
    return NextResponse.json(
        { success: false, message: code },
        { status }
    );
}
