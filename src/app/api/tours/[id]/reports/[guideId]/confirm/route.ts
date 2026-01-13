import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ConfirmTourAndLockPaymentUseCase } from "@/application/use-cases/tour-report/confirm-tour-and-lock-payment.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guideId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId, guideId } = await params;
    const body = await req.json();

    // Verify operator role
    if (!["TOUR_OPERATOR", "TOUR_AGENCY"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only tour operators can confirm tours" },
        { status: 403 }
      );
    }

    const useCase = new ConfirmTourAndLockPaymentUseCase();
    const result = await useCase.execute({
      operatorId: session.user.id,
      tourId,
      guideId,
      paymentAmount: body.paymentAmount,
      notes: body.notes,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error confirming tour and locking payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












