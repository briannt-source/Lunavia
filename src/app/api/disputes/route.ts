import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { CreateDisputeUseCase } from "@/application/use-cases/dispute/create-dispute.use-case";
import { DisputeService } from "@/domain/services/dispute.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tourId,
      applicationId,
      paymentId,
      escrowAccountId,
      type,
      description,
      evidence,
    } = body;

    const useCase = new CreateDisputeUseCase();
    const dispute = await useCase.execute({
      userId: session.user.id,
      tourId,
      applicationId,
      paymentId,
      escrowAccountId,
      type,
      description,
      evidence: evidence || [],
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (error: any) {
    console.error("Error creating dispute:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create dispute" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tourId = searchParams.get("tourId");
    const status = searchParams.get("status") as any;
    const type = searchParams.get("type") as any;

    // Users can only see their own disputes unless they're admin
    const role = (session.user as any)?.role;
    const isAdmin = role && (role.startsWith("ADMIN_") || role === "SUPER_ADMIN" || role === "MODERATOR");

    const disputes = await DisputeService.listDisputes({
      userId: isAdmin ? undefined : session.user.id,
      tourId: tourId || undefined,
      status,
      type,
    });

    return NextResponse.json(disputes);
  } catch (error: any) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

