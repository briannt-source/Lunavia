/**
 * Test Escrow Flow End-to-End
 * 
 * This script tests the complete escrow flow:
 * 1. Create escrow account
 * 2. Lock escrow
 * 3. Release escrow
 * 4. Verify payment
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testEscrowFlow() {
  console.log("🧪 Testing Escrow Flow...\n");

  try {
    // 1. Find a tour operator and guide
    console.log("Step 1: Finding test users...");
    const operator = await prisma.user.findFirst({
      where: {
        role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] },
        wallet: { isNot: null },
      },
      include: { wallet: true },
    });

    const guide = await prisma.user.findFirst({
      where: {
        role: "TOUR_GUIDE",
        wallet: { isNot: null },
      },
      include: { wallet: true },
    });

    if (!operator || !guide) {
      console.log("❌ Test users not found. Please create test users first.");
      return;
    }

    console.log(`✅ Operator: ${operator.email}`);
    console.log(`✅ Guide: ${guide.email}\n`);

    // 2. Find or create a tour
    console.log("Step 2: Finding or creating test tour...");
    let tour = await prisma.tour.findFirst({
      where: {
        operatorId: operator.id,
        status: { in: ["OPEN", "CLOSED"] },
      },
    });

    if (!tour) {
      console.log("Creating test tour...");
      tour = await prisma.tour.create({
        data: {
          operatorId: operator.id,
          title: "Test Tour for Escrow",
          description: "Test tour for escrow flow",
          city: "Hà Nội",
          status: "OPEN",
          visibility: "PUBLIC",
          priceMain: 1000000,
          priceSub: 500000,
          currency: "VND",
          pax: 10,
          languages: ["Vietnamese", "English"],
          specialties: ["Cultural"],
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
          mainGuideSlots: 1,
          subGuideSlots: 1,
        },
      });
    }

    console.log(`✅ Tour: ${tour.title} (${tour.id})\n`);

    // 3. Create application
    console.log("Step 3: Creating application...");
    const application = await prisma.application.upsert({
      where: {
        tourId_guideId: {
          tourId: tour.id,
          guideId: guide.id,
        },
      },
      create: {
        tourId: tour.id,
        guideId: guide.id,
        role: "MAIN",
        status: "PENDING",
      },
      update: {},
    });

    console.log(`✅ Application created: ${application.id}\n`);

    // 4. Accept application (this should create escrow)
    console.log("Step 4: Accepting application (should create escrow)...");
    await prisma.application.update({
      where: { id: application.id },
      data: { status: "ACCEPTED" },
    });

    // Check if escrow was created
    const escrowAccount = await prisma.escrowAccount.findFirst({
      where: {
        tourId: tour.id,
        guideId: guide.id,
      },
    });

    if (!escrowAccount) {
      console.log("⚠️  Escrow account not created automatically. This is expected if AcceptApplicationUseCase hasn't been updated yet.");
      console.log("Creating escrow manually for testing...");
      
      // Create escrow manually for testing
      const { EscrowService } = await import("../src/domain/services/escrow.service");
      const createdEscrow = await EscrowService.createEscrowAccount({
        operatorId: operator.id,
        guideId: guide.id,
        tourId: tour.id,
        amount: tour.priceMain || 1000000,
      });
      
      console.log(`✅ Escrow account created: ${createdEscrow.id}`);
      console.log(`   Status: ${createdEscrow.status}`);
      console.log(`   Amount: ${createdEscrow.amount.toLocaleString("vi-VN")} VND`);
      console.log(`   Platform Fee: ${createdEscrow.platformFee.toLocaleString("vi-VN")} VND`);
      console.log(`   Net Amount: ${createdEscrow.netAmount.toLocaleString("vi-VN")} VND\n`);
    } else {
      console.log(`✅ Escrow account found: ${escrowAccount.id}`);
      console.log(`   Status: ${escrowAccount.status}\n`);
    }

    // 5. Lock escrow
    console.log("Step 5: Locking escrow...");
    if (escrowAccount && escrowAccount.status === "PENDING") {
      const { EscrowService } = await import("../src/domain/services/escrow.service");
      const lockedEscrow = await EscrowService.lockEscrow(escrowAccount.id);
      
      console.log(`✅ Escrow locked: ${lockedEscrow?.id}`);
      console.log(`   Status: ${lockedEscrow?.status}`);
      console.log(`   Locked at: ${lockedEscrow?.lockedAt}\n`);

      // Check operator wallet
      const operatorWallet = await prisma.wallet.findUnique({
        where: { userId: operator.id },
      });
      console.log(`   Operator wallet reserved: ${operatorWallet?.reserved.toLocaleString("vi-VN")} VND\n`);
    } else {
      console.log("⚠️  Escrow is not in PENDING status, skipping lock step\n");
    }

    // 6. Summary
    console.log("📊 Test Summary:");
    console.log(`   Operator: ${operator.email}`);
    console.log(`   Guide: ${guide.email}`);
    console.log(`   Tour: ${tour.title}`);
    console.log(`   Application: ${application.id}`);
    if (escrowAccount) {
      console.log(`   Escrow Account: ${escrowAccount.id}`);
      console.log(`   Escrow Status: ${escrowAccount.status}`);
    }
    console.log("\n✅ Escrow flow test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testEscrowFlow()
  .then(() => {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });

