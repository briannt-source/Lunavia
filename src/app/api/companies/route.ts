import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCompanyUseCase } from "@/application/use-cases/company/create-company.use-case";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const companies = await prisma.company.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { companyId: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            members: {
              where: {
                status: "APPROVED",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(companies);
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const useCase = new CreateCompanyUseCase();

    const company = await useCase.execute({
      operatorId: session.user.id,
      ...body,
    });

    return NextResponse.json(company);
  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}








