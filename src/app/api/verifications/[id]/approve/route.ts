import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { ApproveVerificationUseCase } from "@/application/use-cases/verification/approve-verification.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Only admins can approve verifications" },
        { status: 403 }
      );
    }

    const { id: verificationId } = await params;
    const body = await req.json();

    const useCase = new ApproveVerificationUseCase();
    const verification = await useCase.execute({
      adminId: adminUser.id,
      verificationId,
      adminNotes: body.adminNotes,
    });

    return NextResponse.json(verification);
  } catch (error: any) {
    console.error("Error approving verification:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









