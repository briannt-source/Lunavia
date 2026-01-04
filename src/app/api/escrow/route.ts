import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/error-handler";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tourId = searchParams.get("tourId");
    const guideId = searchParams.get("guideId");
    const operatorId = searchParams.get("operatorId");

    const where: any = {};

    if (tourId) {
      where.tourId = tourId;
    }

    if (guideId) {
      where.guideId = guideId;
    }

    if (operatorId) {
      where.operatorId = operatorId;
    }

    // If no filters, only show escrow accounts for current user
    if (!tourId && !guideId && !operatorId) {
      if (session.user.role === "TOUR_OPERATOR" || session.user.role === "TOUR_AGENCY") {
        where.operatorId = session.user.id;
      } else if (session.user.role === "TOUR_GUIDE") {
        where.guideId = session.user.id;
      }
    }

    const escrowAccounts = await prisma.escrowAccount.findMany({
      where,
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
        guide: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(escrowAccounts);
  } catch (error) {
    return handleError(error);
  }
}

