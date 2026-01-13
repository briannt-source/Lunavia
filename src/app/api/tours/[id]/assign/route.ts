import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AssignGuideToTourUseCase } from "@/application/use-cases/assignment/assign-guide-to-tour.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();

    const useCase = new AssignGuideToTourUseCase();
    const assignment = await useCase.execute({
      operatorId: session.user.id,
      tourId,
      guideId: body.guideId,
      role: body.role,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error("Error assigning guide:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














