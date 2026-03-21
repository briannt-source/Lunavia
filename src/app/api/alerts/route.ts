import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/alerts — List alerts (uses Notification model as alert system)
 * POST /api/alerts — Create alert notification
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("status") === "unread";

    const alerts = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: { startsWith: "ALERT" },
        ...(unreadOnly ? { read: false } : {}),
      },
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

    const alert = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: `ALERT_${body.type || "INFO"}`,
        title: body.title || "Alert",
        message: body.message || "",
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
