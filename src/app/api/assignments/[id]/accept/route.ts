import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GuideAcceptAssignmentUseCase } from "@/application/use-cases/assignment/guide-accept-assignment.use-case";

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

    const useCase = new GuideAcceptAssignmentUseCase();
    const assignment = await useCase.execute({
      guideId: session.user.id,
      assignmentId,
    });

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error accepting assignment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









