import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { PermissionCode } from '@/domain/rbac/permissions';

// ══════════════════════════════════════════════════════════════════════
// Enterprise RBAC — Permission Guard System
// ══════════════════════════════════════════════════════════════════════

/**
 * Check if a user has a specific permission via their Role → RolePermission → Permission chain.
 * Also checks legacy UserPermission table as override.
 */
export async function hasPermission(userId: string, permissionCode: PermissionCode): Promise<boolean> {
    // Check via Role → RolePermission → Permission using a join query
    const result = await (prisma as any).$queryRaw`
        SELECT 1 FROM "User" u
        JOIN "Role" r ON u."roleId" = r.id
        JOIN "RolePermission" rp ON rp."roleId" = r.id
        JOIN "Permission" p ON rp."permissionId" = p.id
        WHERE u.id = ${userId} AND p.code = ${permissionCode}
        LIMIT 1
    `;

    if (Array.isArray(result) && result.length > 0) {
        return true;
    }

    // Fallback: check legacy UserPermission table
    const legacyPerm = await (prisma as any).userPermission.findFirst({
        where: {
            userId,
            permission: permissionCode,
        },
    });

    return !!legacyPerm;
}

/**
 * Check if a user has a specific permission using their session permissions array (JWT-cached).
 * Use this for fast checks when you already have the session.
 */
export function hasSessionPermission(session: any, permissionCode: PermissionCode): boolean {
    const permissions: string[] = session?.user?.permissions || [];
    return permissions.includes(permissionCode);
}

/**
 * Server-side guard: requires authentication + specific permission.
 * Throws if not authenticated or not authorized.
 */
export async function requirePermission(permissionCode: PermissionCode) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('UNAUTHENTICATED');

    const userId = session.user.id;
    const allowed = await hasPermission(userId, permissionCode);

    if (!allowed) throw new Error('FORBIDDEN');
    return session;
}

/**
 * Server-side guard: requires authentication + ANY of the specified permissions.
 */
export async function requireAnyPermission(...permissionCodes: PermissionCode[]) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('UNAUTHENTICATED');

    const userId = session.user.id;

    for (const code of permissionCodes) {
        if (await hasPermission(userId, code)) {
            return session;
        }
    }

    throw new Error('FORBIDDEN');
}

/**
 * Get the user's role name from session (for routing/display, NOT authorization).
 */
export function getUserRoleName(session: any): string {
    return (session?.user as any)?.roleName || (session?.user as any)?.role || '';
}

/**
 * Check if user's role name matches (for data scoping/routing, NOT authorization).
 */
export function isRole(session: any, roleName: string): boolean {
    return getUserRoleName(session) === roleName;
}

/**
 * Check if user is an internal/admin role (for routing purposes only).
 */
export function isInternalRole(session: any): boolean {
    const name = getUserRoleName(session);
    return ['SUPER_ADMIN', 'ADMIN', 'OPS', 'CS', 'FINANCE', 'KYC_ANALYST', 'OBSERVER'].includes(name);
}

/**
 * Assert that the session user has one of the allowed roles.
 * Throws structured error if unauthorized.
 */
export function assertRole(session: any, allowedRoles: string[]): void {
    if (!session?.user) throw new Error('UNAUTHORIZED');
    const role = getUserRoleName(session);
    if (!allowedRoles.includes(role)) throw new Error('FORBIDDEN');
}

