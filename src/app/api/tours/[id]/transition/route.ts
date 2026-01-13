/**
 * Tour State Transition API Route
 * 
 * Thin controller - maps request to use case only.
 * No business logic, no validation duplication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { TransitionTourStateUseCase } from "@/application/use-cases/tour/transition-tour-state.use-case";
import { TourState } from "@/domain/enums/tour-state.enum";
import { requirePermission } from "@/interfaces/http/middleware/require-permission";
import { ApiAction } from "@/interfaces/http/permissions/action-permission.map";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication and permission check
    const session = await getServerSession(authOptions);
    const permissionCheck = await requirePermission(session, ApiAction.TOUR_TRANSITION_STATE);
    if (permissionCheck) {
      return permissionCheck;
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();
    const { fromState, toState, reason } = body;

    // Instantiate use case
    const useCase = new TransitionTourStateUseCase();

    // Execute use case (validation handled in use case)
    const result = await useCase.execute({
      actorId: session.user.id,
      tourId,
      fromState: fromState as TourState,
      toState: toState as TourState,
      reason: reason || undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error transitioning tour state:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message?.includes("not found") ? 404 : 500 }
    );
  }
}

