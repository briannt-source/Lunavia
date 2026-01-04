import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { CreateEscrowUseCase } from "@/application/use-cases/escrow/create-escrow.use-case";
import { handleError } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only operators can create escrow
    if (session.user.role !== "TOUR_OPERATOR" && session.user.role !== "TOUR_AGENCY") {
      return NextResponse.json(
        { error: "Only tour operators can create escrow accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { guideId, tourId, standbyRequestId, amount } = body;

    if (!guideId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "guideId and amount (greater than 0) are required" },
        { status: 400 }
      );
    }

    if (!tourId && !standbyRequestId) {
      return NextResponse.json(
        { error: "Either tourId or standbyRequestId is required" },
        { status: 400 }
      );
    }

    const useCase = new CreateEscrowUseCase();
    const result = await useCase.execute({
      operatorId: session.user.id,
      guideId,
      tourId,
      standbyRequestId,
      amount,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

