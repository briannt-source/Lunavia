import { NextRequest, NextResponse } from "next/server";

/** POST /api/contact — Contact form submission */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message, subject } = body;
    if (!email || !message) return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
    // In production, send email via service
    return NextResponse.json({ success: true, message: "Your message has been received. We'll respond shortly." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
