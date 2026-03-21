import { NextRequest, NextResponse } from "next/server";
import { ProcessWithdrawalRequestUseCase } from "@/application/use-cases/wallet/process-withdrawal-request.use-case";
import { checkPermission } from "@/lib/permission-helpers";
import { Permission } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { hasPermission, adminUser } = await checkPermission(Permission.FINANCE_APPROVE_TOPUP);
    if (!hasPermission || !adminUser) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { id: requestId } = await params;
    const body = await req.json().catch(() => ({}));

    const useCase = new ProcessWithdrawalRequestUseCase();
    const result = await useCase.execute({
      adminId: adminUser.id,
      requestId,
      action: "REJECT",
      adminNotes: body.adminNotes || body.notes || body.reason || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error rejecting withdrawal:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
