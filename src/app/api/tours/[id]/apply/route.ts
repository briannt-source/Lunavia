import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";

import { ApplyToTourUseCase } from "@/application/use-cases/application/apply-to-tour.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tourId } = await params;
    const body = await req.json();

    const useCase = new ApplyToTourUseCase();
    const application = await useCase.execute({
      guideId: session.user.id,
      tourId,
      role: body.role,
      coverLetter: body.coverLetter,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error("Error applying to tour:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

