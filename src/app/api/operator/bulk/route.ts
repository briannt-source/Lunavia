import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** POST /api/operator/bulk — Bulk operations on tours */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { action, tourIds } = body;

    if (!tourIds || !Array.isArray(tourIds) || tourIds.length === 0) {
      return NextResponse.json({ error: "tourIds array is required" }, { status: 400 });
    }

    let result;
    switch (action) {
      case "publish":
        result = await prisma.tour.updateMany({
          where: { id: { in: tourIds }, operatorId: session.user.id },
          data: { status: "OPEN", visibility: "PUBLIC" },
        });
        break;
      case "close":
        result = await prisma.tour.updateMany({
          where: { id: { in: tourIds }, operatorId: session.user.id },
          data: { status: "CLOSED" },
        });
        break;
      case "cancel":
        result = await prisma.tour.updateMany({
          where: { id: { in: tourIds }, operatorId: session.user.id },
          data: { status: "CANCELLED" },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, action, affected: result.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
