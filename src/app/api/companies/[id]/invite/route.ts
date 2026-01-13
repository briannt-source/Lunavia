import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { InviteGuideToCompanyUseCase } from "@/application/use-cases/company/invite-guide-to-company.use-case";

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

    const useCase = new InviteGuideToCompanyUseCase();
    const invitation = await useCase.execute({
      operatorId: session.user.id,
      companyId,
      guideId: body.guideId,
      email: body.email,
    });

    return NextResponse.json(invitation);
  } catch (error: any) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














