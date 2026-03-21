import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/** POST /api/feedback — Submit feedback */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    return NextResponse.json({
      success: true, message: "Feedback received. Thank you!",
      feedbackId: `fb-${Date.now()}`,
      userId: session?.user?.id || "anonymous",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
