import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ChangeTourStatusUseCase } from "@/application/use-cases/tour/change-tour-status.use-case";
import { revalidatePath } from "next/cache";

export async function PUT(
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

    const useCase = new ChangeTourStatusUseCase();
    const tour = await useCase.execute({
      operatorId: session.user.id,
      tourId,
      status: body.status,
    });

    // Revalidate cache to ensure UI updates
    revalidatePath(`/tours/${tourId}`);
    revalidatePath("/tours/browse");
    revalidatePath("/dashboard/operator");

    return NextResponse.json(tour);
  } catch (error: any) {
    console.error("Error changing tour status:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}




