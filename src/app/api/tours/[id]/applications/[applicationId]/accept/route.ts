import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AcceptApplicationUseCase } from "@/application/use-cases/application/accept-application.use-case";

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

    const useCase = new AcceptApplicationUseCase();
    const application = await useCase.execute({
      operatorId: session.user.id,
      applicationId,
    });

    return NextResponse.json(application);
  } catch (error: any) {
    console.error("Error accepting application:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














