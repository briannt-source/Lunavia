import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PayGuideForTourUseCase } from "@/application/use-cases/wallet/pay-guide-for-tour.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();
    const { guideId, amount } = body;

    if (!guideId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid guideId or amount" },
        { status: 400 }
      );
    }

    const useCase = new PayGuideForTourUseCase();
    const payment = await useCase.execute({
      operatorId: session.user.id,
      tourId,
      guideId,
      amount,
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("Error paying guide:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}








