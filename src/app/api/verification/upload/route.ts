import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { uploadFile, BUCKETS, generateFilePath } from "@/lib/supabase-storage";

/**
 * POST /api/verification/upload — Upload verification document to Supabase Storage
 * Returns { document: { id, filename, size, mimeType, uploadedAt, url } }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF, PDF" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB" },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = generateFilePath("verify-", file.name, session.user.id);

    const result = await uploadFile(BUCKETS.DOCUMENTS, filePath, buffer, file.type);

    const document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      url: result.url,
    };

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("[verification/upload] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/** GET /api/verification/upload — Check current verification status */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { verifiedStatus: true },
    });

    return NextResponse.json({
      status: user?.verifiedStatus || "NOT_SUBMITTED",
    });
  } catch (error: any) {
    console.error("[verification/upload] GET Error:", error);
    return NextResponse.json({ status: "NOT_SUBMITTED" });
  }
}

/** DELETE /api/verification/upload — Delete an uploaded document */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Best-effort deletion — document ID is client-side only for now
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
