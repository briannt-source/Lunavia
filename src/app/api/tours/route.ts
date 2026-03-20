import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/domain/services/wallet.service";
import { getCompanyMembership, canCreateTour } from "@/lib/company-permissions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check KYC/KYB verification first
    const { VerificationService } = await import("@/domain/services/verification.service");
    const canVerify = await VerificationService.canPerformAction(
      session.user.id,
      "create_tour"
    );

    if (!canVerify.canPerform) {
      return NextResponse.json(
        { error: canVerify.reason },
        { status: 403 }
      );
    }

    // Check wallet and license
    const canCreate = await WalletService.canCreateTour(session.user.id);

    if (!canCreate.canCreate) {
      return NextResponse.json(
        { error: canCreate.reason },
        { status: 403 }
      );
    }

    // Check company membership and permissions
    const membership = await getCompanyMembership(session.user.id);
    if (membership && !canCreateTour(membership.role)) {
      return NextResponse.json(
        { error: "You don't have permission to create tours in this company" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const validationErrors: string[] = [];
    
    if (!body.title || body.title.trim().length === 0) {
      validationErrors.push("Vui lòng nhập tiêu đề tour");
    }

    if (!body.description || body.description.trim().length === 0) {
      validationErrors.push("Vui lòng nhập mô tả tour");
    }

    if (!body.city || body.city.trim().length === 0) {
      validationErrors.push("Vui lòng chọn thành phố");
    }

    if (!body.startDate) {
      validationErrors.push("Vui lòng nhập ngày bắt đầu tour");
    } else {
      const startDate = new Date(body.startDate);
      if (isNaN(startDate.getTime())) {
        validationErrors.push("Ngày bắt đầu không hợp lệ. Vui lòng nhập đúng định dạng (YYYY-MM-DD hoặc DD/MM/YYYY)");
      }
    }

    if (body.endDate) {
      const endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        validationErrors.push("Ngày kết thúc không hợp lệ. Vui lòng nhập đúng định dạng (YYYY-MM-DD hoặc DD/MM/YYYY)");
      } else if (body.startDate) {
        const startDate = new Date(body.startDate);
        if (!isNaN(startDate.getTime()) && endDate < startDate) {
          validationErrors.push("Ngày kết thúc phải sau ngày bắt đầu");
        }
      }
    }

    if (!body.pax || body.pax <= 0) {
      validationErrors.push("Vui lòng nhập số lượng khách hợp lệ (lớn hơn 0)");
    }

    if (body.priceMain !== null && body.priceMain !== undefined && body.priceMain < 0) {
      validationErrors.push("Giá HDV chính không được âm");
    }

    if (body.priceSub !== null && body.priceSub !== undefined && body.priceSub < 0) {
      validationErrors.push("Giá HDV phụ không được âm");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(". ") },
        { status: 400 }
      );
    }

    // Parse dates safely
    let startDate: Date;
    try {
      startDate = new Date(body.startDate);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Ngày bắt đầu không hợp lệ. Vui lòng nhập đúng định dạng" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Ngày bắt đầu không hợp lệ. Vui lòng nhập đúng định dạng" },
        { status: 400 }
      );
    }

    let endDate: Date | undefined;
    if (body.endDate) {
      try {
        endDate = new Date(body.endDate);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            { error: "Ngày kết thúc không hợp lệ. Vui lòng nhập đúng định dạng" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Ngày kết thúc không hợp lệ. Vui lòng nhập đúng định dạng" },
          { status: 400 }
        );
      }
    }

    const { CreateTourUseCase } = await import(
      "@/application/use-cases/tour/create-tour.use-case"
    );
    const useCase = new CreateTourUseCase();

    const tour = await useCase.execute({
      operatorId: session.user.id,
      companyId: membership?.companyId || null,
      title: body.title,
      description: body.description,
      city: body.city,
      marketType: body.marketType || "INBOUND",
      country: body.country || "VN",
      province: body.province || null,
      visibility: body.visibility || "PUBLIC",
      status: body.status || "DRAFT", // Default to DRAFT
      currency: body.currency || "VND",
      priceMain: body.priceMain || null,
      priceSub: body.priceSub || null,
      pax: body.pax,
      languages: body.languages || [],
      specialties: body.specialties || [],
      startDate,
      endDate,
      durationHours: body.durationHours || null,
      files: body.files || [],
      itinerary: body.itinerary || [],
      mainGuideSlots: body.mainGuideSlots || 1,
      subGuideSlots: body.subGuideSlots || 0,
      inclusions: body.inclusions || [],
      exclusions: body.exclusions || [],
      additionalRequirements: body.additionalRequirements,
      guideNotes: body.guideNotes,
    });

    return NextResponse.json(tour);
  } catch (error: any) {
    console.error("Error creating tour:", error);
    
    // Use error message utility for user-friendly messages
    const { getUserFriendlyError } = await import("@/lib/error-messages");
    const userFriendlyError = getUserFriendlyError(error);
    
    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const marketType = searchParams.get("marketType");
    const countryFilter = searchParams.get("country");
    const provinceFilter = searchParams.get("province");

    // Exclude test operators (operator1@lunavia.com to operator8@lunavia.com, agency1@lunavia.com to agency5@lunavia.com)
    const testOperatorEmails = [
      ...Array.from({ length: 8 }, (_, i) => `operator${i + 1}@lunavia.com`),
      ...Array.from({ length: 5 }, (_, i) => `agency${i + 1}@lunavia.com`),
    ];

    const where: any = {
      visibility: "PUBLIC",
      status: "OPEN", // Only show OPEN tours in marketplace
      operator: {
        email: {
          notIn: testOperatorEmails,
        },
      },
    };

    if (city && city !== "all") {
      where.city = city; // Exact match for city
    }

    if (marketType && marketType !== "all") {
      where.marketType = marketType;
    }

    if (countryFilter && countryFilter !== "all") {
      where.country = countryFilter;
    }

    if (provinceFilter && provinceFilter !== "all") {
      where.province = provinceFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    // Exclude blocked tours from public listing
    where.isBlocked = false;

    const tours = await prisma.tour.findMany({
      where,
      include: {
        operator: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(tours);
  } catch (error: any) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

