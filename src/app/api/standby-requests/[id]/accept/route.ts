import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AcceptStandbyRequestUseCase } from "@/application/use-cases/standby/accept-standby-request.use-case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TOUR_GUIDE") {
      return NextResponse.json(
        { error: "Only tour guides can accept standby requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const useCase = new AcceptStandbyRequestUseCase();
    const standbyRequest = await useCase.execute({
      guideId: session.user.id,
      standbyRequestId: id,
    });

    return NextResponse.json(standbyRequest);
  } catch (error: any) {
    console.error("Error accepting standby request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept standby request" },
      { status: 400 }
    );
  }
}

