import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * POST /api/operator/team/invite
 * Send an invitation to a guide to join the operator's company
 * Supports two modes: by email or by guideId
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_OPERATOR") {
      return NextResponse.json(
        { error: "Only operators can send team invitations" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, guideId, role: memberRole } = body;
    const inviteRole = memberRole || "GUIDE";

    if (!email && !guideId) {
      return NextResponse.json(
        { error: "Either email or guideId is required" },
        { status: 400 }
      );
    }

    // Find the operator's company
    const company = await prisma.company.findUnique({
      where: { operatorId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "You need to create a company first before inviting guides" },
        { status: 400 }
      );
    }

    // Rate limiting — max 10 pending invites per operator
    const pendingCount = await prisma.companyInvitation.count({
      where: {
        companyId: company.id,
        status: "PENDING",
      },
    });

    if (pendingCount >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 pending invitations allowed. Please wait for existing invites to be accepted or expired." },
        { status: 429 }
      );
    }

    // Resolve guideId from email if needed
    let resolvedGuideId = guideId;
    if (email && !guideId) {
      const guide = await prisma.user.findFirst({
        where: { email, role: "TOUR_GUIDE" },
        select: { id: true },
      });
      if (guide) {
        resolvedGuideId = guide.id;
      }
    }

    // Check if guide is already a member
    if (resolvedGuideId) {
      const existingMember = await prisma.companyMember.findUnique({
        where: { userId: resolvedGuideId },
      });

      if (existingMember && existingMember.companyId === company.id) {
        return NextResponse.json(
          { error: "This guide is already a member of your company" },
          { status: 409 }
        );
      }

      // Check for existing pending invite
      const existingInvite = await prisma.companyInvitation.findFirst({
        where: {
          companyId: company.id,
          guideId: resolvedGuideId,
          status: "PENDING",
        },
      });

      if (existingInvite) {
        return NextResponse.json(
          { error: "An invitation is already pending for this guide" },
          { status: 409 }
        );
      }
    }

    // Generate unique invite token
    const inviteToken = randomBytes(32).toString("hex");

    // Create invitation using relations
    const invitation = await prisma.companyInvitation.create({
      data: {
        company: { connect: { id: company.id } },
        ...(resolvedGuideId ? { guide: { connect: { id: resolvedGuideId } } } : {}),
        email: email || null,
        role: inviteRole as any,
        inviteToken,
        status: "PENDING",
        invitedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: email || null,
        guideId: resolvedGuideId || null,
        status: invitation.status,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error sending team invite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
}
