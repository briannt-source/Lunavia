/**
 * Permission Helpers - Infrastructure/Presentation Layer
 * 
 * Helper functions for checking permissions in API routes and middleware.
 * These functions interact with the database (infrastructure concern).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { PermissionService } from "@/application/services/permission.service";
import { AdminRole, Permission } from "@prisma/client";

/**
 * Get admin user with permissions from session
 * Returns null if not an admin user
 */
export async function getAdminUserFromSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : role;

  // Check if it's a valid admin role
  if (!Object.values(AdminRole).includes(adminRole as AdminRole)) {
    return null;
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
  });

  return adminUser;
}

/**
 * Check if current user has a specific permission
 * Returns { hasPermission: boolean, adminUser: AdminUser | null }
 */
export async function checkPermission(
  permission: Permission
): Promise<{ hasPermission: boolean; adminUser: any | null }> {
  const adminUser = await getAdminUserFromSession();
  
  if (!adminUser) {
    return { hasPermission: false, adminUser: null };
  }

  const hasPermission = PermissionService.userHasPermission(
    adminUser.role,
    adminUser.permissions,
    permission
  );

  return { hasPermission, adminUser };
}

/**
 * Check if current user has any of the required permissions
 */
export async function checkAnyPermission(
  permissions: Permission[]
): Promise<{ hasPermission: boolean; adminUser: any | null }> {
  const adminUser = await getAdminUserFromSession();
  
  if (!adminUser) {
    return { hasPermission: false, adminUser: null };
  }

  const hasPermission = PermissionService.userHasAnyPermission(
    adminUser.role,
    adminUser.permissions,
    permissions
  );

  return { hasPermission, adminUser };
}

/**
 * Check if current user has all of the required permissions
 */
export async function checkAllPermissions(
  permissions: Permission[]
): Promise<{ hasPermission: boolean; adminUser: any | null }> {
  const adminUser = await getAdminUserFromSession();
  
  if (!adminUser) {
    return { hasPermission: false, adminUser: null };
  }

  const hasPermission = PermissionService.userHasAllPermissions(
    adminUser.role,
    adminUser.permissions,
    permissions
  );

  return { hasPermission, adminUser };
}

