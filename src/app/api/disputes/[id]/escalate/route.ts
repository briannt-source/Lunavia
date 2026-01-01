import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { EscalateDisputeUseCase } from "@/application/use-cases/dispute/escalate-dispute.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const adminRole = role?.startsWith("ADMIN_")
      ? role.replace("ADMIN_", "")
      : role;

    const canEscalate =
      adminRole === "MODERATOR" ||
      adminRole === "SUPER_ADMIN" ||
      adminRole === "SUPPORT_STAFF";

    if (!canEscalate) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get admin user ID
    const { prisma } = await import("@/lib/prisma");
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email || "" },
    });

    if (!adminUser) {
      return NextResponse.json({ message: "Admin user not found" }, { status: 403 });
    }

    const useCase = new EscalateDisputeUseCase();
    const dispute = await useCase.execute({
      disputeId: id,
      escalatedBy: adminUser.id,
    });

    return NextResponse.json(dispute);
  } catch (error: any) {
    console.error("Error escalating dispute:", error);
    return NextResponse.json(
      { message: error.message || "Failed to escalate dispute" },
      { status: 400 }
    );
  }
}

