/**
 * Refund Policy - Application Layer
 * 
 * Validates refund and dispute rules without side effects.
 * Pure logic - no persistence, no business logic execution.
 * 
 * Refund = return Lunavia Credit (LVC), not real money.
 * Wallet is a neutral ledger and is FROZEN.
 */

import { TourState } from "@/domain/enums/tour-state.enum";
import { AdminRole } from "@prisma/client";

/**
 * Refund Configuration
 * Admin-configurable settings for dispute windows and rules
 */
export interface RefundConfig {
  /**
   * Dispute window for full-day tours (in hours)
   * Disputes can be opened within this window after tour end
   * Default: 12 hours
   */
  fullDayTourDisputeWindowHours: number;

  /**
   * Dispute window for multi-day tours (in hours)
   * Disputes can be opened within this window after tour end
   * Default: 24 hours
   */
  multiDayTourDisputeWindowHours: number;
}

/**
 * Tour data required for dispute validation
 */
export interface TourData {
  id: string;
  status: TourState | string; // Allow string for Prisma enum compatibility
  startDate: Date;
  endDate: Date | null;
  durationHours: number | null;
}

/**
 * Dispute data for approval validation
 */
export interface DisputeData {
  id: string;
  status: string;
  resolution: string | null;
  assignedTo: string | null;
}

/**
 * Dispute validation result
 */
export interface DisputeValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Refund approval validation result
 */
export interface RefundApprovalResult {
  allowed: boolean;
  reason?: string;
  requiresSecondApproval?: boolean;
}

