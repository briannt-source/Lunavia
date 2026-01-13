/**
 * Approve Refund API Route
 * 
 * Thin controller - maps request to use case only.
 * No business logic, no validation duplication.
 * 
 * Permission check: FINANCE_APPROVE_REFUND (checked in use case)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ApproveRefundUseCase } from "@/application/use-cases/refund/approve-refund.use-case";
import { PrismaAuditLogRepository } from "@/infrastructure/repositories";
import { requirePermission } from "@/interfaces/http/middleware/require-permission";
import { ApiAction } from "@/interfaces/http/permissions/action-permission.map";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication and permission check
    const session = await getServerSession(authOptions);
    const permissionCheck = await requirePermission(session, ApiAction.APPROVE_REFUND);
    if (permissionCheck) {
      return permissionCheck;
    }

    const { id: disputeId } = await params;

    // Instantiate dependencies
    const auditLogRepository = new PrismaAuditLogRepository();
    const useCase = new ApproveRefundUseCase(auditLogRepository);

    // Execute use case
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await useCase.execute({
      actorId: session.user.id,
      disputeId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error approving refund:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message?.includes("not found") ? 404 : 500 }
    );
  }
}

