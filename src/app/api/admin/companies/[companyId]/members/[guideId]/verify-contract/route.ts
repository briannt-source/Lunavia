import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/admin/companies/[companyId]/members/[guideId]/verify-contract
 * Admin verify employment contract for in-house guide
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; guideId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    // Check session role first (from JWT)
    const sessionRole = session.user.role as string;
    const isSessionAdmin = sessionRole?.startsWith("ADMIN_") || 
      sessionRole === "SUPER_ADMIN" || 
      sessionRole === "MODERATOR" || 
      sessionRole === "SUPPORT_STAFF";

    if (!isSessionAdmin) {
      // Check if user is AdminUser in database
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: session.user.id },
      });

      if (
        !adminUser ||
        (adminUser.role !== "SUPER_ADMIN" && adminUser.role !== "MODERATOR")
      ) {
        return NextResponse.json(
          { error: "Only admins can verify contracts" },
          { status: 403 }
        );
      }
    }

    const { companyId, guideId } = await params;
    const body = await req.json();
    const { verified } = body;

    // Get company member
    const member = await prisma.companyMember.findFirst({
      where: {
        companyId,
        userId: guideId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Company member not found" },
        { status: 404 }
      );
    }

    if (!member.employmentContractUrl) {
      return NextResponse.json(
        { error: "Employment contract not uploaded yet" },
        { status: 400 }
      );
    }

    // Update contract verification
    const adminId = (await prisma.adminUser.findUnique({
      where: { id: session.user.id },
    }))
      ? session.user.id
      : null;

    const updatedMember = await prisma.companyMember.update({
      where: { id: member.id },
      data: {
        contractVerified: verified === true,
        contractVerifiedBy: verified === true ? adminId || session.user.id : null,
        contractVerifiedAt: verified === true ? new Date() : null,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        company: true,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    console.error("Error verifying contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify contract" },
      { status: 500 }
    );
  }
}

