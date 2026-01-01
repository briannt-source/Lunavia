import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating test data...");

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Tour Operators
  console.log("📦 Creating Tour Operators...");
  const operators = [
    {
      email: "operator1@lunavia.test",
      password: hashedPassword,
      role: "TOUR_OPERATOR" as const,
      licenseNumber: "OP-001",
      verifiedStatus: "APPROVED" as const,
      profile: {
        create: {
          name: "Sea You Travel JSC",
          companyName: "Sea You Travel JSC",
          companyLogo: "/avatars/company1.png",
          address: "123 Nguyen Hue, Ho Chi Minh City",
          phone: "+84 123 456 789",
          companyEmail: "info@seayou.com",
          bio: "Leading tour operator specializing in coastal tours",
        },
      },
      wallet: {
        create: {
          balance: 5000000,
          lockedDeposit: 1000000,
          reserved: 0,
        },
      },
    },
    {
      email: "operator2@lunavia.test",
      password: hashedPassword,
      role: "TOUR_OPERATOR" as const,
      licenseNumber: "OP-002",
      verifiedStatus: "APPROVED" as const,
      profile: {
        create: {
          name: "Mountain Adventure Co.",
          companyName: "Mountain Adventure Co.",
          companyLogo: "/avatars/company2.png",
          address: "456 Le Loi, Da Lat",
          phone: "+84 987 654 321",
          companyEmail: "contact@mountainadventure.com",
          bio: "Adventure tours in the highlands",
        },
      },
      wallet: {
        create: {
          balance: 3000000,
          lockedDeposit: 1000000,
          reserved: 0,
        },
      },
    },
  ];

  const createdOperators = [];
  for (const op of operators) {
    const existing = await prisma.user.findUnique({
      where: { email: op.email },
    });
    if (!existing) {
      const operator = await prisma.user.create({
        data: op,
        include: { profile: true, wallet: true },
      });
      createdOperators.push(operator);
      console.log(`✅ Created operator: ${operator.email}`);
    } else {
      createdOperators.push(existing);
      console.log(`⏭️  Operator already exists: ${op.email}`);
    }
  }

  // 2. Create Tour Guides
  console.log("👤 Creating Tour Guides...");
  const guides = [
    {
      email: "guide1@lunavia.test",
      password: hashedPassword,
      role: "TOUR_GUIDE" as const,
      employmentType: "FREELANCE" as const,
      verifiedStatus: "APPROVED" as const,
      profile: {
        create: {
          name: "Nguyen Van A",
          photoUrl: "/avatars/guide1.png",
          bio: "Experienced guide with 5 years in tourism",
          languages: ["English", "Vietnamese", "French"],
          specialties: ["Văn hóa", "Lịch sử", "Ẩm thực"],
          experienceYears: 5,
          rating: 4.8,
          reviewCount: 25,
          availabilityStatus: "AVAILABLE" as const,
        },
      },
      wallet: {
        create: {
          balance: 1000000,
          lockedDeposit: 0,
          reserved: 0,
        },
      },
    },
    {
      email: "guide2@lunavia.test",
      password: hashedPassword,
      role: "TOUR_GUIDE" as const,
      employmentType: "FREELANCE" as const,
      verifiedStatus: "APPROVED" as const,
      profile: {
        create: {
          name: "Tran Thi B",
          photoUrl: "/avatars/guide2.png",
          bio: "Specialized in adventure and nature tours",
          languages: ["English", "Vietnamese", "Japanese"],
          specialties: ["Thiên nhiên", "Thể thao", "Mạo hiểm"],
          experienceYears: 3,
          rating: 4.6,
          reviewCount: 18,
          availabilityStatus: "AVAILABLE" as const,
        },
      },
      wallet: {
        create: {
          balance: 800000,
          lockedDeposit: 0,
          reserved: 0,
        },
      },
    },
    {
      email: "guide3@lunavia.test",
      password: hashedPassword,
      role: "TOUR_GUIDE" as const,
      employmentType: "FREELANCE" as const,
      verifiedStatus: "APPROVED" as const,
      profile: {
        create: {
          name: "Le Van C",
          photoUrl: "/avatars/guide3.png",
          bio: "Expert in cultural and historical tours",
          languages: ["English", "Vietnamese", "Chinese"],
          specialties: ["Văn hóa", "Lịch sử", "Kiến trúc"],
          experienceYears: 7,
          rating: 4.9,
          reviewCount: 42,
          availabilityStatus: "AVAILABLE" as const,
        },
      },
      wallet: {
        create: {
          balance: 1200000,
          lockedDeposit: 0,
          reserved: 0,
        },
      },
    },
  ];

  const createdGuides = [];
  for (const guide of guides) {
    const existing = await prisma.user.findUnique({
      where: { email: guide.email },
    });
    if (!existing) {
      const g = await prisma.user.create({
        data: guide,
        include: { profile: true, wallet: true },
      });
      createdGuides.push(g);
      console.log(`✅ Created guide: ${g.email}`);
    } else {
      createdGuides.push(existing);
      console.log(`⏭️  Guide already exists: ${guide.email}`);
    }
  }

  // 3. Create Tours for operators
  console.log("🗺️  Creating Tours...");
  const tours = [];
  for (const operator of createdOperators) {
    const tourData = [
      {
        operatorId: operator.id,
        title: "Ho Chi Minh City Cultural Tour",
        description: "Explore the rich culture and history of Ho Chi Minh City",
        city: "Hồ Chí Minh City",
        visibility: "PUBLIC" as const,
        status: "OPEN" as const,
        currency: "VND",
        priceMain: 2000000,
        priceSub: 1500000,
        pax: 15,
        languages: ["English", "Vietnamese"],
        specialties: ["Văn hóa", "Lịch sử"],
        startDate: new Date("2025-02-15T08:00:00Z"),
        endDate: new Date("2025-02-17T18:00:00Z"),
        durationHours: 48,
        mainGuideSlots: 1,
        subGuideSlots: 1,
        inclusions: ["Transportation", "Meals", "Entrance fees"],
        exclusions: ["Personal expenses", "Tips"],
      },
      {
        operatorId: operator.id,
        title: "Da Lat Nature Adventure",
        description: "Discover the beautiful nature and landscapes of Da Lat",
        city: "Đà Lạt",
        visibility: "PUBLIC" as const,
        status: "OPEN" as const,
        currency: "VND",
        priceMain: 2500000,
        priceSub: 1800000,
        pax: 12,
        languages: ["English", "Vietnamese"],
        specialties: ["Thiên nhiên", "Thể thao"],
        startDate: new Date("2025-02-20T07:00:00Z"),
        endDate: new Date("2025-02-22T17:00:00Z"),
        durationHours: 58,
        mainGuideSlots: 1,
        subGuideSlots: 0,
        inclusions: ["Transportation", "Accommodation", "Meals"],
        exclusions: ["Personal expenses"],
      },
    ];

    for (const tour of tourData) {
      const existing = await prisma.tour.findFirst({
        where: {
          operatorId: operator.id,
          title: tour.title,
        },
      });
      if (!existing) {
        const t = await prisma.tour.create({ data: tour });
        tours.push(t);
        console.log(`✅ Created tour: ${t.title}`);
      } else {
        tours.push(existing);
        console.log(`⏭️  Tour already exists: ${tour.title}`);
      }
    }
  }

  // 4. Create Applications
  console.log("📝 Creating Applications...");
  if (tours.length > 0 && createdGuides.length > 0) {
    // Guide 1 applies to first tour
    if (tours[0] && createdGuides[0]) {
      const existing = await prisma.application.findUnique({
        where: {
          tourId_guideId: {
            tourId: tours[0].id,
            guideId: createdGuides[0].id,
          },
        },
      });
      if (!existing) {
        await prisma.application.create({
          data: {
            tourId: tours[0].id,
            guideId: createdGuides[0].id,
            role: "MAIN",
            status: "PENDING",
            coverLetter: "I have extensive experience in cultural tours and would love to guide this tour.",
          },
        });
        console.log(`✅ Created application: Guide 1 → Tour 1`);
      }
    }

    // Guide 2 applies to first tour as SUB
    if (tours[0] && createdGuides[1]) {
      const existing = await prisma.application.findUnique({
        where: {
          tourId_guideId: {
            tourId: tours[0].id,
            guideId: createdGuides[1].id,
          },
        },
      });
      if (!existing) {
        await prisma.application.create({
          data: {
            tourId: tours[0].id,
            guideId: createdGuides[1].id,
            role: "SUB",
            status: "PENDING",
            coverLetter: "I'm available as a sub guide for this tour.",
          },
        });
        console.log(`✅ Created application: Guide 2 → Tour 1 (SUB)`);
      }
    }

    // Guide 3 applies to second tour
    if (tours[1] && createdGuides[2]) {
      const existing = await prisma.application.findUnique({
        where: {
          tourId_guideId: {
            tourId: tours[1].id,
            guideId: createdGuides[2].id,
          },
        },
      });
      if (!existing) {
        await prisma.application.create({
          data: {
            tourId: tours[1].id,
            guideId: createdGuides[2].id,
            role: "MAIN",
            status: "PENDING",
            coverLetter: "I specialize in nature and adventure tours. Perfect match for this tour!",
          },
        });
        console.log(`✅ Created application: Guide 3 → Tour 2`);
      }
    }
  }

  console.log("✅ Test data created successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("Operators:");
  operators.forEach((op) => console.log(`  - ${op.email} / password123`));
  console.log("Guides:");
  guides.forEach((g) => console.log(`  - ${g.email} / password123`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });








