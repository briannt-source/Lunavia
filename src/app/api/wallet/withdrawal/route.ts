import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { CreateWithdrawalRequestUseCase } from "@/application/use-cases/wallet/create-withdrawal-request.use-case";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method, paymentMethodId, customAccountInfo, accountOwnerName } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: "Withdrawal method is required" },
        { status: 400 }
      );
    }

    const useCase = new CreateWithdrawalRequestUseCase();
    const withdrawalRequest = await useCase.execute({
      userId: session.user.id,
      amount,
      method,
      paymentMethodId,
      customAccountInfo,
      accountOwnerName,
    });

    return NextResponse.json(withdrawalRequest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating withdrawal request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



