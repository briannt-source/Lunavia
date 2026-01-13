/**
 * Open Dispute API Route
 * 
 * Thin controller - maps request to use case only.
 * No business logic, no validation duplication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { OpenDisputeUseCase } from "@/application/use-cases/refund/open-dispute.use-case";
import { PrismaAuditLogRepository } from "@/infrastructure/repositories";
import { DisputeType } from "@prisma/client";
import { requirePermission } from "@/interfaces/http/middleware/require-permission";
import { ApiAction } from "@/interfaces/http/permissions/action-permission.map";

export async function POST(req: NextRequest) {
  try {
    // Authentication and permission check
    const session = await getServerSession(authOptions);
    const permissionCheck = await requirePermission(session, ApiAction.OPEN_DISPUTE);
    if (permissionCheck) {
      return permissionCheck;
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tourId, reason, type, evidence } = body;

    // Instantiate dependencies
    const auditLogRepository = new PrismaAuditLogRepository();
    const useCase = new OpenDisputeUseCase(auditLogRepository);

    // Execute use case (validation handled in use case)
    const result = await useCase.execute({
      actorId: session.user.id,
      tourId,
      reason,
      type: type as DisputeType,
      evidence: evidence || undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error opening dispute:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message?.includes("not found") ? 404 : 500 }
    );
  }
}
