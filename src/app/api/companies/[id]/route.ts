import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
        members: {
          where: {
            status: "APPROVED",
          },
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: {
              where: {
                status: "APPROVED",
              },
            },
            invitations: {
              where: {
                status: "PENDING",
              },
            },
            joinRequests: {
              where: {
                status: "PENDING",
              },
            },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









