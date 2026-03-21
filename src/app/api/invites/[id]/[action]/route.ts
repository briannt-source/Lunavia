import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/invites/:id/:action — Accept or reject an invite
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: inviteId, action } = await params;

    if (!["accept", "reject", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Use accept, reject, or decline." }, { status: 400 });
    }

    const invitation = await prisma.companyInvitation.findUnique({
      where: { id: inviteId },
      include: { company: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED";

    await prisma.companyInvitation.update({
      where: { id: inviteId },
      data: { status: newStatus },
    });

    if (action === "accept") {
      await prisma.companyMember.create({
        data: {
          companyId: invitation.companyId,
          userId: session.user.id,
          role: "GUIDE",
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      action: newStatus,
      companyId: invitation.companyId,
      companyName: invitation.company.name,
    });
  } catch (error: any) {
    console.error("Error processing invite:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
