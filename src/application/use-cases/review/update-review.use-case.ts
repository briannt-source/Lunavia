import { ReviewService } from "@/domain/services/review.service";

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

export class UpdateReviewUseCase {
  async execute(input: UpdateReviewInput) {
    return ReviewService.updateReview(input);
  }
}

