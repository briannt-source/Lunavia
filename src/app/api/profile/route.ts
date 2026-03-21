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
    const updated = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(body.name && { name: body.name }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.languages && { languages: body.languages }),
        ...(body.specialties && { specialties: body.specialties }),
        ...(body.phone && { phone: body.phone }),
        ...(body.photoUrl && { photoUrl: body.photoUrl }),
      },
      create: {
        userId: session.user.id,
        name: body.name || "",
        bio: body.bio || "",
        languages: body.languages || [],
        specialties: body.specialties || [],
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
