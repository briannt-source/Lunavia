import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/account/subscription
 * Returns the current user's subscription/plan status.
 * Since Lunavia doesn't have a subscription model yet, this returns
 * a default free plan to prevent "Failed to load subscription" errors.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return a default free plan since subscription feature is not yet implemented
    return NextResponse.json({
      plan: {
        name: "Free",
        tier: "FREE",
        features: [
          "Create unlimited tours",
          "Manage team members",
          "Basic analytics",
        ],
      },
      status: "active",
      currentPeriodStart: user.createdAt,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      pendingUpgrade: null,
    });
  } catch (error: any) {
    console.error("Subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to load subscription data" },
      { status: 500 }
    );
  }
}
