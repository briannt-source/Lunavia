import { NextRequest, NextResponse } from "next/server";
import { ProcessTopUpRequestUseCase } from "@/application/use-cases/wallet/process-topup-request.use-case";
import { checkPermission } from "@/lib/permission-helpers";
import { Permission } from "@prisma/client";

/** POST /api/admin/payments/:id/approve — Approve a payment */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { hasPermission, adminUser } = await checkPermission(Permission.FINANCE_APPROVE_TOPUP);
    if (!hasPermission || !adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const useCase = new ProcessTopUpRequestUseCase();
    const result = await useCase.execute({
      adminId: adminUser.id, requestId: id, action: "APPROVE", adminNotes: body.notes || "",
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
