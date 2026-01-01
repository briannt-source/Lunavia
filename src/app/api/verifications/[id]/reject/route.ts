import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RejectVerificationUseCase } from "@/application/use-cases/verification/reject-verification.use-case";

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
        { error: "Only admins can reject verifications" },
        { status: 403 }
      );
    }

    const { id: verificationId } = await params;
    const body = await req.json();

    if (!body.adminNotes || body.adminNotes.trim().length === 0) {
      return NextResponse.json(
        { error: "Admin notes are required for rejection" },
        { status: 400 }
      );
    }

    const useCase = new RejectVerificationUseCase();
    const verification = await useCase.execute({
      adminId: adminUser.id,
      verificationId,
      adminNotes: body.adminNotes,
    });

    return NextResponse.json(verification);
  } catch (error: any) {
    console.error("Error rejecting verification:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}








