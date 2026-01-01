import { ReviewService } from "@/domain/services/review.service";

export interface RespondToReviewInput {
  reviewId: string;
  userId: string;
  response: string;
}

export class RespondToReviewUseCase {
  async execute(input: RespondToReviewInput) {
    return ReviewService.respondToReview(input);
  }
}

