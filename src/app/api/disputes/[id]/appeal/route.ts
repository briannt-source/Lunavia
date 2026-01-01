import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AppealDisputeUseCase } from "@/application/use-cases/dispute/appeal-dispute.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { appealDescription } = body;

    if (!appealDescription) {
      return NextResponse.json(
        { message: "Appeal description is required" },
        { status: 400 }
      );
    }

    const useCase = new AppealDisputeUseCase();
    const appealDispute = await useCase.execute({
      originalDisputeId: id,
      userId: session.user.id,
      appealDescription,
    });

    return NextResponse.json(appealDispute, { status: 201 });
  } catch (error: any) {
    console.error("Error appealing dispute:", error);
    return NextResponse.json(
      { message: error.message || "Failed to appeal dispute" },
      { status: 400 }
    );
  }
}

