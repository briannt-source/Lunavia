/**
 * Trust Rules Policy - Application Layer
 * 
 * Interprets trust scores and decides on actions based on admin-configurable rules.
 * This is a POLICY, not domain logic.
 * 
 * Responsibilities:
 * - Map trustScore → display status (GOOD/AT_RISK/RESTRICTED)
 * - Decide if action is allowed/blocked
 * - Determine if warning should be shown
 * 
 * NOTE: This policy does NOT:
 * - Write to database
 * - Emit notifications
 * - Handle UI logic
 * - Mutate trust scores
 */

/**
 * Trust status for display (UI-friendly)
 */
export enum TrustStatus {
  GOOD = "GOOD",
  AT_RISK = "AT_RISK",
  RESTRICTED = "RESTRICTED",
}

/**
 * Actions that can be checked against trust score
 */
export enum TrustAction {
  CREATE_TOUR = "CREATE_TOUR",
  APPLY_TOUR = "APPLY_TOUR",
  WITHDRAW_REFUND = "WITHDRAW_REFUND",
  USE_SOS = "USE_SOS",
}

/**
 * TrustConfig type (from Prisma)
 * This is the shape of TrustConfig model - policy receives it as parameter
 */
export interface TrustConfig {
  goodMin: number;
  atRiskMin: number;
  restrictedMax: number;
  blockCreateTourBelow: number;
  blockApplyTourBelow: number;
}

export interface CanPerformActionParams {
  score: number;
  action: TrustAction;
  config: TrustConfig;
}

export interface CanPerformActionResult {
  allowed: boolean;
  reason?: string;
}

export class TrustRulesPolicy {
  /**
   * Resolve trust status from score using config
   * 
   * Rules:
   * - score >= config.goodMin → GOOD
   * - score >= config.atRiskMin → AT_RISK
   * - else → RESTRICTED
   * 
   * @param score - Trust score (0-100)
   * @param config - TrustConfig from database
   * @returns TrustStatus
   */
  static resolveTrustStatus(score: number, config: TrustConfig): TrustStatus {
    if (score >= config.goodMin) {
      return TrustStatus.GOOD;
    } else if (score >= config.atRiskMin) {
      return TrustStatus.AT_RISK;
    } else {
      return TrustStatus.RESTRICTED;
    }
  }

  /**
   * Check if user can perform action based on trust score
   * 
   * Rules:
   * - CREATE_TOUR → block if score < blockCreateTourBelow
   * - APPLY_TOUR → block if score < blockApplyTourBelow
   * - WITHDRAW_REFUND → always allowed (finance handles later)
   * - USE_SOS → allowed even if RESTRICTED
   * 
   * @param params - Action check parameters
   * @returns Allowed status and optional reason
   */
  static canPerformAction(
    params: CanPerformActionParams
  ): CanPerformActionResult {
    const { score, action, config } = params;

    // Validate score range
    if (score < 0 || score > 100) {
      return {
        allowed: false,
        reason: "Invalid trust score",
      };
    }

    switch (action) {
      case TrustAction.CREATE_TOUR:
        if (score < config.blockCreateTourBelow) {
          return {
            allowed: false,
            reason: `Trust score must be at least ${config.blockCreateTourBelow} to create tours`,
          };
        }
        return { allowed: true };

      case TrustAction.APPLY_TOUR:
        if (score < config.blockApplyTourBelow) {
          return {
            allowed: false,
            reason: `Trust score must be at least ${config.blockApplyTourBelow} to apply to tours`,
          };
        }
        return { allowed: true };

      case TrustAction.WITHDRAW_REFUND:
        // Always allowed - finance layer handles validation
        return { allowed: true };

      case TrustAction.USE_SOS:
        // Always allowed - even if RESTRICTED, users can use SOS
        return { allowed: true };

      default:
        return {
          allowed: false,
          reason: `Unknown action: ${action}`,
        };
    }
  }

  /**
   * Check if warning banner should be shown
   * 
   * Rule:
   * - score < config.goodMin → show warning banner
   * 
   * @param score - Trust score (0-100)
   * @param config - TrustConfig from database
   * @returns true if warning should be shown
   */
  static shouldShowWarning(score: number, config: TrustConfig): boolean {
    return score < config.goodMin;
  }

  /**
   * Get human-readable status label (for UI)
   * 
   * @param status - TrustStatus
   * @returns Display label
   */
  static getStatusLabel(status: TrustStatus): string {
    switch (status) {
      case TrustStatus.GOOD:
        return "Good";
      case TrustStatus.AT_RISK:
        return "At Risk";
      case TrustStatus.RESTRICTED:
        return "Restricted";
      default:
        return "Unknown";
    }
  }

  /**
   * Get status color (for UI badges)
   * 
   * @param status - TrustStatus
   * @returns Color class or hex
   */
  static getStatusColor(status: TrustStatus): string {
    switch (status) {
      case TrustStatus.GOOD:
        return "green";
      case TrustStatus.AT_RISK:
        return "yellow";
      case TrustStatus.RESTRICTED:
        return "red";
      default:
        return "gray";
    }
  }
}

