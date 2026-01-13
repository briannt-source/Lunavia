/**
 * Transition Tour State Use Case
 * 
 * Handles tour state transitions with policy-driven validation.
 * Application layer use case - orchestrates domain logic and persistence.
 */

import { prisma } from "@/lib/prisma";
import { TourState } from "@/domain/enums/tour-state.enum";
import { TourLifecyclePolicy } from "@/application/policies/tour-lifecycle.policy";

export interface TransitionTourStateInput {
  actorId: string; // User ID performing the transition
  tourId: string;
  fromState: TourState;
  toState: TourState;
  reason?: string; // Optional reason for transition
}

export interface TransitionTourStateOutput {
  tourId: string;
  previousState: TourState;
  newState: TourState;
  transitionAllowed: boolean;
}

export class TransitionTourStateUseCase {
  async execute(input: TransitionTourStateInput): Promise<TransitionTourStateOutput> {
    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { id: input.tourId },
      select: {
        id: true,
        status: true,
        operatorId: true,
      },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    // Verify current state matches fromState
    // Note: Mapping between TourState (domain) and TourStatus (Prisma) will be handled
    // For MVP, we validate using TourState enum
    const currentState = tour.status as TourState;
    
    if (currentState !== input.fromState) {
      throw new Error(
        `Tour current state (${currentState}) does not match expected fromState (${input.fromState})`
      );
    }

    // Validate transition using policy
    const validation = TourLifecyclePolicy.canTransition(
      input.fromState,
      input.toState
    );

    if (!validation.allowed) {
      throw new Error(
        validation.reason || `Transition from ${input.fromState} to ${input.toState} is not allowed`
      );
    }

    // Check if target state is terminal
    if (TourLifecyclePolicy.isTerminalState(input.toState)) {
      // Terminal state - no further transitions allowed
      // This is informational, transition is still valid
    }

    // Update tour state
    // Note: In MVP, we store TourState value as string in status field
    // Future: Schema may be updated to have separate state field or map TourStatus to TourState
    await prisma.tour.update({
      where: { id: input.tourId },
      data: {
        status: input.toState as any, // Map TourState to TourStatus (handled by Prisma)
      },
    });

    // Emit domain event hook (infrastructure will implement)
    // This is a placeholder for future event-driven architecture
    // console.log("DOMAIN_EVENT_HOOK: TOUR_STATE_TRANSITIONED", {
    //   tourId: input.tourId,
    //   fromState: input.fromState,
    //   toState: input.toState,
    //   actorId: input.actorId,
    //   reason: input.reason,
    //   timestamp: new Date(),
    // });

    return {
      tourId: input.tourId,
      previousState: input.fromState,
      newState: input.toState,
      transitionAllowed: true,
    };
  }
}

