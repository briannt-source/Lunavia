import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Simple file upload to public/uploads directory
// In production, you should use cloud storage (S3, Firebase, etc.)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const fileType = formData.get("type") as string | null;

    // Handle single file (for avatar) or multiple files (for tour)
    const filesToUpload = singleFile ? [singleFile] : files;

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Different directories for different file types
    const baseDir = fileType === "avatar" ? "avatars" : "uploads";
    const uploadDir = join(process.cwd(), "public", baseDir);
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const urls: string[] = [];

    for (const file of filesToUpload) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop();
      const filename = `${timestamp}-${randomStr}.${extension}`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);

      // Return public URL
      urls.push(`/${baseDir}/${filename}`);
    }

    // Ensure all URLs are valid strings
    const validUrls = urls.filter((url): url is string => url != null && typeof url === 'string');
    return NextResponse.json({ urls: validUrls });
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload files" },
      { status: 500 }
    );
  }
}

