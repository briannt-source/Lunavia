/**
 * Permission Middleware
 * 
 * Generic middleware for permission checking in API routes.
 * Uses PermissionService and action-permission mapping.
 * 
 * Returns NextResponse with 403 if permission check fails.
 * Returns null if permission check passes (continue execution).
 */

import { NextResponse } from "next/server";
import { Session } from "next-auth";
import { PermissionService } from "@/application/services/permission.service";
import { Permission, AdminRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiAction, getRequiredPermission, requiresAdminPermission } from "../permissions/action-permission.map";

/**
 * Check if user has permission for an action
 * 
 * @param session - NextAuth session
 * @param action - API action identifier
 * @returns NextResponse with error if denied, null if allowed
 */
export async function requirePermission(
  session: Session | null,
  action: ApiAction
): Promise<NextResponse | null> {
  // Authentication check
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if action requires admin permission
  if (!requiresAdminPermission(action)) {
    // User-level action - no admin permission required
    return null; // Allow
  }

  // Admin permission required - check role and permission
  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : null;

  if (!adminRole) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  // Get admin user from database
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { role: true, permissions: true },
  });

  if (!adminUser) {
    return NextResponse.json(
      { error: "Admin user not found" },
      { status: 404 }
    );
  }

  // Get required permission for action
  const requiredPermission = getRequiredPermission(action);
  if (!requiredPermission) {
    // Should not happen if requiresAdminPermission returned true
    return NextResponse.json(
      { error: "Invalid permission configuration" },
      { status: 500 }
    );
  }

  // Check permission using PermissionService
  const hasPermission = PermissionService.userHasPermission(
    adminUser.role as AdminRole,
    adminUser.permissions,
    requiredPermission
  );

  if (!hasPermission) {
    return NextResponse.json(
      { error: `Insufficient permissions. Required: ${requiredPermission}` },
      { status: 403 }
    );
  }

  // Permission granted
  return null; // Allow
}

