import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AddEvidenceUseCase } from "@/application/use-cases/dispute/add-evidence.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { evidenceUrls } = body;

    if (!evidenceUrls || !Array.isArray(evidenceUrls) || evidenceUrls.length === 0) {
      return NextResponse.json(
        { message: "Evidence URLs are required" },
        { status: 400 }
      );
    }

    const useCase = new AddEvidenceUseCase();
    const dispute = await useCase.execute({
      disputeId: id,
      userId: session.user.id,
      evidenceUrls,
    });

    return NextResponse.json(dispute);
  } catch (error: any) {
    console.error("Error adding evidence:", error);
    return NextResponse.json(
      { message: error.message || "Failed to add evidence" },
      { status: 400 }
    );
  }
}

