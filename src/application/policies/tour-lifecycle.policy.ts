/**
 * Tour Lifecycle Policy
 * 
 * Application layer policy for tour state transitions.
 * Encapsulates allowed state transitions without side effects.
 * No persistence, no business logic execution.
 */

import { TourState } from "@/domain/enums/tour-state.enum";

export interface TourTransitionContext {
  // Optional context for future validation (e.g., time windows, actor roles)
  // Not used in MVP but available for extension
  [key: string]: any;
}

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
}

export class TourLifecyclePolicy {
  /**
   * Validates if a state transition is allowed
   * 
   * @param fromState - Current tour state
   * @param toState - Target tour state
   * @param context - Optional context for validation (not used in MVP)
   * @returns Validation result with allowed flag and optional reason
   */
  static canTransition(
    fromState: TourState,
    toState: TourState,
    context?: TourTransitionContext
  ): TransitionValidationResult {
    // Same state transition is not allowed
    if (fromState === toState) {
      return {
        allowed: false,
        reason: "Cannot transition to the same state",
      };
    }

    // Define allowed transitions
    const allowedTransitions: Record<TourState, TourState[]> = {
      [TourState.DRAFT]: [TourState.PUBLISHED, TourState.CANCELLED],
      [TourState.PUBLISHED]: [TourState.ASSIGNED, TourState.CANCELLED],
      [TourState.ASSIGNED]: [TourState.CONFIRMED, TourState.CANCELLED],
      [TourState.CONFIRMED]: [TourState.IN_PROGRESS, TourState.CANCELLED],
      [TourState.IN_PROGRESS]: [TourState.COMPLETED, TourState.CANCELLED, TourState.FAILED],
      [TourState.COMPLETED]: [], // Terminal state
      [TourState.CANCELLED]: [], // Terminal state
      [TourState.FAILED]: [], // Terminal state
    };

    const allowedTargetStates = allowedTransitions[fromState] || [];

    if (!allowedTargetStates.includes(toState)) {
      return {
        allowed: false,
        reason: `Transition from ${fromState} to ${toState} is not allowed. Allowed transitions: ${allowedTargetStates.join(", ") || "none (terminal state)"}`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Check if a state is terminal (no further transitions allowed)
   * 
   * @param state - Tour state to check
   * @returns True if state is terminal
   */
  static isTerminalState(state: TourState): boolean {
    return [TourState.COMPLETED, TourState.CANCELLED, TourState.FAILED].includes(state);
  }

  /**
   * Get all allowed target states for a given source state
   * 
   * @param fromState - Source tour state
   * @returns Array of allowed target states
   */
  static getAllowedTargetStates(fromState: TourState): TourState[] {
    const allowedTransitions: Record<TourState, TourState[]> = {
      [TourState.DRAFT]: [TourState.PUBLISHED, TourState.CANCELLED],
      [TourState.PUBLISHED]: [TourState.ASSIGNED, TourState.CANCELLED],
      [TourState.ASSIGNED]: [TourState.CONFIRMED, TourState.CANCELLED],
      [TourState.CONFIRMED]: [TourState.IN_PROGRESS, TourState.CANCELLED],
      [TourState.IN_PROGRESS]: [TourState.COMPLETED, TourState.CANCELLED, TourState.FAILED],
      [TourState.COMPLETED]: [],
      [TourState.CANCELLED]: [],
      [TourState.FAILED]: [],
    };

    return allowedTransitions[fromState] || [];
  }
}

