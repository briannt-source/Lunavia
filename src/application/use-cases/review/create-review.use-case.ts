import { ReviewService } from "@/domain/services/review.service";
import { NotificationService } from "@/domain/services/notification.service";

export interface CreateReviewInput {
  reviewerId: string;
  subjectId: string;
  tourId?: string;
  professionalismRating: number;
  communicationRating: number;
  punctualityRating: number;
  knowledgeRating: number;
  overallRating: number;
  comment?: string;
  photos?: string[];
}

export class CreateReviewUseCase {
  async execute(input: CreateReviewInput) {
    // Create review using service
    const review = await ReviewService.createReview(input);

    // Notify subject about new review
    await NotificationService.notifyNewReview(input.subjectId, review.id);

    return review;
  }
}

