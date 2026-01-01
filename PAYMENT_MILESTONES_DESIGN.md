# Payment Milestones Design Document

## Tổng quan

Hệ thống Payment Milestones cho phép chia payment thành nhiều milestones, giúp giảm risk cho cả operator và guide, và tạo fair payment distribution.

## Tính năng

### 1. Milestone Configuration
- Operator set payment milestones khi accept application/assignment:
  - **Milestone 1 (30%):** Khi accept application/assignment
  - **Milestone 2 (40%):** Khi tour bắt đầu (status = IN_PROGRESS)
  - **Milestone 3 (30%):** Khi tour hoàn thành và report submitted

### 2. Milestone Payment Flow
- Guide có thể request milestone payment
- Operator approve/reject milestone payment
- Auto-release nếu operator không respond trong X giờ (configurable, default 24h)

### 3. Integration với Escrow
- Mỗi milestone có escrow account riêng
- Hoặc một escrow account với multiple milestones
- Milestone payments được release từ escrow

## Database Schema

### PaymentMilestone Model
```prisma
model PaymentMilestone {
  id              String            @id @default(cuid())
  tourId          String
  tour            Tour              @relation(fields: [tourId], references: [id], onDelete: Cascade)
  guideId         String
  guide           User              @relation(fields: [guideId], references: [id], onDelete: Cascade)
  applicationId   String?           // If from application
  application     Application?      @relation(fields: [applicationId], references: [id], onDelete: SetNull)
  assignmentId    String?           // If from assignment
  assignment      Assignment?       @relation(fields: [assignmentId], references: [id], onDelete: SetNull)
  
  // Milestone configuration
  totalAmount     Float             // Total payment amount
  milestone1Amount Float            // Amount for milestone 1 (accept)
  milestone2Amount Float            // Amount for milestone 2 (tour start)
  milestone3Amount Float            // Amount for milestone 3 (tour complete)
  
  // Milestone status
  milestone1Status MilestoneStatus  @default(PENDING)
  milestone1PaidAt  DateTime?
  milestone1PaymentId String?       // Payment record ID
  
  milestone2Status MilestoneStatus  @default(PENDING)
  milestone2PaidAt  DateTime?
  milestone2PaymentId String?
  
  milestone3Status MilestoneStatus  @default(PENDING)
  milestone3PaidAt  DateTime?
  milestone3PaymentId String?
  
  // Auto-release settings
  autoReleaseEnabled Boolean        @default(false)
  autoReleaseHours    Int            @default(24) // Hours to wait before auto-release
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @default(now()) @updatedAt
  
  escrowAccounts  EscrowAccount[]   // One escrow per milestone or combined
  
  @@unique([tourId, guideId])
  @@index([tourId])
  @@index([guideId])
  @@map("payment_milestones")
}

enum MilestoneStatus {
  PENDING       // Not yet triggered
  REQUESTED     // Guide requested payment
  APPROVED      // Operator approved
  REJECTED      // Operator rejected
  PAID          // Payment completed
  AUTO_RELEASED // Auto-released after timeout
}
```

## Business Rules

### Milestone 1 (Accept Application/Assignment)
- **Trigger:** Khi operator accept application hoặc approve assignment
- **Amount:** 30% of total payment
- **Auto-release:** Nếu operator không reject trong 24h, auto-release
- **Escrow:** Tạo và lock escrow cho milestone 1

### Milestone 2 (Tour Start)
- **Trigger:** Khi tour status chuyển sang IN_PROGRESS
- **Amount:** 40% of total payment
- **Auto-release:** Nếu operator không reject trong 24h, auto-release
- **Escrow:** Tạo và lock escrow cho milestone 2

### Milestone 3 (Tour Complete)
- **Trigger:** Khi tour hoàn thành (status = COMPLETED) và guide submit report trong 2h
- **Amount:** 30% of total payment
- **Auto-release:** Nếu operator không reject trong 24h, auto-release
- **Escrow:** Tạo và lock escrow cho milestone 3

## Implementation Plan

### Phase 1: Database & Models
1. Add PaymentMilestone model
2. Add MilestoneStatus enum
3. Add relations to Tour, User, Application, Assignment, EscrowAccount
4. Create migration

### Phase 2: Services & Use Cases
1. PaymentMilestoneService - Create milestones, process payments
2. CreatePaymentMilestonesUseCase - Create milestones when accept application
3. RequestMilestonePaymentUseCase - Guide request milestone payment
4. ApproveMilestonePaymentUseCase - Operator approve milestone
5. AutoReleaseMilestoneUseCase - Auto-release after timeout

### Phase 3: API Endpoints
1. POST /api/milestones - Create milestones (when accept application)
2. GET /api/milestones?tourId=xxx&guideId=xxx - Get milestones
3. POST /api/milestones/[id]/request - Request milestone payment
4. POST /api/milestones/[id]/approve - Approve milestone payment
5. POST /api/milestones/[id]/reject - Reject milestone payment
6. GET /api/milestones/[id] - Get milestone details

### Phase 4: Integration
1. Integrate with AcceptApplicationUseCase
2. Integrate with ChangeTourStatusUseCase (for milestone 2)
3. Integrate with SubmitTourReportUseCase (for milestone 3)
4. Integrate with EscrowService
5. Create cron job for auto-release

### Phase 5: UI Components
1. Milestone display component
2. Request milestone payment dialog
3. Approve/reject milestone dialog
4. Milestone timeline component

