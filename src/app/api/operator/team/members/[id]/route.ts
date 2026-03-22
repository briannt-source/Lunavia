import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/operator/team/members/[id]
 * Remove a member from the company
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: memberId } = await params;

    // Find operator's company
    const company = await prisma.company.findUnique({
      where: { operatorId: session.user.id },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Find the member
    const member = await prisma.companyMember.findFirst({
      where: { id: memberId, companyId: company.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found in your company" }, { status: 404 });
    }

    // Cannot remove yourself (owner)
    if (member.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot remove yourself from the company" }, { status: 400 });
    }

    // Cannot remove OWNER
    if (member.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove the company owner" }, { status: 400 });
    }

    await prisma.companyMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true, message: "Member removed from company" });
  } catch (error: any) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
