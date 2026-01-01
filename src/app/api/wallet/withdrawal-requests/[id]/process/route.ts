import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessWithdrawalRequestUseCase } from "@/application/use-cases/wallet/process-withdrawal-request.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is SUPER_ADMIN only
    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;
    
    if (adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can process financial requests" },
        { status: 403 }
      );
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
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



