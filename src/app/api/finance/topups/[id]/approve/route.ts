import { NextRequest, NextResponse } from "next/server";
import { ProcessTopUpRequestUseCase } from "@/application/use-cases/wallet/process-topup-request.use-case";
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

    const useCase = new ProcessTopUpRequestUseCase();
    const result = await useCase.execute({
      adminId: adminUser.id,
      requestId,
      action: "APPROVE",
      adminNotes: body.adminNotes || body.notes || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error approving top-up:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
