import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { RequestPaymentUseCase } from "@/application/use-cases/tour-report/request-payment.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can request payment" },
        { status: 403 }
      );
    }

    const { id: tourId } = await params;

    const useCase = new RequestPaymentUseCase();
    const result = await useCase.execute({
      guideId: session.user.id,
      tourId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error requesting payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}







