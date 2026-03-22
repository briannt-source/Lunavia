import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { CompanyMemberRole } from "@prisma/client";

/**
 * PUT /api/operator/team/members/[id]/role
 * Change a company member's role (OWNER only, or MANAGER for non-OWNER roles)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: memberId } = await params;
    const body = await req.json();
    const { role: newRole } = body;

    if (!newRole || !Object.values(CompanyMemberRole).includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find operator's company
    const company = await prisma.company.findUnique({
      where: { operatorId: session.user.id },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Find the member to update
    const member = await prisma.companyMember.findFirst({
      where: { id: memberId, companyId: company.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found in your company" }, { status: 404 });
    }

    // Cannot change OWNER role (operator is always owner)
    if (member.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change the owner's role" }, { status: 400 });
    }

    // Cannot assign OWNER to someone else
    if (newRole === "OWNER") {
      return NextResponse.json({ error: "Cannot assign owner role" }, { status: 400 });
    }

    const updated = await prisma.companyMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    console.error("Error changing member role:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
