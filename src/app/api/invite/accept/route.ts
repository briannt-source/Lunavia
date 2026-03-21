import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/invite/accept — Accept an invitation (company invite, tour invite, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const body = await req.json().catch(() => ({}));
    const inviteToken = token || body.token;

    if (!inviteToken) {
      return NextResponse.json({ error: "Invitation token is required" }, { status: 400 });
    }

    // Try finding a company invitation with this token
    const invitation = await prisma.companyInvitation.findFirst({
      where: {
        token: inviteToken,
        status: "PENDING",
      },
      include: { company: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    // Accept the invitation
    await prisma.companyInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    // Add user as company member
    await prisma.companyMember.create({
      data: {
        companyId: invitation.companyId,
        userId: session.user.id,
        role: "GUIDE",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have joined ${invitation.company.name}`,
      companyId: invitation.companyId,
    });
  } catch (error: any) {
    console.error("Error accepting invite:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
