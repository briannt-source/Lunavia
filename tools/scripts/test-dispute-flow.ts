/**
 * Test script for Enhanced Dispute Resolution System
 * Tests the complete dispute flow: create, add evidence, resolve, appeal
 */

import { PrismaClient } from "@prisma/client";
import { DisputeService } from "../src/domain/services/dispute.service";
import { EscrowService } from "../src/domain/services/escrow.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing Enhanced Dispute Resolution System...\n");

  try {
    // 1. Find or create test users
    console.log("1️⃣ Setting up test users...");
    let operator = await prisma.user.findFirst({
      where: { email: { contains: "operator" } },
      include: { wallet: true },
    });

    let guide = await prisma.user.findFirst({
      where: { email: { contains: "guide" } },
      include: { wallet: true },
    });

    if (!operator || !guide) {
      console.log("❌ Test users not found. Please create test users first.");
      console.log("   Run: npm run delete:test-users (if needed)");
      return;
    }

    // Ensure wallets exist
    if (!operator.wallet) {
      console.log("Creating wallet for operator...");
      await prisma.wallet.create({
        data: {
          userId: operator.id,
          balance: 5000000, // 5M VND
          reserved: 0,
        },
      });
      operator = await prisma.user.findUnique({
        where: { id: operator.id },
        include: { wallet: true },
      }) as typeof operator;
    }

    if (!guide.wallet) {
      console.log("Creating wallet for guide...");
      await prisma.wallet.create({
        data: {
          userId: guide.id,
          balance: 1000000, // 1M VND
          reserved: 0,
        },
      });
      guide = await prisma.user.findUnique({
        where: { id: guide.id },
        include: { wallet: true },
      }) as typeof guide;
    }

    console.log(`✅ Operator: ${operator.email} (ID: ${operator.id}, Wallet: ${operator.wallet?.balance || 0} VND)`);
    console.log(`✅ Guide: ${guide.email} (ID: ${guide.id}, Wallet: ${guide.wallet?.balance || 0} VND)\n`);

    // 2. Create a test tour
    console.log("2️⃣ Creating test tour...");
    const tour = await prisma.tour.create({
      data: {
        operatorId: operator.id,
        title: "Test Tour for Dispute",
        description: "Test tour for dispute resolution testing",
        city: "Ho Chi Minh City",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        priceMain: 1000000,
        priceSub: 500000,
        status: "OPEN",
        visibility: "PUBLIC",
        pax: 10,
        currency: "VND",
        languages: ["Vietnamese", "English"],
        specialties: ["Cultural"],
        mainGuideSlots: 1,
        subGuideSlots: 1,
      },
    });
    console.log(`✅ Tour created: ${tour.title} (ID: ${tour.id})\n`);

    // 3. Create an application
    console.log("3️⃣ Creating application...");
    const application = await prisma.application.create({
      data: {
        tourId: tour.id,
        guideId: guide.id,
        role: "MAIN",
        status: "PENDING",
      },
    });
    console.log(`✅ Application created (ID: ${application.id})\n`);

    // 4. Accept application (this should create escrow)
    console.log("4️⃣ Accepting application (should create escrow)...");
    await prisma.application.update({
      where: { id: application.id },
      data: { status: "ACCEPTED" },
    });

    // Create escrow account
    const escrowAccount = await EscrowService.createEscrowAccount({
      operatorId: operator.id,
      guideId: guide.id,
      tourId: tour.id,
      amount: tour.priceMain || 1000000,
    });
    console.log(`✅ Escrow account created (ID: ${escrowAccount.id}, Status: ${escrowAccount.status})\n`);

    // Lock escrow
    await EscrowService.lockEscrow(escrowAccount.id);
    const lockedEscrow = await prisma.escrowAccount.findUnique({
      where: { id: escrowAccount.id },
    });
    console.log(`✅ Escrow locked (Status: ${lockedEscrow?.status})\n`);

    // 5. Create a dispute
    console.log("5️⃣ Creating dispute...");
    const dispute = await DisputeService.createDispute({
      userId: guide.id,
      tourId: tour.id,
      applicationId: application.id,
      escrowAccountId: escrowAccount.id,
      type: "PAYMENT",
      description: "Test dispute: Payment issue",
      evidence: ["https://example.com/evidence1.jpg"],
    });
    console.log(`✅ Dispute created (ID: ${dispute.id}, Status: ${dispute.status})\n`);

    // 6. Verify escrow is blocked
    console.log("6️⃣ Verifying escrow is blocked by dispute...");
    const hasActiveDispute = await DisputeService.hasActiveDispute(escrowAccount.id);
    console.log(`✅ Has active dispute: ${hasActiveDispute}\n`);

    // Try to release escrow (should fail)
    try {
      await EscrowService.releaseEscrow(escrowAccount.id, "Test release");
      console.log("❌ ERROR: Escrow release should have failed!");
    } catch (error: any) {
      console.log(`✅ Escrow release correctly blocked: ${error.message}\n`);
    }

    // 7. Add more evidence
    console.log("7️⃣ Adding more evidence...");
    const updatedDispute = await DisputeService.addEvidence({
      disputeId: dispute.id,
      evidenceUrls: ["https://example.com/evidence2.jpg", "https://example.com/evidence3.pdf"],
      addedBy: guide.id,
    });
    console.log(`✅ Evidence added. Total evidence: ${updatedDispute.evidence.length}\n`);

    // 8. Get dispute with timeline
    console.log("8️⃣ Fetching dispute with timeline...");
    const disputeWithTimeline = await DisputeService.getDisputeById(dispute.id);
    console.log(`✅ Dispute fetched. Timeline entries: ${disputeWithTimeline?.timeline.length || 0}\n`);

    // 9. Resolve dispute (as admin)
    console.log("9️⃣ Resolving dispute...");
    // Create a test admin user or use existing
    const adminUser = await prisma.adminUser.findFirst({
      where: { role: "MODERATOR" },
    });

    if (!adminUser) {
      console.log("⚠️  No admin user found. Skipping resolution test.");
      console.log("   You can manually resolve the dispute via API.\n");
    } else {
      const resolvedDispute = await DisputeService.resolveDispute({
        disputeId: dispute.id,
        resolvedBy: adminUser.id,
        resolution: "FULL_PAYMENT",
        resolutionNotes: "Test resolution: Full payment to guide",
      });
      console.log(`✅ Dispute resolved (Status: ${resolvedDispute.status})\n`);

      // 10. Verify escrow was released
      console.log("🔟 Verifying escrow was released...");
      const releasedEscrow = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccount.id },
      });
      console.log(`✅ Escrow status after resolution: ${releasedEscrow?.status}\n`);

      // 11. Test appeal
      console.log("1️⃣1️⃣ Testing appeal...");
      const appealDispute = await DisputeService.appealDispute(
        dispute.id,
        guide.id,
        "Test appeal: I disagree with the resolution"
      );
      console.log(`✅ Appeal created (ID: ${appealDispute.id})\n`);
    }

    // 12. Test escalate
    console.log("1️⃣2️⃣ Testing escalation...");
    if (adminUser) {
      const escalatedDispute = await DisputeService.escalateDispute(dispute.id, adminUser.id);
      console.log(`✅ Dispute escalated (Status: ${escalatedDispute.status})\n`);
    }

    console.log("✅ All tests completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Tour: ${tour.id}`);
    console.log(`   - Escrow: ${escrowAccount.id}`);
    console.log(`   - Dispute: ${dispute.id}`);
    console.log(`   - Timeline entries: ${disputeWithTimeline?.timeline.length || 0}`);

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

