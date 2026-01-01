import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        wallet: true,
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        company: true, // Include company relation
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if can create tour
    const canCreate = await WalletService.canCreateTour(user.id);

    // Check if can apply to tour
    const canApply = await WalletService.canApplyToTour(user.id);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      licenseNumber: user.licenseNumber,
      verifiedStatus: user.verifiedStatus,
      employmentType: user.employmentType,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
      wallet: user.wallet,
      company: user.company, // Include company data
      verification: user.verifications[0] || null,
      permissions: {
        canCreateTour: canCreate,
        canApplyToTour: canApply,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

