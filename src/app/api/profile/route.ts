import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/** GET/PUT /api/profile — Get or update user profile */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true, wallet: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const updated = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.about !== undefined && { about: body.about }),
        ...(body.city && { city: body.city }),
        ...(body.languages && { languages: body.languages }),
        ...(body.skills && { skills: body.skills }),
        ...(body.phone && { phone: body.phone }),
      },
      create: {
        userId: session.user.id,
        fullName: body.fullName || "",
        about: body.about || "",
        city: body.city || "",
        languages: body.languages || [],
        skills: body.skills || [],
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
