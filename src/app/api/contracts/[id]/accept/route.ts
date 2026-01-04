import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AcceptContractUseCase } from "@/application/use-cases/contract/accept-contract.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: contractId } = await params;

    const useCase = new AcceptContractUseCase();
    const acceptance = await useCase.execute({
      guideId: session.user.id,
      contractId,
    });

    return NextResponse.json(acceptance);
  } catch (error: any) {
    console.error("Error accepting contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









