import { prisma } from "@/lib/prisma";
import { ReviewStatus } from "@prisma/client";

export interface CreateReviewInput {
  reviewerId: string;
  subjectId: string;
  tourId?: string;
  professionalismRating: number; // 1-5
  communicationRating: number; // 1-5
  punctualityRating: number; // 1-5
  knowledgeRating: number; // 1-5
  overallRating: number; // 1-5
  comment?: string;
  photos?: string[];
}

export interface UpdateReviewInput {
  reviewId: string;
  reviewerId: string;
  professionalismRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  knowledgeRating?: number;
  overallRating?: number;
  comment?: string;
  photos?: string[];
}

export interface ModerateReviewInput {
  reviewId: string;
  adminId: string;
  action: "APPROVE" | "REJECT" | "FLAG";
  note?: string;
  flagReason?: string;
}

export interface RespondToReviewInput {
  reviewId: string;
  userId: string; // Subject (operator/guide) who responds
  response: string;
}

export class ReviewService {
  /**
   * Verify if user can create review (must have completed tour)
   */
  static async canCreateReview(reviewerId: string, subjectId: string, tourId?: string): Promise<boolean> {
    if (!tourId) {
      return false; // Review must be associated with a tour
    }

    // Check if reviewer has completed the tour (has payment)
    const payment = await prisma.payment.findFirst({
      where: {
        tourId,
        OR: [
          {
            fromWallet: {
              userId: reviewerId,
            },
          },
          {
            toWallet: {
              userId: reviewerId,
            },
          },
        ],
        status: "COMPLETED",
      },
    });

    if (!payment) {
      return false; // No payment found, tour not completed
    }

    // Check if tour is completed
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour || tour.status !== "COMPLETED") {
      return false;
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId,
        subjectId,
        tourId,
      },
    });

    return !existingReview; // Can create if no existing review
  }

  /**
   * Create a new review
   */
  static async createReview(input: CreateReviewInput) {
    // Verify user can create review
    const canCreate = await this.canCreateReview(input.reviewerId, input.subjectId, input.tourId);
    if (!canCreate) {
      throw new Error("You can only review users after completing a tour together");
    }

    // Validate ratings (1-5)
    const ratings = [
      input.professionalismRating,
      input.communicationRating,
      input.punctualityRating,
      input.knowledgeRating,
      input.overallRating,
    ];

    for (const rating of ratings) {
      if (rating < 1 || rating > 5) {
        throw new Error("All ratings must be between 1 and 5");
      }
    }

    // Calculate edit deadline (7 days from now)
    const editDeadline = new Date();
    editDeadline.setDate(editDeadline.getDate() + 7);

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: input.reviewerId,
        subjectId: input.subjectId,
        tourId: input.tourId,
        professionalismRating: input.professionalismRating,
        communicationRating: input.communicationRating,
        punctualityRating: input.punctualityRating,
        knowledgeRating: input.knowledgeRating,
        overallRating: input.overallRating,
        comment: input.comment,
        photos: input.photos || [],
        status: ReviewStatus.APPROVED, // Auto-approve verified reviews
        isVerified: true, // Verified because user completed tour
        canEdit: true,
        editDeadline,
      },
    });

    // Update subject's profile ratings
    await this.updateProfileRatings(input.subjectId);

    return review;
  }

  /**
   * Update an existing review (within 7 days)
   */
  static async updateReview(input: UpdateReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: input.reviewId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.reviewerId !== input.reviewerId) {
      throw new Error("Unauthorized: You can only edit your own reviews");
    }

    if (!review.canEdit) {
      throw new Error("Review can no longer be edited (7-day window has passed)");
    }

    if (review.editDeadline && new Date() > review.editDeadline) {
      // Update canEdit flag
      await prisma.review.update({
        where: { id: input.reviewId },
        data: { canEdit: false },
      });
      throw new Error("Review can no longer be edited (7-day window has passed)");
    }

    // Validate ratings if provided
    const ratings = [
      input.professionalismRating,
      input.communicationRating,
      input.punctualityRating,
      input.knowledgeRating,
      input.overallRating,
    ].filter((r) => r !== undefined) as number[];

    for (const rating of ratings) {
      if (rating < 1 || rating > 5) {
        throw new Error("All ratings must be between 1 and 5");
      }
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        professionalismRating: input.professionalismRating ?? review.professionalismRating,
        communicationRating: input.communicationRating ?? review.communicationRating,
        punctualityRating: input.punctualityRating ?? review.punctualityRating,
        knowledgeRating: input.knowledgeRating ?? review.knowledgeRating,
        overallRating: input.overallRating ?? review.overallRating,
        comment: input.comment ?? review.comment,
        photos: input.photos ?? review.photos,
        editedAt: new Date(),
      },
    });

    // Update subject's profile ratings
    await this.updateProfileRatings(review.subjectId);

    return updatedReview;
  }

  /**
   * Moderate a review (admin only)
   */
  static async moderateReview(input: ModerateReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: input.reviewId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    let updateData: any = {
      reviewedBy: input.adminId,
      reviewedAt: new Date(),
      reviewNote: input.note,
    };

    if (input.action === "APPROVE") {
      updateData.status = ReviewStatus.APPROVED;
      updateData.isFlagged = false;
    } else if (input.action === "REJECT") {
      updateData.status = ReviewStatus.REJECTED;
      updateData.isFlagged = false;
    } else if (input.action === "FLAG") {
      updateData.status = ReviewStatus.FLAGGED;
      updateData.isFlagged = true;
      updateData.flaggedBy = input.adminId;
      updateData.flaggedAt = new Date();
      updateData.flagReason = input.flagReason;
    }

    const updatedReview = await prisma.review.update({
      where: { id: input.reviewId },
      data: updateData,
    });

    // If approved, update profile ratings
    if (input.action === "APPROVE") {
      await this.updateProfileRatings(review.subjectId);
    }

    return updatedReview;
  }

  /**
   * Respond to a review (subject can respond)
   */
  static async respondToReview(input: RespondToReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: input.reviewId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.subjectId !== input.userId) {
      throw new Error("Unauthorized: You can only respond to reviews about you");
    }

    if (review.response) {
      // Check if response can still be edited (7 days)
      const responseDeadline = review.respondedAt
        ? new Date(review.respondedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

      if (responseDeadline && new Date() > responseDeadline) {
        throw new Error("Response can no longer be edited (7-day window has passed)");
      }
    }

    const updatedReview = await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        response: input.response,
        responseBy: input.userId,
        respondedAt: new Date(),
      },
    });

    return updatedReview;
  }

  /**
   * Get reviews for a subject
   */
  static async getReviewsForSubject(subjectId: string, options?: { status?: ReviewStatus; limit?: number; offset?: number }) {
    const where: any = {
      subjectId,
      status: options?.status || ReviewStatus.APPROVED, // Only show approved reviews by default
    };

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: options?.limit,
      skip: options?.offset,
    });

    const total = await prisma.review.count({ where });

    return {
      reviews,
      total,
    };
  }

  /**
   * Get review analytics for a subject
   */
  static async getReviewAnalytics(subjectId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        subjectId,
        status: ReviewStatus.APPROVED,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRatings: {
          professionalism: 0,
          communication: 0,
          punctuality: 0,
          knowledge: 0,
          overall: 0,
        },
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    // Calculate averages
    const avgProfessionalism =
      reviews.reduce((sum, r) => sum + r.professionalismRating, 0) / reviews.length;
    const avgCommunication =
      reviews.reduce((sum, r) => sum + r.communicationRating, 0) / reviews.length;
    const avgPunctuality =
      reviews.reduce((sum, r) => sum + r.punctualityRating, 0) / reviews.length;
    const avgKnowledge =
      reviews.reduce((sum, r) => sum + r.knowledgeRating, 0) / reviews.length;
    const avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

    // Calculate rating distribution
    const distribution = {
      1: reviews.filter((r) => r.overallRating === 1).length,
      2: reviews.filter((r) => r.overallRating === 2).length,
      3: reviews.filter((r) => r.overallRating === 3).length,
      4: reviews.filter((r) => r.overallRating === 4).length,
      5: reviews.filter((r) => r.overallRating === 5).length,
    };

    return {
      totalReviews: reviews.length,
      averageRatings: {
        professionalism: Math.round(avgProfessionalism * 10) / 10,
        communication: Math.round(avgCommunication * 10) / 10,
        punctuality: Math.round(avgPunctuality * 10) / 10,
        knowledge: Math.round(avgKnowledge * 10) / 10,
        overall: Math.round(avgOverall * 10) / 10,
      },
      ratingDistribution: distribution,
    };
  }

  /**
   * Update subject's profile ratings based on approved reviews
   */
  static async updateProfileRatings(subjectId: string) {
    const analytics = await this.getReviewAnalytics(subjectId);

    // Update profile
    await prisma.profile.update({
      where: { userId: subjectId },
      data: {
        rating: analytics.averageRatings.overall,
        reviewCount: analytics.totalReviews,
      },
    });
  }

  /**
   * Get reviews pending moderation
   */
  static async getPendingReviews(limit?: number, offset?: number) {
    const reviews = await prisma.review.findMany({
      where: {
        status: ReviewStatus.PENDING,
      },
      include: {
        reviewer: {
          include: {
            profile: true,
          },
        },
        subject: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.review.count({
      where: {
        status: ReviewStatus.PENDING,
      },
    });

    return {
      reviews,
      total,
    };
  }

  /**
   * Get flagged reviews
   */
  static async getFlaggedReviews(limit?: number, offset?: number) {
    const reviews = await prisma.review.findMany({
      where: {
        status: ReviewStatus.FLAGGED,
        isFlagged: true,
      },
      include: {
        reviewer: {
          include: {
            profile: true,
          },
        },
        subject: {
          include: {
            profile: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        flaggedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.review.count({
      where: {
        status: ReviewStatus.FLAGGED,
        isFlagged: true,
      },
    });

    return {
      reviews,
      total,
    };
  }
}

