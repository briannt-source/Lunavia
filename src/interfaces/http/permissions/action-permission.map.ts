/**
 * Action → Permission Mapping
 * 
 * Central source of truth for API action to permission mapping.
 * Used by permission middleware to enforce access control.
 * 
 * Actions are API-level identifiers (e.g., "APPROVE_REFUND").
 * Permissions are database-level enums (e.g., Permission.FINANCE_APPROVE_REFUND).
 */

import { Permission } from "@prisma/client";

/**
 * API Action identifiers
 * These correspond to API route actions, not use case names
 */
export enum ApiAction {
  // Tour actions (user-level, no permission required)
  TOUR_TRANSITION_STATE = "TOUR_TRANSITION_STATE",
  TRIGGER_SOS = "TRIGGER_SOS",
  
  // Dispute actions (user-level, no permission required)
  OPEN_DISPUTE = "OPEN_DISPUTE",
  
  // Refund actions (admin-level, requires permission)
  APPROVE_REFUND = "APPROVE_REFUND",
  REJECT_REFUND = "REJECT_REFUND",
}

/**
 * Action → Permission mapping
 * 
 * Maps API actions to required permissions.
 * Actions without entries are user-level and don't require admin permissions.
 */
export const ACTION_PERMISSION_MAP: Record<ApiAction, Permission | null> = {
  // User-level actions (no admin permission required)
  [ApiAction.TOUR_TRANSITION_STATE]: null,
  [ApiAction.TRIGGER_SOS]: null,
  [ApiAction.OPEN_DISPUTE]: null,
  
  // Admin-level actions (require permission)
  [ApiAction.APPROVE_REFUND]: Permission.FINANCE_APPROVE_REFUND,
  [ApiAction.REJECT_REFUND]: Permission.FINANCE_APPROVE_REFUND,
};

/**
 * Get required permission for an action
 * 
 * @param action - API action identifier
 * @returns Required permission, or null if action doesn't require admin permission
 */
export function getRequiredPermission(action: ApiAction): Permission | null {
  return ACTION_PERMISSION_MAP[action] || null;
}

/**
 * Check if an action requires admin permission
 * 
 * @param action - API action identifier
 * @returns True if action requires admin permission
 */
export function requiresAdminPermission(action: ApiAction): boolean {
  return ACTION_PERMISSION_MAP[action] !== null;
}

