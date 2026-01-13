import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProcessTopUpRequestUseCase } from "@/application/use-cases/wallet/process-topup-request.use-case";
import { checkPermission } from "@/lib/permission-helpers";
import { Permission } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission instead of role
    const { hasPermission, adminUser } = await checkPermission(
      Permission.FINANCE_APPROVE_TOPUP
    );

    if (!hasPermission || !adminUser) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;
    const body = await req.json();

    const useCase = new ProcessTopUpRequestUseCase();
    const result = await useCase.execute({
      adminId: adminUser.id,
      requestId,
      action: body.action,
      adminNotes: body.adminNotes,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing top-up request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



