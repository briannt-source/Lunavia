import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { photoUrl, name, bio, languages, specialties } = body;

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(photoUrl !== undefined && { photoUrl }),
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(languages !== undefined && { languages }),
        ...(specialties !== undefined && { specialties }),
      },
      create: {
        userId: session.user.id,
        photoUrl: photoUrl || null,
        name: name || null,
        bio: bio || null,
        languages: languages || [],
        specialties: specialties || [],
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














