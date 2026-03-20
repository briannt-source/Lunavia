import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getCompanyTourFilter } from "@/lib/company-permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // If user belongs to a company, show ALL company tours
    // Otherwise show only their own tours
    const tourFilter = await getCompanyTourFilter(userId);

    const tours = await prisma.tour.findMany({
      where: tourFilter,
      include: {
        operator: {
          select: { email: true, profile: { select: { name: true } } },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tours);
  } catch (error: any) {
    console.error("Error fetching my tours:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














