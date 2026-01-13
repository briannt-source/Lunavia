import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { RejectApplicationUseCase } from "@/application/use-cases/application/reject-application.use-case";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; applicationId: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await params;
    const body = await req.json();

    const useCase = new RejectApplicationUseCase();
    const application = await useCase.execute({
      operatorId: session.user.id,
      applicationId,
      reason: body.reason,
    });

    return NextResponse.json(application);
  } catch (error: any) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














