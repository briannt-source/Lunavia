/**
 * Reject Refund API Route
 * 
 * Thin controller - maps request to use case only.
 * No business logic, no validation duplication.
 * 
 * Permission check: FINANCE_APPROVE_REFUND (checked in use case)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { RejectRefundUseCase } from "@/application/use-cases/refund/reject-refund.use-case";
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
    const permissionCheck = await requirePermission(session, ApiAction.REJECT_REFUND);
    if (permissionCheck) {
      return permissionCheck;
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: disputeId } = await params;
    const body = await req.json();
    const { reason } = body;

    // Instantiate dependencies
    const auditLogRepository = new PrismaAuditLogRepository();
    const useCase = new RejectRefundUseCase(auditLogRepository);

    // Execute use case (validation handled in use case)
    const result = await useCase.execute({
      actorId: session.user.id,
      disputeId,
      reason,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error rejecting refund:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message?.includes("not found") ? 404 : 500 }
    );
  }
}