export class RefundPolicy {
  /**
   * Validates if a dispute can be opened for a tour
   * 
   * @param tour - Tour data (id, status, startDate, endDate, durationHours)
   * @param currentTime - Current timestamp
   * @param config - Refund configuration (dispute windows)
   * @param hasActiveDispute - Whether tour already has an active dispute
   * @returns Validation result with allowed flag and optional reason
   */
  static canOpenDispute(
    tour: TourData,
    currentTime: Date,
    config: RefundConfig,
    hasActiveDispute: boolean = false
  ): DisputeValidationResult {
    // Anti-fraud: Only one active dispute per tour
    if (hasActiveDispute) {
      return {
        allowed: false,
        reason: "Tour already has an active dispute. Only one active dispute per tour is allowed.",
      };
    }

    // Validate tour state eligibility for disputes
    // INVARIANT: Disputes can be opened for tours that have issues or failed
    // - DRAFT: Not eligible (tour never started)
    // - CANCELLED: Not eligible (operator cancelled, no service provided)
    // - FAILED: Eligible (tour failed, may need refund)
    // - All other states: Eligible (ongoing or completed tours may have issues)
    const tourState = tour.status as TourState;
    const disallowedStates = [TourState.DRAFT, TourState.CANCELLED];

    if (disallowedStates.includes(tourState)) {
      return {
        allowed: false,
        reason: `Cannot open dispute for tour in ${tourState} state.`,
      };
    }

    // FAILED tours are explicitly eligible for disputes
    // This ensures users can seek refunds when tours fail (e.g., SOS resolution failure)

    // Validate dispute window
    // INVARIANT: Dispute window starts from tour end time
    // - For COMPLETED tours: window starts from endDate
    // - For FAILED tours: window starts from endDate (if set) or current time (if null)
    // - For ongoing tours (no endDate): dispute allowed immediately
    if (!tour.endDate) {
      // Tour hasn't ended yet or FAILED without endDate - dispute can be opened
      // This handles edge case: FAILED tours may not have endDate set
      return {
        allowed: true,
      };
    }

    const tourEndTime = new Date(tour.endDate);
    const timeSinceEnd = currentTime.getTime() - tourEndTime.getTime();

    // Determine dispute window based on tour duration
    const isMultiDay = tour.durationHours && tour.durationHours >= 24;
    const disputeWindowHours = isMultiDay
      ? config.multiDayTourDisputeWindowHours
      : config.fullDayTourDisputeWindowHours;
    const disputeWindowMs = disputeWindowHours * 60 * 60 * 1000;

    if (timeSinceEnd > disputeWindowMs) {
      return {
        allowed: false,
        reason: `Dispute window has expired. Disputes must be opened within ${disputeWindowHours} hours after tour end.`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Validates if a refund can be approved
   * Implements 4-eyes rule: FINANCE (first) + FINANCE_LEAD (second)
   * 
   * NOTE: This policy uses role checks for pure logic validation.
   * Use cases should also verify permissions via PermissionService for action-based access control.
   * 
   * @param dispute - Dispute data
   * @param actorRole - Role of admin attempting approval
   * @param hasFirstApproval - Whether dispute already has first approval (FINANCE)
   * @returns Validation result with allowed flag and approval stage info
   */
  static canApproveRefund(
    dispute: DisputeData,
    actorRole: AdminRole,
    hasFirstApproval: boolean = false
  ): RefundApprovalResult {
    // Check if dispute is in valid state for approval
    const validStatuses = ["PENDING", "IN_REVIEW"];
    if (!validStatuses.includes(dispute.status)) {
      return {
        allowed: false,
        reason: `Dispute is in ${dispute.status} state and cannot be approved.`,
      };
    }

    // 4-eyes rule implementation
    if (!hasFirstApproval) {
      // First approval: Requires FINANCE role
      if (actorRole !== AdminRole.FINANCE && actorRole !== AdminRole.SUPER_ADMIN) {
        return {
          allowed: false,
          reason: "First approval requires FINANCE role. Only FINANCE can provide initial approval.",
        };
      }

      return {
        allowed: true,
        requiresSecondApproval: true, // Needs FINANCE_LEAD approval next
      };
    } else {
      // Second approval: Requires FINANCE_LEAD role
      if (actorRole !== AdminRole.FINANCE_LEAD && actorRole !== AdminRole.SUPER_ADMIN) {
        return {
          allowed: false,
          reason: "Second approval requires FINANCE_LEAD role. Only FINANCE_LEAD can provide final approval.",
        };
      }

      return {
        allowed: true,
        requiresSecondApproval: false, // This is the final approval
      };
    }
  }

  /**
   * Validates if a refund can be rejected
   * 
   * NOTE: This policy uses role checks for pure logic validation.
   * Use cases should also verify permissions via PermissionService for action-based access control.
   * 
   * @param dispute - Dispute data
   * @param actorRole - Role of admin attempting rejection
   * @returns Validation result with allowed flag and optional reason
   */
  static canRejectRefund(
    dispute: DisputeData,
    actorRole: AdminRole
  ): DisputeValidationResult {
    // Check if dispute is in valid state for rejection
    const validStatuses = ["PENDING", "IN_REVIEW"];
    if (!validStatuses.includes(dispute.status)) {
      return {
        allowed: false,
        reason: `Dispute is in ${dispute.status} state and cannot be rejected.`,
      };
    }

    // Rejection requires FINANCE or FINANCE_LEAD role
    const allowedRoles: AdminRole[] = [AdminRole.FINANCE, AdminRole.FINANCE_LEAD, AdminRole.SUPER_ADMIN];
    if (!allowedRoles.includes(actorRole)) {
      return {
        allowed: false,
        reason: "Refund rejection requires FINANCE or FINANCE_LEAD role.",
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Get default refund configuration
   * 
   * SAFE DEFAULTS:
   * - Full-day tours: 12 hours dispute window (reasonable for single-day issues)
   * - Multi-day tours: 24 hours dispute window (allows time to assess multi-day issues)
   * 
   * These defaults are safe fallbacks when config is not available from database.
   * Admin can override via RefundConfig in database.
   * 
   * @returns Default refund config (12h for full-day, 24h for multi-day)
   */
  static getDefaultConfig(): RefundConfig {
    return {
      fullDayTourDisputeWindowHours: 12,
      multiDayTourDisputeWindowHours: 24,
    };
  }
}

