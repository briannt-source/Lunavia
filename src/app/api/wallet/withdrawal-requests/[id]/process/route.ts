import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProcessWithdrawalRequestUseCase } from "@/application/use-cases/wallet/process-withdrawal-request.use-case";
import { checkPermission } from "@/lib/permission-helpers";
import { Permission } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission instead of role
    const { hasPermission, adminUser } = await checkPermission(
      Permission.FINANCE_APPROVE_REFUND
    );

    if (!hasPermission || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;
    const body = await req.json();

    const useCase = new ProcessWithdrawalRequestUseCase();
    const result = await useCase.execute({
      adminId: adminUser.id,
      requestId,
      action: body.action,
      adminNotes: body.adminNotes,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing withdrawal request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



