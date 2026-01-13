import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { RequestJoinCompanyUseCase } from "@/application/use-cases/company/request-join-company.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await req.json();

    const useCase = new RequestJoinCompanyUseCase();
    const joinRequest = await useCase.execute({
      guideId: session.user.id,
      companyId,
      message: body.message,
    });

    return NextResponse.json(joinRequest);
  } catch (error: any) {
    console.error("Error creating join request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














