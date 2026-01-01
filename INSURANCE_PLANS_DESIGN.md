# Insurance/Protection Plans Design Document

## Tổng quan

Hệ thống Insurance/Protection Plans cung cấp bảo hiểm cho tours và guides, giúp giảm financial risk và tăng confidence trong marketplace.

## Tính năng

### 1. Tour Cancellation Insurance
- Operator mua insurance cho tour
- Nếu tour cancel, guide vẫn nhận một phần payment
- Platform cover một phần loss

### 2. Guide Protection Insurance
- Guide mua monthly/yearly protection
- Cover cho các trường hợp:
  - Operator không trả tiền
  - Tour cancel last minute
  - Accidents during tour

### 3. Platform Insurance
- Platform tự cover một phần risk
- Tạo trust fund từ platform fees

## Database Schema

### InsurancePlan Model
```prisma
model InsurancePlan {
  id              String   @id @default(cuid())
  name            String
  type            InsuranceType // TOUR_CANCELLATION, GUIDE_PROTECTION, PLATFORM
  description     String   @db.Text
  coverageAmount  Float    // Maximum coverage amount
  premium         Float    // Premium cost
  duration        Int?     // Duration in days (for guide protection)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @default(now()) @updatedAt
  
  policies        InsurancePolicy[]
  
  @@map("insurance_plans")
}

enum InsuranceType {
  TOUR_CANCELLATION
  GUIDE_PROTECTION
  PLATFORM
}
```

### InsurancePolicy Model
```prisma
model InsurancePolicy {
  id              String         @id @default(cuid())
  planId          String
  plan            InsurancePlan  @relation(fields: [planId], references: [id])
  userId          String?        // User who purchased (operator or guide)
  user            User?          @relation(fields: [userId], references: [id])
  tourId          String?        // For tour cancellation insurance
  tour            Tour?           @relation(fields: [tourId], references: [id])
  status          PolicyStatus   @default(ACTIVE)
  startDate       DateTime
  endDate         DateTime?
  premiumPaid     Float
  coverageAmount  Float
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @default(now()) @updatedAt
  
  claims          InsuranceClaim[]
  
  @@map("insurance_policies")
}

enum PolicyStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  CLAIMED
}
```

### InsuranceClaim Model
```prisma
model InsuranceClaim {
  id              String           @id @default(cuid())
  policyId        String
  policy          InsurancePolicy  @relation(fields: [policyId], references: [id])
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  type            ClaimType
  description     String           @db.Text
  amount          Float
  evidence        String[]         // URLs to evidence files
  status          ClaimStatus      @default(PENDING)
  approvedAt      DateTime?
  approvedBy      String?          // Admin user ID
  rejectedAt      DateTime?
  rejectedReason  String?          @db.Text
  paidAt          DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @default(now()) @updatedAt
  
  @@map("insurance_claims")
}

enum ClaimType {
  TOUR_CANCELLATION
  NON_PAYMENT
  LAST_MINUTE_CANCELLATION
  ACCIDENT
  OTHER
}

enum ClaimStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}
```

## Implementation Plan

### Phase 1: Database & Models
1. Add InsurancePlan, InsurancePolicy, InsuranceClaim models
2. Add relations to User, Tour models
3. Create migration

### Phase 2: Services & Use Cases
1. InsuranceService - Create policies, process claims
2. CreateInsurancePolicyUseCase
3. CreateInsuranceClaimUseCase
4. ProcessInsuranceClaimUseCase

### Phase 3: API Endpoints
1. GET /api/insurance/plans - List available plans
2. POST /api/insurance/policies - Purchase policy
3. GET /api/insurance/policies - List user's policies
4. POST /api/insurance/claims - Create claim
5. GET /api/insurance/claims - List claims
6. POST /api/admin/insurance/claims/[id]/process - Process claim

### Phase 4: UI Components
1. Insurance plans listing page
2. Policy purchase dialog
3. Claims submission form
4. Admin claims management page

### Phase 5: Integration
1. Integrate with payment system
2. Integrate with escrow system
3. Auto-trigger claims for tour cancellations
4. Notification system

