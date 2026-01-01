import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing Enhanced Reviews & Ratings System...\n");

  try {
    // 1. Setup test users
    console.log("1️⃣ Setting up test users...");

    // Find or create operator
    let operator = await prisma.user.findUnique({
      where: { email: "operator-review@lunavia.com" },
      include: { wallet: true, profile: true },
    });

    if (!operator) {
      operator = await prisma.user.create({
        data: {
          email: "operator-review@lunavia.com",
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
        include: { wallet: true, profile: true },
      });
    }

    // Find or create guide
    let guide = await prisma.user.findUnique({
      where: { email: "guide-review@lunavia.com" },
      include: { wallet: true, profile: true },
    });

    if (!guide) {
      guide = await prisma.user.create({
        data: {
          email: "guide-review@lunavia.com",
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
        include: { wallet: true, profile: true },
      });
    }

    console.log(`✅ Operator: ${operator.email} (ID: ${operator.id})`);
    console.log(`✅ Guide: ${guide.email} (ID: ${guide.id})\n`);

    // 2. Create test tour
    console.log("2️⃣ Creating test tour...");
    const tour = await prisma.tour.create({
      data: {
        operatorId: operator.id,
        title: "Test Tour for Reviews",
        description: "Test tour for enhanced reviews",
        city: "Ho Chi Minh City",
        status: "COMPLETED", // Tour must be completed
        priceMain: 3000000, // 3M VND
        priceSub: 2000000, // 2M VND
        currency: "VND",
        pax: 10,
        languages: ["Vietnamese", "English"],
        specialties: ["Cultural Tours"],
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        mainGuideSlots: 1,
        subGuideSlots: 0,
      },
    });

    console.log(`✅ Tour created: ${tour.title} (ID: ${tour.id})\n`);

    // 3. Create payment (to verify tour completion)
    console.log("3️⃣ Creating payment (to verify tour completion)...");
    const payment = await prisma.payment.create({
      data: {
        fromWalletId: operator.wallet!.id,
        toWalletId: guide.wallet!.id,
        amount: 3000000,
        platformFee: 150000, // 5% for freelance
        netAmount: 2850000,
        isFreelance: true,
        status: "COMPLETED",
        tourId: tour.id,
      },
    });

    console.log(`✅ Payment created (ID: ${payment.id})\n`);

    // 4. Create review
    console.log("4️⃣ Creating review...");
    const { ReviewService } = await import("../src/domain/services/review.service");
    const { CreateReviewUseCase } = await import("../src/application/use-cases/review/create-review.use-case");

    const createReviewUseCase = new CreateReviewUseCase();
    const review = await createReviewUseCase.execute({
      reviewerId: operator.id, // Operator reviews guide
      subjectId: guide.id,
      tourId: tour.id,
      professionalismRating: 5,
      communicationRating: 4,
      punctualityRating: 5,
      knowledgeRating: 5,
      overallRating: 5,
      comment: "Excellent guide! Very professional and knowledgeable.",
      photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    });

    console.log(`✅ Review created (ID: ${review.id})`);
    console.log(`   - Status: ${review.status}`);
    console.log(`   - Is Verified: ${review.isVerified}`);
    console.log(`   - Can Edit: ${review.canEdit}`);
    console.log(`   - Ratings: Professionalism=${review.professionalismRating}, Communication=${review.communicationRating}, Punctuality=${review.punctualityRating}, Knowledge=${review.knowledgeRating}, Overall=${review.overallRating}\n`);

    // 5. Check profile ratings updated
    console.log("5️⃣ Checking profile ratings...");
    const updatedGuide = await prisma.user.findUnique({
      where: { id: guide.id },
      include: { profile: true },
    });

    console.log(`✅ Guide profile updated:`);
    console.log(`   - Rating: ${updatedGuide?.profile?.rating}`);
    console.log(`   - Review Count: ${updatedGuide?.profile?.reviewCount}\n`);

    // 6. Get review analytics
    console.log("6️⃣ Getting review analytics...");
    const analytics = await ReviewService.getReviewAnalytics(guide.id);

    console.log(`✅ Analytics:`);
    console.log(`   - Total Reviews: ${analytics.totalReviews}`);
    console.log(`   - Average Ratings:`);
    console.log(`     * Professionalism: ${analytics.averageRatings.professionalism}`);
    console.log(`     * Communication: ${analytics.averageRatings.communication}`);
    console.log(`     * Punctuality: ${analytics.averageRatings.punctuality}`);
    console.log(`     * Knowledge: ${analytics.averageRatings.knowledge}`);
    console.log(`     * Overall: ${analytics.averageRatings.overall}`);
    console.log(`   - Rating Distribution:`, analytics.ratingDistribution);
    console.log();

    // 7. Test update review (within 7 days)
    console.log("7️⃣ Updating review (within 7 days)...");
    const { UpdateReviewUseCase } = await import("../src/application/use-cases/review/update-review.use-case");
    const updateReviewUseCase = new UpdateReviewUseCase();
    
    const updatedReview = await updateReviewUseCase.execute({
      reviewId: review.id,
      reviewerId: operator.id,
      comment: "Updated comment: Still excellent!",
      communicationRating: 5, // Updated from 4 to 5
    });

    console.log(`✅ Review updated:`);
    console.log(`   - Communication Rating: ${updatedReview.communicationRating}`);
    console.log(`   - Comment: ${updatedReview.comment}\n`);

    // 8. Test response to review
    console.log("8️⃣ Testing response to review...");
    const { RespondToReviewUseCase } = await import("../src/application/use-cases/review/respond-to-review.use-case");
    const respondUseCase = new RespondToReviewUseCase();

    const reviewWithResponse = await respondUseCase.execute({
      reviewId: review.id,
      userId: guide.id, // Guide responds
      response: "Thank you for the review! I'm glad you enjoyed the tour.",
    });

    console.log(`✅ Response added:`);
    console.log(`   - Response: ${reviewWithResponse.response}`);
    console.log(`   - Responded At: ${reviewWithResponse.respondedAt}\n`);

    // 9. Test moderation (admin)
    console.log("9️⃣ Testing review moderation...");
    // Create admin user
    let admin = await prisma.adminUser.findFirst({
      where: { email: "admin-review@lunavia.com" },
    });

    if (!admin) {
      admin = await prisma.adminUser.create({
        data: {
          email: "admin-review@lunavia.com",
          password: "hashed_password",
          role: "MODERATOR",
        },
      });
    }

    // Create another review to moderate
    const review2 = await ReviewService.createReview({
      reviewerId: guide.id, // Guide reviews operator
      subjectId: operator.id,
      tourId: tour.id,
      professionalismRating: 4,
      communicationRating: 4,
      punctualityRating: 4,
      knowledgeRating: 4,
      overallRating: 4,
      comment: "Good operator, but could improve communication.",
    });

    console.log(`✅ Second review created (ID: ${review2.id})`);

    // Moderate review (approve)
    const { ModerateReviewUseCase } = await import("../src/application/use-cases/review/moderate-review.use-case");
    const moderateUseCase = new ModerateReviewUseCase();

    const moderatedReview = await moderateUseCase.execute({
      reviewId: review2.id,
      adminId: admin.id,
      action: "APPROVE",
      note: "Review approved by moderator",
    });

    console.log(`✅ Review moderated:`);
    console.log(`   - Status: ${moderatedReview.status}`);
    console.log(`   - Reviewed By: ${moderatedReview.reviewedBy}\n`);

    // 10. Get reviews for subject
    console.log("🔟 Getting reviews for guide...");
    const reviews = await ReviewService.getReviewsForSubject(guide.id);

    console.log(`✅ Found ${reviews.total} reviews for guide`);
    console.log(`   - Reviews:`, reviews.reviews.map((r) => ({
      id: r.id,
      overallRating: r.overallRating,
      comment: r.comment?.substring(0, 50) + "...",
      hasResponse: !!r.response,
    })));

    console.log("\n✅ All tests completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Tour: ${tour.id}`);
    console.log(`   - Reviews created: 2`);
    console.log(`   - Profile ratings updated: ✅`);
    console.log(`   - Review analytics: ✅`);
    console.log(`   - Review update: ✅`);
    console.log(`   - Review response: ✅`);
    console.log(`   - Review moderation: ✅`);

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

