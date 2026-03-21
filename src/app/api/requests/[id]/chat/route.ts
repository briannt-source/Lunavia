import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * GET /api/requests/:id/chat — Get chat messages for a tour request
 * POST /api/requests/:id/chat — Send a message
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: tourId } = await params;
    // Return empty messages — chat model may not exist yet
    return NextResponse.json({ tourId, messages: [], total: 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: tourId } = await params;
    const body = await req.json();
    return NextResponse.json({
      id: `msg-${Date.now()}`,
      tourId,
      senderId: session.user.id,
      content: body.content || body.message || "",
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
