/**
 * SOS Policy - Application Layer
 * 
 * Validates SOS trigger conditions without side effects.
 * Pure logic - no persistence, no business logic execution.
 * 
 * SOS is an operational safety net, not a financial or dispute mechanism.
 * SOS must NOT affect trust, wallet, deposit, or refund.
 */

import { TourState } from "@/domain/enums/tour-state.enum";

/**
 * SOS Configuration
 * Admin-configurable settings for SOS window and rules
 */
export interface SOSConfig {
  /**
   * SOS window in minutes before tour start
   * SOS can be triggered up to this many minutes before startDate
   * Default: 30 minutes
   */
  windowMinutesBeforeStart: number;
}

/**
 * Tour data required for SOS validation
 */
export interface TourData {
  id: string;
  status: TourState | string; // Allow string for Prisma enum compatibility
  startDate: Date;
}

/**
 * SOS validation result
 */
export interface SOSValidationResult {
  allowed: boolean;
  reason?: string;
}

export class SOSPolicy {
  /**
   * Validates if SOS can be triggered for a tour
   * 
   * @param tour - Tour data (id, status, startDate)
   * @param currentTime - Current timestamp
   * @param config - SOS configuration (window, etc.)
   * @returns Validation result with allowed flag and optional reason
   */
  static canTriggerSOS(
    tour: TourData,
    currentTime: Date,
    config: SOSConfig
  ): SOSValidationResult {
    // Validate tour state allows SOS
    // SOS can only be triggered when tour is CONFIRMED or IN_PROGRESS
    const tourState = tour.status as TourState;
    const allowedStates = [TourState.CONFIRMED, TourState.IN_PROGRESS];

    if (!allowedStates.includes(tourState)) {
      return {
        allowed: false,
        reason: `SOS can only be triggered when tour is in ${allowedStates.join(" or ")} state. Current state: ${tourState}`,
      };
    }

    // Validate SOS window (must be within window before start)
    const tourStartTime = new Date(tour.startDate);
    const timeUntilStart = tourStartTime.getTime() - currentTime.getTime();
    const windowMs = config.windowMinutesBeforeStart * 60 * 1000;

    // SOS can be triggered up to windowMinutesBeforeStart before start
    // After tour starts, SOS is still allowed (IN_PROGRESS state)
    if (timeUntilStart > windowMs) {
      return {
        allowed: false,
        reason: `SOS can only be triggered within ${config.windowMinutesBeforeStart} minutes before tour start. Tour starts in ${Math.ceil(timeUntilStart / (60 * 1000))} minutes.`,
      };
    }

    // If tour has already started (IN_PROGRESS), SOS is always allowed
    if (timeUntilStart <= 0) {
      // Tour has started or is in progress - SOS allowed
      return {
        allowed: true,
      };
    }

    // Within window before start - SOS allowed
    return {
      allowed: true,
    };
  }

  /**
   * Get default SOS configuration
   * 
   * SAFE DEFAULTS:
   * - SOS window: 30 minutes before tour start
   * - This allows sufficient time for standby guide matching while preventing abuse
   * 
   * This default is a safe fallback when config is not available from database.
   * Admin can override via SOSConfig in database.
   * 
   * @returns Default SOS config (30 minutes window)
   */
  static getDefaultConfig(): SOSConfig {
    return {
      windowMinutesBeforeStart: 30,
    };
  }
}

