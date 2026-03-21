import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** POST /api/requests/:id/applicants/:appId/reject — Reject an applicant */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: tourId, appId } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await prisma.application.update({
      where: { id: appId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
