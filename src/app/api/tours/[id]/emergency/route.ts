import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { SubmitSOSUseCase } from "@/application/use-cases/emergency/submit-sos.use-case";

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
        { error: "Only tour guides can submit SOS reports" },
        { status: 403 }
      );
    }

    const { id: tourId } = await params;
    const body = await req.json();

    const useCase = new SubmitSOSUseCase();
    const report = await useCase.execute({
      guideId: session.user.id,
      tourId,
      type: body.type,
      description: body.description,
      location: body.location,
      severity: body.severity,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting SOS:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}












