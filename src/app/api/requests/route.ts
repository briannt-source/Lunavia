import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/requests — List tour requests (operator-facing)
 * POST /api/requests — Create a new tour request
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "true";
    const status = searchParams.getAll("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (mine) {
      where.operatorId = session.user.id;
    }

    if (status.length > 0) {
      where.status = { in: status };
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          operator: { include: { profile: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tour.count({ where }),
    ]);

    return NextResponse.json({
      requests: tours,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const tour = await prisma.tour.create({
      data: {
        title: body.title,
        description: body.description || "",
        city: body.city || "",
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        pax: body.pax ? parseInt(body.pax) : 1,
        status: "DRAFT",
        visibility: body.visibility || "PUBLIC",
        operatorId: session.user.id,
        currency: body.currency || "VND",
        priceMain: body.priceMain ? parseFloat(body.priceMain) : null,
        priceSub: body.priceSub ? parseFloat(body.priceSub) : null,
        languages: body.languages || [],
        specialties: body.specialties || [],
        mainGuideSlots: body.mainGuideSlots || 1,
        subGuideSlots: body.subGuideSlots || 0,
      },
    });

    return NextResponse.json(tour, { status: 201 });
  } catch (error: any) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
