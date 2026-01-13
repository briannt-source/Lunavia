import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GuideRejectAssignmentUseCase } from "@/application/use-cases/assignment/guide-reject-assignment.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await req.json();

    if (!body.reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    const useCase = new GuideRejectAssignmentUseCase();
    const assignment = await useCase.execute({
      guideId: session.user.id,
      assignmentId,
      reason: body.reason,
    });

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error rejecting assignment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














