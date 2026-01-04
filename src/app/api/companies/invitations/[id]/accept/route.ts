import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AcceptInvitationUseCase } from "@/application/use-cases/company/accept-invitation.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invitationId } = await params;
    const body = await req.json();

    const useCase = new AcceptInvitationUseCase();
    const result = await useCase.execute({
      guideId: session.user.id,
      invitationId,
      companyEmail: body.companyEmail,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









