# Enhanced Reviews & Ratings System Design

## Tổng quan

Hệ thống đánh giá chi tiết và đáng tin cậy với multi-dimensional ratings, verification, moderation, và analytics.

## Tính năng

### 1. Multi-dimensional Ratings
- **Professionalism** (1-5): Mức độ chuyên nghiệp
- **Communication** (1-5): Khả năng giao tiếp
- **Punctuality** (1-5): Đúng giờ
- **Knowledge** (1-5): Kiến thức về tour/địa điểm
- **Overall** (1-5): Đánh giá tổng thể

### 2. Verified Reviews
- Chỉ users đã complete tour mới được review
- Reviews không thể edit sau 7 ngày
- Photo evidence trong reviews
- Review status tracking (PENDING, APPROVED, REJECTED, FLAGGED)

### 3. Review Moderation
- Admin review suspicious reviews
- Flag và remove fake reviews
- Response system (operator/guide có thể reply)
- Review history tracking

### 4. Review Analytics
- Average ratings (per dimension)
- Rating trends over time
- Review distribution (1-5 stars)
- Review count per user

## Database Schema

### Enhanced Review Model
```prisma
model Review {
  id              String        @id @default(cuid())
  reviewerId      String
  reviewer        User          @relation("ReviewsGiven", fields: [reviewerId], references: [id], onDelete: Cascade)
  subjectId      String
  subject        User          @relation("ReviewsReceived", fields: [subjectId], references: [id], onDelete: Cascade)
  tourId         String?
  tour           Tour?         @relation("TourReviews", fields: [tourId], references: [id], onDelete: SetNull)
  
  // Multi-dimensional ratings
  professionalismRating Int     // 1-5
  communicationRating   Int     // 1-5
  punctualityRating     Int     // 1-5
  knowledgeRating       Int     // 1-5
  overallRating         Int     // 1-5
  
  comment         String?       @db.Text
  photos          String[]      // URLs to photo evidence
  
  // Verification & Moderation
  status          ReviewStatus  @default(PENDING)
  isVerified      Boolean       @default(false) // Only verified if user completed tour
  canEdit         Boolean       @default(true)  // Can edit within 7 days
  editDeadline    DateTime?     // 7 days after creation
  
  // Moderation
  isFlagged       Boolean       @default(false)
  flaggedBy       String?       // Admin user ID
  flaggedAt       DateTime?
  flagReason      String?       @db.Text
  reviewedBy      String?       // Admin user ID
  reviewedAt      DateTime?
  reviewNote      String?       @db.Text
  
  // Response system
  response        String?       @db.Text
  responseBy      String?       // User ID who responded
  respondedAt     DateTime?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @default(now()) @updatedAt
  editedAt       DateTime?     // Track when review was last edited
  
  @@index([reviewerId])
  @@index([subjectId])
  @@index([tourId])
  @@index([status])
  @@index([isVerified])
  @@map("reviews")
}

enum ReviewStatus {
  PENDING   // Awaiting moderation
  APPROVED  // Approved and visible
  REJECTED  // Rejected by admin
  FLAGGED   // Flagged for review
}
```

## Business Rules

### Review Creation
1. **Verification:** Chỉ users đã complete tour (status = COMPLETED và có payment) mới được review
2. **One Review Per Tour:** Mỗi user chỉ có thể review một lần cho mỗi tour
3. **Edit Window:** Reviews có thể edit trong 7 ngày sau khi tạo
4. **Photo Evidence:** Optional, tối đa 5 photos

### Review Moderation
1. **Auto-approve:** Reviews từ verified users (completed tours) được auto-approve
2. **Manual Review:** Reviews từ unverified users hoặc có suspicious patterns cần admin review
3. **Flag System:** Admin có thể flag reviews để review sau
4. **Rejection:** Admin có thể reject fake/inappropriate reviews

### Response System
1. **Who Can Respond:** Subject (operator/guide) có thể respond to reviews
2. **One Response:** Chỉ một response per review
3. **Response Deadline:** Response có thể được edit trong 7 ngày

### Analytics
1. **Average Ratings:** Tính average cho từng dimension
2. **Rating Trends:** Track rating changes over time
3. **Review Distribution:** Count reviews per rating (1-5 stars)
4. **Update Profile:** Auto-update user profile rating và reviewCount

## Implementation Plan

### Phase 1: Database & Models
1. Update Review model với multi-dimensional ratings
2. Add ReviewStatus enum
3. Add moderation fields
4. Add response system fields
5. Create migration

### Phase 2: Services & Use Cases
1. ReviewService - Create, update, moderate reviews
2. CreateReviewUseCase - Create review với verification
3. UpdateReviewUseCase - Update review (within 7 days)
4. ModerateReviewUseCase - Admin moderate reviews
5. RespondToReviewUseCase - Subject respond to review
6. ReviewAnalyticsService - Calculate ratings và trends

### Phase 3: Integration
1. Integrate với tour completion flow
2. Auto-update profile ratings
3. Notification system for reviews
4. Review moderation dashboard

### Phase 4: Test
1. Test review creation với verification
2. Test edit window (7 days)
3. Test moderation flow
4. Test response system
5. Test analytics calculation

