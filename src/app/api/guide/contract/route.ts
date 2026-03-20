import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guide/contract
 * Get contract info for the current guide (via CompanyMember)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find guide's company membership (includes contract fields)
    const membership = await prisma.companyMember.findUnique({
      where: { userId: session.user.id },
    });

    // Get user's employment type and companyId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        employmentType: true,
        companyId: true,
      },
    });

    const contract = {
      guideMode: user?.employmentType || null,
      affiliatedOperatorId: user?.companyId || membership?.companyId || null,
      contractDocumentUrl: membership?.employmentContractUrl || null,
      contractType: membership?.contractType || null,
      contractStatus: membership?.contractVerified
        ? "APPROVED"
        : membership?.contractRejectionReason
          ? "REJECTED"
          : membership?.employmentContractUrl
            ? "PENDING"
            : null,
      contractReviewedAt: membership?.contractVerifiedAt?.toISOString() || null,
    };

    return NextResponse.json({ contract });
  } catch (error: any) {
    console.error("Error fetching guide contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guide/contract
 * Submit a contract document for review
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contractType, documentUrl } = body;

    if (!contractType || !documentUrl) {
      return NextResponse.json(
        { error: "contractType and documentUrl are required" },
        { status: 400 }
      );
    }

    // Find membership
    const membership = await prisma.companyMember.findUnique({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of any company. Cannot submit contract." },
        { status: 400 }
      );
    }

    // Update the membership with contract info
    await prisma.companyMember.update({
      where: { id: membership.id },
      data: {
        employmentContractUrl: documentUrl,
        contractType: contractType as any,
        contractVerified: false,
        contractVerifiedAt: null,
        contractRejectionReason: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contract submitted for review",
    });
  } catch (error: any) {
    console.error("Error submitting contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
