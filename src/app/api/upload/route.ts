import { NextRequest, NextResponse } from "next/server";
import { uploadFile, BUCKETS, generateFilePath } from "@/lib/supabase-storage";

/**
 * POST /api/upload — General file upload to Supabase Storage
 * 
 * Supports single file ("file") or multiple files ("files").
 * Optional "type" field to route to specific bucket:
 *   - "avatar" → avatars bucket
 *   - default  → uploads bucket
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const fileType = formData.get("type") as string | null;

    const filesToUpload = singleFile ? [singleFile] : files;

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const bucket = fileType === "avatar" ? BUCKETS.AVATARS : BUCKETS.UPLOADS;
    const urls: string[] = [];

    for (const file of filesToUpload) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = generateFilePath("", file.name);

      const result = await uploadFile(bucket, filePath, buffer, file.type);
      urls.push(result.url);
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload files" },
      { status: 500 }
    );
  }
}
