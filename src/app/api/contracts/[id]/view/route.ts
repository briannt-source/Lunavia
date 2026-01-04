import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ViewContractUseCase } from "@/application/use-cases/contract/view-contract.use-case";

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

    const useCase = new ViewContractUseCase();
    const result = await useCase.execute({
      guideId: session.user.id,
      contractId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error viewing contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









