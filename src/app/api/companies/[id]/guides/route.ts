import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId } = await params;

    // Verify operator owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You don't own this company" },
        { status: 403 }
      );
    }

    // Get all company members (guides)
    const members = await prisma.companyMember.findMany({
      where: { companyId },
      include: {
        guide: {
          include: {
            profile: true,
            wallet: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Include contract verification info
    const membersWithContract = members.map((member) => ({
      ...member,
      contractStatus: member.contractVerified
        ? "VERIFIED"
        : member.employmentContractUrl
        ? "PENDING_VERIFICATION"
        : "NOT_UPLOADED",
    }));

    return NextResponse.json(membersWithContract);
  } catch (error: any) {
    console.error("Error fetching company guides:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const { searchParams } = new URL(req.url);
    const guideId = searchParams.get("guideId");

    if (!guideId) {
      return NextResponse.json(
        { error: "guideId is required" },
        { status: 400 }
      );
    }

    // Verify operator owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You don't own this company" },
        { status: 403 }
      );
    }

    // Remove guide from company
    await prisma.companyMember.delete({
      where: { guideId },
    });

    // Update user employment type
    await prisma.user.update({
      where: { id: guideId },
      data: {
        employmentType: null,
        companyId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing guide from company:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await req.json();
    const { guideId, companyEmail, status, employmentContractUrl } = body;

    if (!guideId) {
      return NextResponse.json(
        { error: "guideId is required" },
        { status: 400 }
      );
    }

    // Verify operator owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You don't own this company" },
        { status: 403 }
      );
    }

    // Update company member
    const updateData: any = {};
    if (companyEmail !== undefined) updateData.companyEmail = companyEmail;
    if (status) {
      updateData.status = status;
      if (status === "APPROVED") {
        updateData.approvedAt = new Date();
      }
    }
    if (body.employmentContractUrl !== undefined) {
      updateData.employmentContractUrl = body.employmentContractUrl;
    }

    const member = await prisma.companyMember.update({
      where: { guideId },
      data: updateData,
      include: {
        guide: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("Error updating company member:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

