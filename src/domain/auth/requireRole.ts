/**
 * Centralized Role Guard — requireRole
 *
 * All API routes must use this to enforce RBAC.
 * Never expose internal role names in error responses.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { type UserRole } from '@/lib/roles';
import { NextResponse } from 'next/server';

export class AuthError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(code: string, statusCode: number) {
        super(code);
        this.code = code;
        this.statusCode = statusCode;
    }
}

/**
 * Require authenticated session with one of the allowed roles.
 * Returns the validated session or throws AuthError.
 *
 * Usage:
 *   const session = await requireRole(['SUPER_ADMIN', 'FINANCE']);
 */
export async function requireRole(allowedRoles: readonly string[]) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new AuthError('UNAUTHENTICATED', 401);
    }

    const userRole = session.user.role;
    if (!allowedRoles.includes(userRole)) {
        throw new AuthError('FORBIDDEN', 403);
    }

    return session;
}

/**
 * Standardized error response for auth failures.
 * Use in catch blocks: if (e instanceof AuthError) return authErrorResponse(e);
 */
export function authErrorResponse(error: AuthError): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: { code: error.code, message: 'Access denied' },
        },
        { status: error.statusCode }
    );
}

/**
 * Standardized success response wrapper.
 */
export function successResponse(data: Record<string, unknown>, status = 200): NextResponse {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standardized error response wrapper.
 */
export function errorResponse(code: string, message: string, status = 400): NextResponse {
    return NextResponse.json(
        { success: false, error: { code, message } },
        { status }
    );
}
