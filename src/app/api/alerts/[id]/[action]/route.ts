import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/alerts/:id/:action — Acknowledge or resolve an alert
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: alertId, action } = await params;

    if (!["acknowledge", "resolve", "dismiss"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      acknowledge: "ACKNOWLEDGED",
      resolve: "RESOLVED",
      dismiss: "DISMISSED",
    };

    const updated = await prisma.operationalAlert.update({
      where: { id: alertId },
      data: {
        status: statusMap[action],
        resolvedAt: action === "resolve" ? new Date() : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
