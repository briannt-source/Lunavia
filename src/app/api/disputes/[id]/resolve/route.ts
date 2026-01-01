import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ResolveDisputeUseCase } from "@/application/use-cases/dispute/resolve-dispute.use-case";

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

    const canResolve =
      adminRole === "MODERATOR" ||
      adminRole === "SUPER_ADMIN" ||
      adminRole === "SUPPORT_STAFF";

    if (!canResolve) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { resolution, resolutionAmount, resolutionNotes } = body;

    if (!resolution) {
      return NextResponse.json(
        { message: "Resolution is required" },
        { status: 400 }
      );
    }

    // Get admin user ID
    const { prisma } = await import("@/lib/prisma");
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email || "" },
    });

    if (!adminUser) {
      return NextResponse.json({ message: "Admin user not found" }, { status: 403 });
    }

    const useCase = new ResolveDisputeUseCase();
    const dispute = await useCase.execute({
      disputeId: id,
      resolvedBy: adminUser.id,
      resolution: resolution as any, // Type assertion for enum
      resolutionAmount,
      resolutionNotes,
    });

    return NextResponse.json(dispute);
  } catch (error: any) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { message: error.message || "Failed to resolve dispute" },
      { status: 400 }
    );
  }
}

