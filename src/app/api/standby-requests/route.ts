import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { CreateStandbyRequestUseCase } from "@/application/use-cases/standby/create-standby-request.use-case";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/standby-requests
 * Create a new standby request (Operator only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, city, requiredDate, budget, standbyFee, mainGuideId, subGuideId, description } = body;

    // Validate required fields
    if (!title || !city || !requiredDate || !budget) {
      return NextResponse.json(
        { error: "Missing required fields: title, city, requiredDate, budget" },
        { status: 400 }
      );
    }

    const useCase = new CreateStandbyRequestUseCase();
    const standbyRequest = await useCase.execute({
      operatorId: session.user.id,
      title,
      city,
      requiredDate: new Date(requiredDate),
      budget: parseFloat(budget),
      standbyFee: standbyFee ? parseFloat(standbyFee) : undefined,
      mainGuideId,
      subGuideId,
      description,
    });

    return NextResponse.json(standbyRequest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating standby request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create standby request" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/standby-requests
 * List standby requests (Operator sees their own, Guide sees assigned to them)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: any = {};

    // Operator sees their own requests
    if (session.user.role === "TOUR_OPERATOR" || session.user.role === "TOUR_AGENCY") {
      where.operatorId = session.user.id;
    }

    // Guide sees requests assigned to them
    if (session.user.role === "TOUR_GUIDE") {
      where.OR = [
        { mainGuideId: session.user.id },
        { subGuideId: session.user.id },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const standbyRequests = await prisma.standbyRequest.findMany({
      where,
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
        payments: {
          where: {
            standbyRequestId: { not: null },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(standbyRequests);
  } catch (error: any) {
    console.error("Error fetching standby requests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch standby requests" },
      { status: 500 }
    );
  }
}

