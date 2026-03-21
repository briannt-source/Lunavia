import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/alerts — List alerts
 * POST /api/alerts — Create alert
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "OPEN";

    const alerts = await prisma.operationalAlert.findMany({
      where: status === "all" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(alerts);
  } catch (error: any) {
    console.error("Error fetching alerts:", error);
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

    const alert = await prisma.operationalAlert.create({
      data: {
        type: body.type || "INFO",
        title: body.title || "Alert",
        message: body.message || "",
        status: "OPEN",
        severity: body.severity || "LOW",
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
