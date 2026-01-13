import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { CancelApplicationUseCase } from "@/application/use-cases/application/cancel-application.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can cancel applications" },
        { status: 403 }
      );
    }

    const { id: applicationId } = await params;
    const body = await req.json();

    const useCase = new CancelApplicationUseCase();
    const result = await useCase.execute({
      guideId: session.user.id,
      applicationId,
      reason: body.reason,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error cancelling application:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












