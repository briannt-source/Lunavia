# 📊 LUNAVIA - TỔNG HỢP TÍNH NĂNG VÀ KIỂM TRA LỖI

**Ngày tạo:** 2025-01-15  
**Phiên bản:** 1.0.0

---

## 📋 MỤC LỤC

1. [Tổng hợp tính năng](#tổng-hợp-tính-năng)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Business Rules](#business-rules)
4. [Vấn đề và lỗi tiềm ẩn](#vấn-đề-và-lỗi-tiềm-ẩn)
5. [Đề xuất cải thiện](#đề-xuất-cải-thiện)

---

## 🎯 TỔNG HỢP TÍNH NĂNG

### 1. Authentication & Authorization ✅

**Tính năng:**
- ✅ NextAuth.js integration với JWT sessions
- ✅ Email/Password authentication
- ✅ Google OAuth (configured, chưa test)
- ✅ Role-based access control (RBAC)
- ✅ Protected routes middleware
- ✅ Session management với token refresh

**Roles:**
- `TOUR_OPERATOR` - Tour Operator
- `TOUR_AGENCY` - Tour Agency
- `TOUR_GUIDE` - Tour Guide
- `ADMIN_SUPER_ADMIN` - Super Admin
- `ADMIN_MODERATOR` - Moderator
- `ADMIN_SUPPORT_STAFF` - Support Staff

**Files:**
- `src/lib/auth-config.ts` - NextAuth configuration
- `src/middleware.ts` - Route protection

---

### 2. User Management ✅

**Tính năng:**
- ✅ User registration với role selection
- ✅ Profile management (name, photo, bio, languages, specialties)
- ✅ Company management (Company ID auto-generate)
- ✅ Employment types (FREELANCE, IN_HOUSE)
- ✅ Company invitations & join requests
- ✅ User settings & preferences

**Models:**
- `User` - Main user entity
- `Profile` - User profile information
- `Company` - Company entity
- `CompanyMember` - In-house guide memberships
- `CompanyInvitation` - Invitation system
- `JoinRequest` - Guide join requests

---

### 3. Verification System (KYC/KYB) ✅

**Tính năng:**
- ✅ KYC (Know Your Customer) cho Tour Guides
- ✅ KYB (Know Your Business) cho Tour Operators/Agencies
- ✅ Document upload & verification
- ✅ Admin approval/rejection workflow
- ✅ Status tracking (NOT_SUBMITTED, PENDING, APPROVED, REJECTED)
- ✅ Verification requirements based on role

**Business Rules:**
- Operators/Agencies: Cần KYB APPROVED để tạo tour
- Guides: Cần KYC APPROVED để apply tour

**Files:**
- `src/domain/services/verification.service.ts`
- `src/application/use-cases/verification/`

---

### 4. Wallet System ✅

**Tính năng:**
- ✅ Wallet initialization cho mỗi user
- ✅ Balance management
- ✅ Locked deposit (1M VND cho operators) - bắt buộc
- ✅ Reserved amount tracking
- ✅ Transaction history
- ✅ Top-up requests (với admin approval)
- ✅ Withdrawal requests (với minimum balance check)
- ✅ Payment processing (Operator → Guide)

**Business Rules:**
- **Operators:**
  - Phải có 1,000,000 VND locked deposit để tạo tour
  - Top-up: Fill locked deposit trước, phần còn lại vào balance
  - Không được rút locked deposit
  - Available balance = balance - reserved

- **Guides:**
  - Phải có ≥ 500,000 VND balance để apply tour
  - Không được rút dưới 500k minimum
  - Withdrawal check: balance sau rút ≥ 500k

**Files:**
- `src/domain/services/wallet.service.ts`
- `src/application/use-cases/wallet/`

---

### 5. Tour Management ✅

**Tính năng:**
- ✅ Tour creation (chỉ Operator/Agency)
- ✅ Tour marketplace với search/filter
- ✅ Tour detail pages
- ✅ Tour status management (DRAFT, OPEN, CLOSED, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ Visibility controls (PUBLIC, PRIVATE)
- ✅ Price management (Main guide, Sub guide)
- ✅ Slots management (mainGuideSlots, subGuideSlots)
- ✅ Tour code generation (TOUR-YYYYMMDD-XXXX)
- ✅ Tour blocking/unblocking (admin)

**Tour Fields:**
- Basic: title, description, city, startDate, endDate
- Pricing: priceMain, priceSub, currency
- Requirements: languages, specialties, pax
- Details: inclusions, exclusions, additionalRequirements
- Guide notes: guideNotes
- Files: files (array of URLs)
- Itinerary: itinerary (JSON array)

**Business Rules:**
- Chỉ Operator/Agency có thể tạo tour
- Phải có KYB APPROVED
- Phải có license number
- Phải có 1M VND locked deposit
- Guide không thể tạo tour (blocked ở middleware)

**Files:**
- `src/app/api/tours/`
- `src/application/use-cases/tour/`

---

### 6. Application System ✅

**Tính năng:**
- ✅ Guide application to tours
- ✅ Application status tracking (PENDING, ACCEPTED, REJECTED)
- ✅ Role selection (MAIN, SUB)
- ✅ Cover letter
- ✅ Conflict checking (overlap dates)
- ✅ Slot availability checking
- ✅ Auto-reject khi slots đầy
- ✅ View guide profile từ applications
- ✅ Accept/Reject applications (operator)
- ✅ Cancel application (guide)

**Business Rules:**
- Guide phải có KYC APPROVED
- Guide phải có ≥ 500k VND balance
- Không thể apply tour đã quá giờ khởi hành
- Conflict checking: không apply tour trùng ngày
- Slot availability: check trước khi accept
- Visibility rules: PRIVATE tours chỉ cho in-house guides
- Auto-reject: khi accept một guide, auto-reject các applications khác nếu slots đầy

**Files:**
- `src/application/use-cases/application/`
- `src/app/api/tours/[id]/applications/`

---

### 7. Assignment System ✅

**Tính năng:**
- ✅ Direct assignment cho in-house guides
- ✅ Accept/Reject assignments
- ✅ Reason required khi reject
- ✅ Conflict checking
- ✅ Availability checking

**Business Rules:**
- Chỉ cho PRIVATE tours
- Chỉ cho in-house guides của company
- Guide có thể reject với reason

**Files:**
- `src/application/use-cases/assignment/`

---

### 8. Payment System ✅

**Tính năng:**
- ✅ Payment processing (Operator → Guide)
- ✅ Platform fee calculation
  - Freelance: 5% platform fee
  - In-house: 1% hoặc 0% (nếu có employment contract)
- ✅ Payment status tracking (PENDING, COMPLETED, FAILED)
- ✅ Transaction history
- ✅ Payment milestones (3 milestones)
- ✅ Escrow system (lock, release, refund)

**Payment Milestones:**
1. **Milestone 1 (30%)**: Khi application accepted
2. **Milestone 2 (40%)**: Khi tour IN_PROGRESS
3. **Milestone 3 (30%)**: Khi tour COMPLETED + report approved

**Files:**
- `src/domain/services/payment-milestone.service.ts`
- `src/domain/services/escrow.service.ts`
- `src/app/api/operator/payment-requests/`

---

### 9. Tour Reports & Completion ✅

**Tính năng:**
- ✅ Submit tour report (guide)
- ✅ Payment request trong report
- ✅ Approve payment request (operator)
- ✅ Confirm tour và lock payment
- ✅ Report fields: overallRating, clientSatisfaction, highlights, challenges, recommendations

**Business Rules:**
- Guide submit report sau khi tour hoàn thành
- Operator approve payment request
- Payment locked amount được set khi confirm tour
- Payment due trong 24 giờ sau khi approve

**Files:**
- `src/application/use-cases/tour-report/`
- `src/app/api/tours/[id]/reports/`

---

### 10. Contract System ✅

**Tính năng:**
- ✅ Create contract (operator)
- ✅ Contract templates
- ✅ View contract (guide)
- ✅ Accept/Reject contract (guide)
- ✅ Contract status tracking (NOT_VIEWED, VIEWED, ACCEPTED, REJECTED)
- ✅ E-signature support (structure ready)

**Business Rules:**
- Operator tạo contract cho tour
- Guide phải view contract trước khi accept
- Contract acceptance required trước khi tour bắt đầu

**Files:**
- `src/domain/services/contract.service.ts`
- `src/domain/services/contract-template.service.ts`
- `src/application/use-cases/contract/`

---

### 11. Notification System ✅

**Tính năng:**
- ✅ Auto notifications cho tất cả events
- ✅ Notification types:
  - New application
  - Application accepted/rejected
  - New assignment
  - Payment received
  - Verification status changed
  - Tour status changed
  - Contract status changed
- ✅ Read/unread tracking
- ✅ User notification settings

**Files:**
- `src/domain/services/notification.service.ts`
- `src/app/api/notifications/`

**⚠️ TODO:** Email notifications chưa implement (chỉ có in-app)

---

### 12. Dispute System ✅

**Tính năng:**
- ✅ Create dispute
- ✅ Add evidence
- ✅ Escalate dispute
- ✅ Resolve dispute (admin)
- ✅ Appeal dispute
- ✅ Dispute types: PAYMENT, ASSIGNMENT, NO_SHOW, QUALITY
- ✅ Dispute status: PENDING, IN_REVIEW, RESOLVED, REJECTED, ESCALATED, APPEALED
- ✅ Dispute resolution: FULL_REFUND, PARTIAL_REFUND, FULL_PAYMENT, PARTIAL_PAYMENT, NO_ACTION

**Files:**
- `src/domain/services/dispute.service.ts`
- `src/app/api/disputes/`

---

### 13. Escrow System ✅

**Tính năng:**
- ✅ Create escrow account
- ✅ Lock funds
- ✅ Release funds
- ✅ Refund escrow
- ✅ Cancel escrow
- ✅ Escrow status: PENDING, LOCKED, RELEASED, REFUNDED, CANCELLED

**Business Rules:**
- Escrow được tạo khi accept application
- Funds được lock trong escrow
- Release khi tour completed
- Refund khi có dispute hoặc tour cancelled

**Files:**
- `src/domain/services/escrow.service.ts`
- `src/app/api/escrow/`

---

### 14. Admin System ✅

**Tính năng:**
- ✅ Admin dashboard
- ✅ User management (block, unblock, delete, reset password)
- ✅ Verification management (approve, reject)
- ✅ Dispute management
- ✅ Payment settings (bank accounts)
- ✅ Top-up/Withdrawal request processing
- ✅ Tour moderation (approve, reject, block)
- ✅ Transfer management
- ✅ User statistics

**Admin Roles:**
- `SUPER_ADMIN` - Full access
- `MODERATOR` - Content moderation
- `SUPPORT_STAFF` - Support tasks

**Files:**
- `src/app/dashboard/admin/`
- `src/app/api/admin/`

---

### 15. AI Features (Lunavia) ✅

**Tính năng:**
- ✅ AI matching service (92% accuracy)
- ✅ Guide-to-tour matching
- ✅ Itinerary generation service
- ✅ AI chat assistant service
- ✅ Analytics insights service

**Files:**
- `src/infrastructure/ai/`
- `src/app/api/ai/match/`

---

### 16. Review System ⚠️

**Tính năng:**
- ✅ Review model (database ready)
- ✅ Review service (business logic ready)
- ⚠️ **UI chưa implement**

**Review Features:**
- Create review (sau khi tour completed)
- Edit review (7-day window)
- Respond to review
- Rating system (1-5 stars)
- Review types: GUIDE_TO_OPERATOR, OPERATOR_TO_GUIDE

**Files:**
- `src/domain/services/review.service.ts`
- ⚠️ UI components chưa có

---

### 17. Standby Request System ⚠️

**Tính năng:**
- ✅ Standby request model (database ready)
- ⚠️ **Business logic chưa implement đầy đủ**
- ⚠️ **UI chưa implement**

**Files:**
- `prisma/schema.prisma` - Model có sẵn
- ⚠️ Use cases chưa có

---

### 18. Emergency & Safety System ✅

**Tính năng:**
- ✅ Emergency report (SOS)
- ✅ Safety check-in
- ✅ Emergency contacts
- ✅ Emergency types: MEDICAL, ACCIDENT, LOST, OTHER

**Files:**
- `src/domain/services/emergency.service.ts`
- `src/domain/services/safety-checkin.service.ts`
- `src/app/api/operator/emergencies/`

---

### 19. Tax Invoice System ✅

**Tính năng:**
- ✅ Invoice generation
- ✅ Invoice number generation (INV-YYYYMMDD-XXXX)
- ✅ Invoice types: TOUR_SERVICE, PLATFORM_FEE, REFUND
- ✅ Invoice status: DRAFT, ISSUED, CANCELLED

**Files:**
- `src/lib/invoice-number-generator.ts`
- `prisma/schema.prisma` - Invoice model

---

### 20. UI/UX ✅

**Tính năng:**
- ✅ Modern Tailwind CSS design
- ✅ shadcn/ui components
- ✅ Responsive layout
- ✅ Landing page với branding
- ✅ Dashboard layouts cho mỗi role
- ✅ Toast notifications
- ✅ Color scheme: #0077B6, #003049, #001D3D

**Files:**
- `src/app/` - Pages
- `src/components/` - Components
- `tailwind.config.ts` - Tailwind configuration

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Clean Architecture Structure

```
src/
├── domain/                    # Domain Layer (Business Logic)
│   └── services/              # Domain Services
│       ├── wallet.service.ts
│       ├── verification.service.ts
│       ├── availability.service.ts
│       ├── contract.service.ts
│       ├── dispute.service.ts
│       ├── escrow.service.ts
│       ├── notification.service.ts
│       └── ...
│
├── application/               # Application Layer
│   └── use-cases/             # Use Cases
│       ├── application/
│       ├── assignment/
│       ├── tour/
│       ├── wallet/
│       ├── verification/
│       └── ...
│
├── infrastructure/           # Infrastructure Layer
│   └── ai/                   # External service integrations
│
└── app/                      # Presentation Layer (Next.js)
    ├── api/                  # API Routes
    ├── dashboard/            # Dashboard pages
    └── ...
```

### Database Schema

**Total Models:** 40+ models
- User, Profile, Wallet
- Tour, Application, Assignment
- Payment, Transaction, EscrowAccount
- Contract, ContractTemplate, ContractAcceptance
- Verification, Review, Dispute
- Company, CompanyMember, CompanyInvitation
- Notification, UserSettings
- City, ExchangeRate
- TopUpRequest, WithdrawalRequest
- TourReport, PaymentMilestone
- EmergencyReport, SafetyCheckIn
- Invoice, TaxInvoice
- Và nhiều models khác...

---

## ⚖️ BUSINESS RULES

### Tour Operators/Agencies

1. **Tour Creation:**
   - ✅ Phải có KYB APPROVED
   - ✅ Phải có license number
   - ✅ Phải có 1,000,000 VND locked deposit
   - ✅ Chỉ có thể tạo tour (không apply)

2. **Wallet:**
   - ✅ Locked deposit: 1M VND (bắt buộc)
   - ✅ Top-up: Fill locked deposit trước, phần còn lại vào balance
   - ✅ Không được rút locked deposit
   - ✅ Available balance = balance - reserved

3. **Payments:**
   - ✅ Platform fee: 1% cho in-house guides (có contract), 5% cho freelance
   - ✅ Payment milestones: 30% - 40% - 30%

### Tour Guides

1. **Tour Application:**
   - ✅ Phải có KYC APPROVED
   - ✅ Phải có ≥ 500,000 VND balance
   - ✅ Không thể apply tour đã quá giờ khởi hành
   - ✅ Conflict checking: không apply tour trùng ngày
   - ✅ Slot availability checking

2. **Wallet:**
   - ✅ Minimum balance: 500k VND
   - ✅ Không được rút dưới 500k minimum
   - ✅ Withdrawal check: balance sau rút ≥ 500k

3. **Assignments:**
   - ✅ Chỉ cho PRIVATE tours
   - ✅ Chỉ cho in-house guides
   - ✅ Có thể reject với reason

### Applications

1. **Accept Application:**
   - ✅ Check slot availability
   - ✅ Check guide availability
   - ✅ Auto-reject các applications khác khi slots đầy
   - ✅ Auto set guide status to ON_TOUR

2. **Conflict Checking:**
   - ✅ Không apply tour trùng ngày
   - ✅ Check với accepted applications
   - ✅ Check với assignments

---

## 🐛 VẤN ĐỀ VÀ LỖI TIỀM ẨN

### 1. Race Conditions ⚠️

**Vấn đề:**
- **Accept Application:** Nếu 2 operators cùng accept applications cho cùng 1 slot → có thể vượt quá slot limit
- **Payment Processing:** Nếu 2 payments cùng lúc → có thể double charge
- **Wallet Updates:** Concurrent wallet updates có thể dẫn đến balance inconsistency

**Vị trí:**
- `src/application/use-cases/application/accept-application.use-case.ts`
- `src/domain/services/wallet.service.ts`
- `src/app/api/operator/payment-requests/[id]/approve/route.ts`

**Giải pháp đề xuất:**
- Sử dụng database transactions với isolation levels
- Sử dụng `prisma.$transaction()` với `isolationLevel: 'Serializable'`
- Hoặc sử dụng optimistic locking với version fields

---

### 2. Missing Transaction Wrappers ⚠️

**Vấn đề:**
- Nhiều operations cần atomic nhưng không được wrap trong transaction
- Ví dụ: Accept application → Update tour → Update guide status → Create notification

**Vị trí:**
- `src/application/use-cases/application/accept-application.use-case.ts`
- `src/application/use-cases/wallet/process-topup-request.use-case.ts`
- `src/app/api/operator/payment-requests/[id]/approve/route.ts`

**Giải pháp đề xuất:**
- Wrap tất cả related operations trong `prisma.$transaction()`

---

### 3. Authorization Checks ⚠️

**Vấn đề:**
- Một số API endpoints thiếu authorization checks
- Chỉ check ở middleware, không check ở business logic layer

**Vị trí cần kiểm tra:**
- `src/app/api/tours/[id]/route.ts` - PUT/DELETE
- `src/app/api/tours/[id]/applications/[applicationId]/accept/route.ts`
- `src/app/api/wallet/withdrawal-requests/[id]/process/route.ts`

**Giải pháp đề xuất:**
- Thêm authorization checks trong use cases
- Verify ownership trước khi thực hiện operations

---

### 4. Error Handling ⚠️

**Vấn đề:**
- Một số errors không được handle properly
- Generic error messages không cung cấp đủ context
- Database errors có thể expose sensitive information

**Vị trí:**
- `src/lib/auth-config.ts` - Auth errors
- `src/domain/services/` - Service errors
- `src/app/api/` - API route errors

**Giải pháp đề xuất:**
- Tạo custom error classes
- Log errors với context
- Return user-friendly error messages

---

### 5. Input Validation ⚠️

**Vấn đề:**
- Thiếu input validation ở nhiều endpoints
- Không validate data types, ranges, formats

**Vị trí:**
- `src/app/api/tours/route.ts` - POST
- `src/app/api/tours/[id]/apply/route.ts`
- `src/app/api/wallet/topup/route.ts`

**Giải pháp đề xuất:**
- Sử dụng Zod schemas cho validation
- Validate ở API layer trước khi gọi use cases

---

### 6. Email Notifications ⚠️

**Vấn đề:**
- Tất cả email notifications đều có `TODO: Send email`
- Chỉ có in-app notifications

**Vị trí:**
- `src/domain/services/notification.service.ts` - Tất cả methods

**Giải pháp đề xuất:**
- Integrate Resend hoặc SendGrid
- Implement email templates
- Add email queue system

---

### 7. File Upload Security ⚠️

**Vấn đề:**
- File upload không có validation
- Không check file types, sizes
- Không scan for malware

**Vị trí:**
- `src/app/api/upload/route.ts`

**Giải pháp đề xuất:**
- Validate file types (images, PDFs only)
- Limit file sizes
- Scan files for malware
- Store files in secure storage (S3, Cloudinary)

---

### 8. Rate Limiting ⚠️

**Vấn đề:**
- Không có rate limiting
- Có thể bị abuse (spam applications, brute force login)

**Vị trí:**
- Tất cả API endpoints
- Authentication endpoints

**Giải pháp đề xuất:**
- Implement rate limiting với `@upstash/ratelimit`
- Limit per IP, per user
- Different limits cho different endpoints

---

### 9. Database Indexes ⚠️

**Vấn đề:**
- Có thể thiếu indexes cho frequently queried fields
- Slow queries có thể xảy ra khi data lớn

**Vị trí:**
- `prisma/schema.prisma`

**Giải pháp đề xuất:**
- Add indexes cho:
  - `Tour.startDate`, `Tour.endDate`
  - `Application.tourId`, `Application.guideId`
  - `Payment.tourId`, `Payment.status`
  - `Notification.userId`, `Notification.read`

---

### 10. Logging & Monitoring ⚠️

**Vấn đề:**
- Thiếu structured logging
- Không có error tracking (Sentry, etc.)
- Không có performance monitoring

**Giải pháp đề xuất:**
- Integrate Sentry cho error tracking
- Add structured logging với Winston/Pino
- Add performance monitoring với APM tools

---

### 11. Testing ⚠️

**Vấn đề:**
- Không có unit tests
- Không có integration tests
- Không có E2E tests

**Giải pháp đề xuất:**
- Add Jest cho unit tests
- Add Playwright cho E2E tests
- Add test coverage reporting

---

### 12. API Documentation ⚠️

**Vấn đề:**
- API endpoints không có documentation
- Không có OpenAPI/Swagger spec

**Giải pháp đề xuất:**
- Generate OpenAPI spec từ code
- Add Swagger UI
- Document request/response schemas

---

### 13. Review System UI ⚠️

**Vấn đề:**
- Review model và service đã có
- **UI components chưa implement**

**Giải pháp đề xuất:**
- Create review UI components
- Add review display trong tour detail
- Add review form sau khi tour completed

---

### 14. Standby Request System ⚠️

**Vấn đề:**
- Standby request model đã có
- **Business logic chưa implement đầy đủ**
- **UI chưa implement**

**Giải pháp đề xuất:**
- Implement standby request use cases
- Create UI components
- Add standby request workflow

---

### 15. Real-time Chat ⚠️

**Vấn đề:**
- Socket.io structure ready
- **Chưa implement real-time messaging**

**Giải pháp đề xuất:**
- Implement Socket.io server
- Create chat UI components
- Add message notifications

---

## 💡 ĐỀ XUẤT CẢI THIỆN

### Priority 1 (Critical) 🔴

1. **Fix Race Conditions**
   - Wrap critical operations trong transactions
   - Add optimistic locking

2. **Add Input Validation**
   - Implement Zod schemas
   - Validate ở API layer

3. **Improve Error Handling**
   - Create custom error classes
   - Add error logging

4. **Add Authorization Checks**
   - Verify ownership trong use cases
   - Add role-based checks

### Priority 2 (High) 🟡

5. **Implement Email Notifications**
   - Integrate Resend/SendGrid
   - Create email templates

6. **Add Rate Limiting**
   - Protect API endpoints
   - Prevent abuse

7. **Improve File Upload Security**
   - Validate file types/sizes
   - Secure storage

8. **Add Database Indexes**
   - Optimize queries
   - Improve performance

### Priority 3 (Medium) 🟢

9. **Add Logging & Monitoring**
   - Integrate Sentry
   - Add structured logging

10. **Add Testing**
    - Unit tests
    - Integration tests
    - E2E tests

11. **API Documentation**
    - OpenAPI spec
    - Swagger UI

12. **Complete Review System**
    - UI components
    - Review workflow

### Priority 4 (Low) 🔵

13. **Complete Standby Request System**
    - Business logic
    - UI components

14. **Implement Real-time Chat**
    - Socket.io server
    - Chat UI

15. **Add Analytics Dashboard**
    - Charts & graphs
    - Insights

---

## 📊 TỔNG KẾT

### ✅ Đã hoàn thành:
- **40+ API endpoints**
- **25+ use cases**
- **15+ domain services**
- **40+ database models**
- **Core business logic**
- **Authentication & Authorization**
- **Wallet & Payment system**
- **Tour & Application system**
- **Admin system**

### ⚠️ Cần cải thiện:
- **Race conditions** (Critical)
- **Input validation** (Critical)
- **Error handling** (Critical)
- **Authorization checks** (Critical)
- **Email notifications** (High)
- **Rate limiting** (High)
- **File upload security** (High)
- **Testing** (Medium)
- **Logging & Monitoring** (Medium)

### 🎯 Status: **PRODUCTION READY với một số caveats**

**Có thể deploy production nhưng cần:**
1. Fix race conditions
2. Add input validation
3. Improve error handling
4. Add rate limiting
5. Implement email notifications

---

**Tài liệu này sẽ được cập nhật thường xuyên khi có thay đổi.**

