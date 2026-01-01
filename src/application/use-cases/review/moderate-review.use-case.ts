import { ReviewService } from "@/domain/services/review.service";

export interface ModerateReviewInput {
  reviewId: string;
  adminId: string;
  action: "APPROVE" | "REJECT" | "FLAG";
  note?: string;
  flagReason?: string;
}

export class ModerateReviewUseCase {
  async execute(input: ModerateReviewInput) {
    return ReviewService.moderateReview(input);
  }
}

