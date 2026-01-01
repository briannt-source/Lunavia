import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { WalletService } from "@/domain/services/wallet.service";
import { generateUserCode } from "@/lib/user-code-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, name, licenseNumber, companyName } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["TOUR_OPERATOR", "TOUR_AGENCY", "TOUR_GUIDE"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Require license for operators/agencies
    if (
      (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") &&
      !licenseNumber
    ) {
      return NextResponse.json(
        { error: "License number is required for operators/agencies" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user code for guides and agencies
    const userCode = await generateUserCode(role as any);

    // Create user
    const user = await prisma.user.create({
      data: {
        code: userCode,
        email,
        password: hashedPassword,
        role,
        licenseNumber: role === "TOUR_OPERATOR" || role === "TOUR_AGENCY" ? licenseNumber : null,
        verifiedStatus: "NOT_SUBMITTED",
        profile: {
          create: {
            name,
            companyName: role === "TOUR_OPERATOR" || role === "TOUR_AGENCY" ? companyName : null,
          },
        },
      },
    });

    // Initialize wallet
    await WalletService.initializeWallet(user.id, role);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

