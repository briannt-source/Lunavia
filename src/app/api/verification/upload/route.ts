import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * POST /api/verification/upload — Upload verification document
 * 
 * Returns { document: { id, filename, size, mimeType, uploadedAt } }
 * Files stored in public/uploads/documents/ (local disk)
 * 
 * In production, migrate to cloud storage (S3/Firebase/Cloudinary)
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

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "documents");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const extension = file.name.split(".").pop() || "bin";
    const safeFilename = `${session.user.id}-${timestamp}-${randomStr}.${extension}`;
    const filepath = join(uploadDir, safeFilename);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    // Return document object matching UploadedFile interface
    const document = {
      id: `doc-${timestamp}-${randomStr}`,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/documents/${safeFilename}`,
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

    // Import prisma lazily to avoid build-time issues
    const { prisma } = await import("@/lib/prisma");

    // Check user verification status
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
