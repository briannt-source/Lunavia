import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { RefundEscrowUseCase } from "@/application/use-cases/escrow/refund-escrow.use-case";
import { handleError } from "@/lib/error-handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only operators can refund escrow
    if (session.user.role !== "TOUR_OPERATOR" && session.user.role !== "TOUR_AGENCY") {
      return NextResponse.json(
        { error: "Only tour operators can refund escrow accounts" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    const useCase = new RefundEscrowUseCase();
    const result = await useCase.execute({
      escrowAccountId: id,
      operatorId: session.user.id,
      reason,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

