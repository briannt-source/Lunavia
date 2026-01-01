# Enhanced Dispute Resolution System

## Tổng quan

Hệ thống giải quyết tranh chấp nâng cao cho LUNAVIA, cho phép operators và guides tạo và quản lý disputes với đầy đủ evidence, timeline, và resolution options.

## Tính năng chính

### 1. Dispute Creation
- Operator hoặc Guide có thể tạo dispute
- Liên kết với tour, application, hoặc payment
- Upload evidence (photos, documents, messages)
- Mô tả chi tiết vấn đề
- Chọn loại dispute (PAYMENT, ASSIGNMENT, NO_SHOW, QUALITY)

### 2. Evidence Management
- Upload multiple files (images, PDFs, documents)
- Link messages từ conversation
- Screenshots và proof
- Evidence được lưu trữ an toàn

### 3. Timeline & Status Tracking
- Timeline đầy đủ của dispute
- Status transitions (PENDING → IN_REVIEW → RESOLVED/REJECTED)
- Auto-escalation nếu không resolve trong X ngày
- Activity log với timestamps

### 4. Resolution Options
- **Full Refund:** Hoàn tiền toàn bộ về operator
- **Partial Refund:** Hoàn tiền một phần
- **Full Payment:** Thanh toán đầy đủ cho guide
- **Partial Payment:** Thanh toán một phần
- **No Action:** Không có hành động (dispute bị reject)

### 5. Escrow Integration
- Tự động hold escrow khi dispute được tạo
- Release/Refund escrow dựa trên resolution
- Không thể release escrow khi có active dispute

### 6. Admin/Moderator Workflow
- Review disputes với đầy đủ context
- View evidence và timeline
- Communicate với cả 2 bên
- Make resolution decision
- Track resolution time

### 7. Appeal System
- User có thể appeal resolution
- Appeal được review bởi higher-level admin
- Final decision binding

## Database Schema Enhancements

### Dispute Model (Enhanced)
```prisma
model Dispute {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  tourId          String?
  tour            Tour?         @relation(fields: [tourId], references: [id])
  applicationId   String?
  application     Application?  @relation(fields: [applicationId], references: [id])
  paymentId       String?
  payment         Payment?      @relation(fields: [paymentId], references: [id])
  escrowAccountId String?
  escrowAccount   EscrowAccount? @relation(fields: [escrowAccountId], references: [id])
  type            DisputeType
  description     String        @db.Text
  evidence        String[]      // URLs to evidence files
  status          DisputeStatus @default(PENDING)
  resolution      DisputeResolution?
  timeline        DisputeTimeline[]
  escalatedAt     DateTime?
  escalatedBy     String?
  resolvedAt      DateTime?
  resolvedBy      String?
  resolutionNotes String?       @db.Text
  appealId        String?       @unique
  appeal          Dispute?      @relation("DisputeAppeals", fields: [appealId], references: [id])
  appeals         Dispute[]     @relation("DisputeAppeals")
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @default(now()) @updatedAt

  @@map("disputes")
}

enum DisputeResolution {
  FULL_REFUND
  PARTIAL_REFUND
  FULL_PAYMENT
  PARTIAL_PAYMENT
  NO_ACTION
}

model DisputeTimeline {
  id        String   @id @default(cuid())
  disputeId String
  dispute   Dispute  @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  action    String   // "CREATED", "EVIDENCE_ADDED", "ESCALATED", "RESOLVED", etc.
  actorId   String?  // User ID who performed action
  actor     User?    @relation(fields: [actorId], references: [id])
  details   String?  @db.Text
  metadata  Json?    // Additional data (amount, reason, etc.)
  createdAt DateTime @default(now())

  @@map("dispute_timelines")
}
```

## Implementation Plan

### Phase 1: Schema & Domain Layer
1. Enhance Dispute model với new fields
2. Add DisputeTimeline model
3. Add DisputeResolution enum
4. Create DisputeService domain service

### Phase 2: Application Layer
1. CreateDisputeUseCase
2. AddEvidenceUseCase
3. EscalateDisputeUseCase
4. ResolveDisputeUseCase
5. AppealDisputeUseCase

### Phase 3: API Layer
1. POST /api/disputes - Create dispute
2. GET /api/disputes - List disputes
3. GET /api/disputes/[id] - Get dispute details
4. POST /api/disputes/[id]/evidence - Add evidence
5. POST /api/disputes/[id]/escalate - Escalate dispute
6. POST /api/disputes/[id]/resolve - Resolve dispute (admin)
7. POST /api/disputes/[id]/appeal - Appeal resolution

### Phase 4: UI Components
1. CreateDisputeDialog
2. DisputeDetailPage
3. DisputeTimeline
4. EvidenceUpload
5. DisputeResolutionDialog (admin)
6. DisputeList

### Phase 5: Integration
1. Integrate với EscrowService (hold/release)
2. Integrate với NotificationService
3. Auto-escalation cron job
4. Update user documentation

