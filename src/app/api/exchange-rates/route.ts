import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromCurrency = searchParams.get("from") || "USD";
    const toCurrency = searchParams.get("to") || "VND";

    // Get current active exchange rate
    const exchangeRate = await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency,
        toCurrency,
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      orderBy: {
        effectiveFrom: "desc",
      },
    });

    if (!exchangeRate) {
      return NextResponse.json(
        { error: "Exchange rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exchangeRate);
  } catch (error: any) {
    console.error("Error fetching exchange rate:", error);
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

    // Check if user is admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Only admins can update exchange rates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fromCurrency = "USD", toCurrency = "VND", rate } = body;

    if (!rate || rate <= 0) {
      return NextResponse.json(
        { error: "Invalid rate" },
        { status: 400 }
      );
    }

    // Set effectiveTo for previous rate
    await prisma.exchangeRate.updateMany({
      where: {
        fromCurrency,
        toCurrency,
        effectiveTo: null,
      },
      data: {
        effectiveTo: new Date(),
      },
    });

    // Create new exchange rate
    const newRate = await prisma.exchangeRate.create({
      data: {
        fromCurrency,
        toCurrency,
        rate,
        effectiveFrom: new Date(),
        createdBy: adminUser.id,
      },
    });

    return NextResponse.json(newRate);
  } catch (error: any) {
    console.error("Error creating exchange rate:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}









