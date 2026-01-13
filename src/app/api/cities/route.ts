import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const cities = await prisma.city.findMany({
      where: {
        ...(region && { region }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(cities);
  } catch (error: any) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}














