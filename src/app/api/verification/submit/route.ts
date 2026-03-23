import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * POST /api/verification/submit — Submit verification with documents
 * 
 * Expected body from operator form:
 * {
 *   role: "TOUR_OPERATOR",
 *   documents: [{ id, filename }],
 *   operatorType: "TOUR_OPERATOR" | "TRAVEL_AGENCY" | "SOLE_PROPRIETOR",
 *   businessRegistrationNumber?: string,
 *   tourLicenseNumber?: string,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, documents, operatorType, businessRegistrationNumber, tourLicenseNumber } = body;

    const { prisma } = await import("@/lib/prisma");

    // Check if already pending or approved
    const existingVerification = await prisma.verification.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: "You already have a pending or approved verification" },
        { status: 400 }
      );
    }

    // Build notes with business info
    const notes = [
      operatorType ? `Operator Type: ${operatorType}` : null,
      businessRegistrationNumber ? `Business Registration: ${businessRegistrationNumber}` : null,
      tourLicenseNumber ? `Tour License: ${tourLicenseNumber}` : null,
      documents?.length ? `Documents: ${documents.map((d: any) => d.filename).join(", ")}` : null,
    ].filter(Boolean).join("\n");

    // Determine verification type based on role
    const verType = role === "TOUR_OPERATOR" ? "BUSINESS_LICENSE" : "ID_CARD";

    // Create verification record
    const verification = await prisma.verification.create({
      data: {
        userId: session.user.id,
        type: verType as any,
        status: "PENDING",
        fileUrl: documents?.[0]?.filename || "",
        notes,
      },
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { verifiedStatus: "PENDING" },
    });

    return NextResponse.json(
      { success: true, verificationId: verification.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[verification/submit] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
