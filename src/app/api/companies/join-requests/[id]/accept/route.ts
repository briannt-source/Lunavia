import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AcceptJoinRequestUseCase } from "@/application/use-cases/company/accept-join-request.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;
    const body = await req.json();

    const useCase = new AcceptJoinRequestUseCase();
    const result = await useCase.execute({
      operatorId: session.user.id,
      requestId,
      companyEmail: body.companyEmail,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error accepting join request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









