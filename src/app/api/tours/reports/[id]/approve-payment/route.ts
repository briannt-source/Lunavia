import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ApprovePaymentRequestUseCase } from "@/application/use-cases/tour-report/approve-payment-request.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;

    const useCase = new ApprovePaymentRequestUseCase();
    const report = await useCase.execute({
      operatorId: session.user.id,
      reportId,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error approving payment request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














