import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET /api/operator/invites — List invites sent by operator */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find company and its invitations
    const company = await prisma.company.findFirst({
      where: { ownerId: session.user.id },
      include: {
        invitations: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    return NextResponse.json(company?.invitations || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
