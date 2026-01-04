import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { LockEscrowUseCase } from "@/application/use-cases/escrow/lock-escrow.use-case";
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

    // Only operators can lock escrow
    if (session.user.role !== "TOUR_OPERATOR" && session.user.role !== "TOUR_AGENCY") {
      return NextResponse.json(
        { error: "Only tour operators can lock escrow accounts" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const useCase = new LockEscrowUseCase();
    const result = await useCase.execute({
      escrowAccountId: id,
      operatorId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

