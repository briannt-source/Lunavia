import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tours/:id/documents — List tour documents
 * POST /api/tours/:id/documents — Upload/attach a document reference
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, files: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Parse files field (stored as JSON array of file references)
    let documents: any[] = [];
    if (tour.files) {
      try {
        const parsed = typeof tour.files === "string" ? JSON.parse(tour.files) : tour.files;
        documents = Array.isArray(parsed) ? parsed : [];
      } catch { /* not parseable */ }
    }

    return NextResponse.json({ tourId, documents });
  } catch (error: any) {
    console.error("Error fetching tour documents:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, files: true, operatorId: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const existing = tour.files
      ? (typeof tour.files === "string" ? JSON.parse(tour.files) : tour.files)
      : [];
    const files = Array.isArray(existing) ? existing : [];

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: body.name || "Document",
      url: body.url || "",
      type: body.type || "other",
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
    };

    files.push(newDoc);

    await prisma.tour.update({
      where: { id: tourId },
      data: { files: JSON.stringify(files) },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    console.error("Error adding tour document:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
