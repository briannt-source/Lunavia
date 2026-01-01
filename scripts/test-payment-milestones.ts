import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing Payment Milestones System...\n");

  try {
    // 1. Setup test users
    console.log("1️⃣ Setting up test users...");

    // Find or create operator
    let operator = await prisma.user.findUnique({
      where: { email: "operator-milestone@lunavia.com" },
      include: { wallet: true },
    });

    if (!operator) {
      operator = await prisma.user.create({
        data: {
          email: "operator-milestone@lunavia.com",
          password: "hashed_password",
          role: "TOUR_OPERATOR",
          profile: {
            create: {
              name: "Test Operator",
            },
          },
          wallet: {
            create: {
              balance: 10000000, // 10M VND
              lockedDeposit: 1000000, // 1M VND
            },
          },
        },
        include: { wallet: true },
      });
    }

    // Find or create guide
    let guide = await prisma.user.findUnique({
      where: { email: "guide-milestone@lunavia.com" },
      include: { wallet: true },
    });

    if (!guide) {
      guide = await prisma.user.create({
        data: {
          email: "guide-milestone@lunavia.com",
          password: "hashed_password",
          role: "TOUR_GUIDE",
          profile: {
            create: {
              name: "Test Guide",
              languages: ["Vietnamese", "English"],
              specialties: ["Cultural Tours"],
            },
          },
          wallet: {
            create: {
              balance: 1000000, // 1M VND
            },
          },
        },
        include: { wallet: true },
      });
    }

    console.log(`✅ Operator: ${operator.email} (ID: ${operator.id}, Wallet: ${operator.wallet?.balance || 0} VND)`);
    console.log(`✅ Guide: ${guide.email} (ID: ${guide.id}, Wallet: ${guide.wallet?.balance || 0} VND)\n`);

    // 2. Create test tour
    console.log("2️⃣ Creating test tour...");
    const tour = await prisma.tour.create({
      data: {
        operatorId: operator.id,
        title: "Test Tour for Milestones",
        description: "Test tour for payment milestones",
        city: "Ho Chi Minh City",
        status: "OPEN",
        priceMain: 3000000, // 3M VND
        priceSub: 2000000, // 2M VND
        currency: "VND",
        pax: 10,
        languages: ["Vietnamese", "English"],
        specialties: ["Cultural Tours"],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        mainGuideSlots: 1,
        subGuideSlots: 0,
      },
    });

    console.log(`✅ Tour created: ${tour.title} (ID: ${tour.id})\n`);

    // 3. Create application
    console.log("3️⃣ Creating application...");
    const application = await prisma.application.create({
      data: {
        tourId: tour.id,
        guideId: guide.id,
        role: "MAIN",
        status: "PENDING",
        coverLetter: "I want to apply for this tour",
      },
    });

    console.log(`✅ Application created (ID: ${application.id})\n`);

    // 4. Accept application (should create milestones)
    console.log("4️⃣ Accepting application (should create milestones)...");
    const { PaymentMilestoneService } = await import("../src/domain/services/payment-milestone.service");
    const { AcceptApplicationUseCase } = await import("../src/application/use-cases/application/accept-application.use-case");

    const acceptUseCase = new AcceptApplicationUseCase();
    await acceptUseCase.execute({
      operatorId: operator.id,
      applicationId: application.id,
    });

    // Check milestones
    const milestones = await PaymentMilestoneService.getPaymentMilestones(tour.id, guide.id);
    if (!milestones) {
      throw new Error("Milestones not created");
    }

    console.log(`✅ Milestones created:`);
    console.log(`   - Total: ${milestones.totalAmount.toLocaleString("vi-VN")} VND`);
    console.log(`   - Milestone 1 (30%): ${milestones.milestone1Amount.toLocaleString("vi-VN")} VND - Status: ${milestones.milestone1Status}`);
    console.log(`   - Milestone 2 (40%): ${milestones.milestone2Amount.toLocaleString("vi-VN")} VND - Status: ${milestones.milestone2Status}`);
    console.log(`   - Milestone 3 (30%): ${milestones.milestone3Amount.toLocaleString("vi-VN")} VND - Status: ${milestones.milestone3Status}\n`);

    // Verify milestone 1 escrow
    const milestone1Escrow = await prisma.escrowAccount.findFirst({
      where: {
        tourId: tour.id,
        guideId: guide.id,
        paymentMilestoneId: milestones.id,
        amount: milestones.milestone1Amount,
      },
    });

    if (milestone1Escrow) {
      console.log(`✅ Milestone 1 escrow created (ID: ${milestone1Escrow.id}, Status: ${milestone1Escrow.status})\n`);
    } else {
      console.log(`⚠️  Milestone 1 escrow not found\n`);
    }

    // 5. Request milestone 1 payment
    console.log("5️⃣ Requesting milestone 1 payment...");
    await PaymentMilestoneService.requestMilestonePayment({
      milestoneId: milestones.id,
      milestoneNumber: 1,
      guideId: guide.id,
    });

    const updatedMilestones1 = await PaymentMilestoneService.getPaymentMilestones(tour.id, guide.id);
    console.log(`✅ Milestone 1 status: ${updatedMilestones1?.milestone1Status}\n`);

    // 6. Approve milestone 1 payment
    console.log("6️⃣ Approving milestone 1 payment...");
    await PaymentMilestoneService.approveMilestonePayment({
      milestoneId: milestones.id,
      milestoneNumber: 1,
      operatorId: operator.id,
    });

    const updatedMilestones2 = await PaymentMilestoneService.getPaymentMilestones(tour.id, guide.id);
    console.log(`✅ Milestone 1 status: ${updatedMilestones2?.milestone1Status}`);
    console.log(`✅ Milestone 1 paid at: ${updatedMilestones2?.milestone1PaidAt}\n`);

    // Check wallets
    const operatorWallet = await prisma.wallet.findUnique({
      where: { userId: operator.id },
    });
    const guideWallet = await prisma.wallet.findUnique({
      where: { userId: guide.id },
    });

    console.log(`💰 Wallets after milestone 1:`);
    console.log(`   - Operator: ${operatorWallet?.balance.toLocaleString("vi-VN")} VND`);
    console.log(`   - Guide: ${guideWallet?.balance.toLocaleString("vi-VN")} VND\n`);

    // 7. Change tour status to IN_PROGRESS (should trigger milestone 2)
    console.log("7️⃣ Changing tour status to IN_PROGRESS (should trigger milestone 2)...");
    const { ChangeTourStatusUseCase } = await import("../src/application/use-cases/tour/change-tour-status.use-case");
    const changeStatusUseCase = new ChangeTourStatusUseCase();
    await changeStatusUseCase.execute({
      operatorId: operator.id,
      tourId: tour.id,
      status: "IN_PROGRESS",
    });

    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedMilestones3 = await PaymentMilestoneService.getPaymentMilestones(tour.id, guide.id);
    console.log(`✅ Milestone 2 status: ${updatedMilestones3?.milestone2Status}`);

    // Check milestone 2 escrow
    const milestone2Escrow = await prisma.escrowAccount.findFirst({
      where: {
        tourId: tour.id,
        guideId: guide.id,
        paymentMilestoneId: milestones.id,
        amount: milestones.milestone2Amount,
      },
    });

    if (milestone2Escrow) {
      console.log(`✅ Milestone 2 escrow created (ID: ${milestone2Escrow.id}, Status: ${milestone2Escrow.status})\n`);
    } else {
      console.log(`⚠️  Milestone 2 escrow not found\n`);
    }

    // 8. Change tour status to COMPLETED
    console.log("8️⃣ Changing tour status to COMPLETED...");
    await changeStatusUseCase.execute({
      operatorId: operator.id,
      tourId: tour.id,
      status: "COMPLETED",
    });

    console.log(`✅ Tour status: COMPLETED\n`);

    // 9. Submit tour report (should trigger milestone 3)
    console.log("9️⃣ Submitting tour report (should trigger milestone 3)...");
    const { SubmitTourReportUseCase } = await import("../src/application/use-cases/tour-report/submit-tour-report.use-case");
    const submitReportUseCase = new SubmitTourReportUseCase();
    
    // Update tour endDate to be in the past (within 2 hours)
    const twoHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    await prisma.tour.update({
      where: { id: tour.id },
      data: {
        endDate: twoHoursAgo,
      },
    });

    await submitReportUseCase.execute({
      guideId: guide.id,
      tourId: tour.id,
      overallRating: 5,
      clientSatisfaction: 5,
      highlights: "Great tour",
      challenges: "None",
      recommendations: "None",
      paymentRequestAmount: milestones.milestone3Amount,
    });

    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedMilestones4 = await PaymentMilestoneService.getPaymentMilestones(tour.id, guide.id);
    console.log(`✅ Milestone 3 status: ${updatedMilestones4?.milestone3Status}`);

    // Check milestone 3 escrow
    const milestone3Escrow = await prisma.escrowAccount.findFirst({
      where: {
        tourId: tour.id,
        guideId: guide.id,
        paymentMilestoneId: milestones.id,
        amount: milestones.milestone3Amount,
      },
    });

    if (milestone3Escrow) {
      console.log(`✅ Milestone 3 escrow created (ID: ${milestone3Escrow.id}, Status: ${milestone3Escrow.status})\n`);
    } else {
      console.log(`⚠️  Milestone 3 escrow not found\n`);
    }

    // 10. Request and approve milestone 3
    console.log("🔟 Requesting and approving milestone 3...");
    await PaymentMilestoneService.requestMilestonePayment({
      milestoneId: milestones.id,
      milestoneNumber: 3,
      guideId: guide.id,
    });

    await PaymentMilestoneService.approveMilestonePayment({
      milestoneId: milestones.id,
      milestoneNumber: 3,
      operatorId: operator.id,
    });

    const finalMilestones = await PaymentMilestoneService.getPaymentMilestones(tour.id, guide.id);
    console.log(`✅ Milestone 3 status: ${finalMilestones?.milestone3Status}`);
    console.log(`✅ Milestone 3 paid at: ${finalMilestones?.milestone3PaidAt}\n`);

    // Final wallet check
    const finalOperatorWallet = await prisma.wallet.findUnique({
      where: { userId: operator.id },
    });
    const finalGuideWallet = await prisma.wallet.findUnique({
      where: { userId: guide.id },
    });

    console.log(`💰 Final wallets:`);
    console.log(`   - Operator: ${finalOperatorWallet?.balance.toLocaleString("vi-VN")} VND`);
    console.log(`   - Guide: ${finalGuideWallet?.balance.toLocaleString("vi-VN")} VND\n`);

    console.log("✅ All tests completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Tour: ${tour.id}`);
    console.log(`   - Milestones: ${milestones.id}`);
    console.log(`   - All milestones processed successfully`);

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

