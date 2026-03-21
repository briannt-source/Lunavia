/**
 * Transition Tour State Use Case
 * 
 * Handles tour state transitions with policy-driven validation.
 * Application layer use case - orchestrates domain logic and persistence.
 *
 * Side-effects on transition:
 *   → IN_PROGRESS: schedules safety check-ins from itinerary
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
  checkInsScheduled?: number;
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

    // Update tour state
    await prisma.tour.update({
      where: { id: input.tourId },
      data: {
        status: input.toState as any,
      },
    });

    // ── Post-transition side effects (best-effort) ──

    let checkInsScheduled = 0;

    // Log timeline event
    try {
      await prisma.tourTimelineEvent.create({
        data: {
          tourId: input.tourId,
          actorId: input.actorId,
          actorRole: "OPERATOR",
          eventType: `STATE_${input.toState}`,
          title: `Tour transitioned to ${input.toState}`,
          description: input.reason || null,
        },
      });
    } catch (err) {
      console.error("[TransitionUseCase] Timeline event failed:", err);
    }

    // When tour → IN_PROGRESS: schedule safety check-ins
    if (input.toState === TourState.IN_PROGRESS) {
      try {
        const { SafetyCheckInService } = await import(
          "@/domain/services/safety-checkin.service"
        );
        const { getAllAssignedGuideIds } = await import("@/lib/tour-compat");

        // Find all assigned guides for this tour
        const guideIds = await getAllAssignedGuideIds(input.tourId);

        for (const guideId of guideIds) {
          const result = await SafetyCheckInService.scheduleFromItinerary(
            input.tourId,
            guideId
          );
          checkInsScheduled += result.checkIns.length;
        }

        console.log(
          `[TransitionUseCase] Tour ${input.tourId} → IN_PROGRESS: ${checkInsScheduled} check-ins scheduled for ${guideIds.length} guide(s)`
        );
      } catch (err) {
        // Best-effort: don't block state transition
        console.error("[TransitionUseCase] Check-in scheduling failed:", err);
      }
    }

    return {
      tourId: input.tourId,
      previousState: input.fromState,
      newState: input.toState,
      transitionAllowed: true,
      checkInsScheduled,
    };
  }
}

