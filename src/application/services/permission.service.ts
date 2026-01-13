/**
 * Permission Service - Application Layer
 * 
 * Handles role-permission mapping and permission checks.
 * Application layer service for permission management.
 */

import { AdminRole, Permission } from "@prisma/client";

/**
 * Role-Permission Mapping
 * Defines which permissions each role has by default
 * Permissions can be overridden per user
 */
const ROLE_PERMISSION_MAP: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    // All permissions - Super Admin has everything
    ...Object.values(Permission),
  ],
  MODERATOR: [
    // Trust actions
    Permission.TRUST_ADJUST,
    Permission.TRUST_RESET,
    Permission.TRUST_VIEW_HISTORY,
    // Dispute actions
    Permission.DISPUTE_VIEW,
    Permission.DISPUTE_OPEN,
    Permission.DISPUTE_RESOLVE,
    Permission.DISPUTE_FORCE_CANCEL,
    Permission.DISPUTE_ESCALATE,
    // SOS actions
    Permission.SOS_VIEW,
    Permission.SOS_OPEN,
    Permission.SOS_RESOLVE,
    // User management (limited)
    Permission.USER_VIEW,
    Permission.USER_VIEW_PROFILE,
    Permission.USER_BLOCK,
    Permission.USER_UNBLOCK,
    // Verification
    Permission.VERIFICATION_VIEW,
    Permission.VERIFICATION_APPROVE,
    Permission.VERIFICATION_REJECT,
    // Tour management
    Permission.TOUR_VIEW,
    Permission.TOUR_BLOCK,
    Permission.TOUR_UNBLOCK,
  ],
  OPS_CS: [
    // Dispute actions
    Permission.DISPUTE_VIEW,
    Permission.DISPUTE_OPEN,
    Permission.DISPUTE_RESOLVE,
    // SOS actions
    Permission.SOS_VIEW,
    Permission.SOS_OPEN,
    Permission.SOS_RESOLVE,
    // User management (view only)
    Permission.USER_VIEW,
    Permission.USER_VIEW_PROFILE,
    // Tour management (view only)
    Permission.TOUR_VIEW,
  ],
  FINANCE: [
    // Finance actions (limited)
    Permission.FINANCE_APPROVE_TOPUP,
    Permission.FINANCE_APPROVE_REFUND,
    Permission.FINANCE_VIEW_TRANSACTIONS,
    // Wallet actions
    Permission.WALLET_VIEW,
    Permission.WALLET_TRANSFER,
    // User management (view only)
    Permission.USER_VIEW,
    Permission.USER_VIEW_PROFILE,
  ],
  FINANCE_LEAD: [
    // Finance actions (full)
    Permission.FINANCE_APPROVE_TOPUP,
    Permission.FINANCE_APPROVE_REFUND,
    Permission.FINANCE_ADJUST_CREDIT,
    Permission.FINANCE_VIEW_TRANSACTIONS,
    // Wallet actions
    Permission.WALLET_VIEW,
    Permission.WALLET_TRANSFER,
    Permission.WALLET_ADJUST,
    // Trust (view only)
    Permission.TRUST_VIEW_HISTORY,
    // User management (view only)
    Permission.USER_VIEW,
    Permission.USER_VIEW_PROFILE,
  ],
  SUPPORT_STAFF: [
    // Basic support permissions
    Permission.USER_VIEW,
    Permission.USER_VIEW_PROFILE,
    Permission.USER_RESET_PASSWORD,
    Permission.USER_EDIT_PROFILE,
  ],
};

export class PermissionService {
  /**
   * Get default permissions for a role
   */
  static getDefaultPermissions(role: AdminRole): Permission[] {
    return ROLE_PERMISSION_MAP[role] || [];
  }

  /**
   * Check if a role has a specific permission (by default)
   */
  static roleHasPermission(role: AdminRole, permission: Permission): boolean {
    const defaultPermissions = this.getDefaultPermissions(role);
    return defaultPermissions.includes(permission);
  }

  /**
   * Check if user has permission (considering both role defaults and custom permissions)
   * This is the main method to check permissions - it respects overrides
   */
  static userHasPermission(
    role: AdminRole,
    userPermissions: Permission[],
    permission: Permission
  ): boolean {
    // Super admin has all permissions
    if (role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    // Check if permission is in user's custom permissions (override)
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check if permission is in role's default permissions
    return this.roleHasPermission(role, permission);
  }

  /**
   * Get all permissions available in the system
   */
  static getAllPermissions(): Permission[] {
    return Object.values(Permission);
  }

  /**
   * Get permissions grouped by category (for UI display)
   */
  static getPermissionsByCategory(): Record<string, Permission[]> {
    return {
      Trust: [
        Permission.TRUST_ADJUST,
        Permission.TRUST_RESET,
        Permission.TRUST_VIEW_HISTORY,
      ],
      Finance: [
        Permission.FINANCE_APPROVE_TOPUP,
        Permission.FINANCE_APPROVE_REFUND,
        Permission.FINANCE_ADJUST_CREDIT,
        Permission.FINANCE_VIEW_TRANSACTIONS,
      ],
      Dispute: [
        Permission.DISPUTE_VIEW,
        Permission.DISPUTE_OPEN,
        Permission.DISPUTE_RESOLVE,
        Permission.DISPUTE_FORCE_CANCEL,
        Permission.DISPUTE_ESCALATE,
      ],
      SOS: [
        Permission.SOS_VIEW,
        Permission.SOS_OPEN,
        Permission.SOS_RESOLVE,
      ],
      "User Management": [
        Permission.USER_VIEW,
        Permission.USER_BLOCK,
        Permission.USER_UNBLOCK,
        Permission.USER_DELETE,
        Permission.USER_RESET_PASSWORD,
        Permission.USER_VIEW_PROFILE,
        Permission.USER_EDIT_PROFILE,
      ],
      Verification: [
        Permission.VERIFICATION_VIEW,
        Permission.VERIFICATION_APPROVE,
        Permission.VERIFICATION_REJECT,
      ],
      "Tour Management": [
        Permission.TOUR_VIEW,
        Permission.TOUR_BLOCK,
        Permission.TOUR_UNBLOCK,
        Permission.TOUR_DELETE,
      ],
      Wallet: [
        Permission.WALLET_VIEW,
        Permission.WALLET_TRANSFER,
        Permission.WALLET_ADJUST,
      ],
    };
  }

  /**
   * Check if user has any of the required permissions
   */
  static userHasAnyPermission(
    role: AdminRole,
    userPermissions: Permission[],
    requiredPermissions: Permission[]
  ): boolean {
    return requiredPermissions.some((permission) =>
      this.userHasPermission(role, userPermissions, permission)
    );
  }

  /**
   * Check if user has all of the required permissions
   */
  static userHasAllPermissions(
    role: AdminRole,
    userPermissions: Permission[],
    requiredPermissions: Permission[]
  ): boolean {
    return requiredPermissions.every((permission) =>
      this.userHasPermission(role, userPermissions, permission)
    );
  }
}

