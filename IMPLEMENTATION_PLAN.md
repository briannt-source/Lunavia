# Implementation Plan - Lunavia Full Spec

## ✅ Đã hoàn thành (Schema Updates)

### 1. Database Schema - New Entities Added

#### Company & Employment Module
- ✅ `Company` - Company entity với Company ID tự động
- ✅ `CompanyMember` - In-house guides của company
- ✅ `CompanyInvitation` - Invitation system với invite link
- ✅ `JoinRequest` - Guide request to join company

#### Tour Enhancements
- ✅ `Tour` - Bổ sung fields:
  - `mainGuideSlots` - Số lượng main guide slots
  - `subGuideSlots` - Số lượng sub guide slots
  - `inclusions` - Các hạng mục đã bao gồm
  - `exclusions` - Các hạng mục không bao gồm
  - `additionalRequirements` - Yêu cầu bổ sung

#### Assignment Module
- ✅ `Assignment` - Direct assignment cho in-house guides (khác với Application)

#### Tour Report Module
- ✅ `TourReport` - Tour completion reports với payment request

#### Contract Module
- ✅ `Contract` - Contract templates cho tours
- ✅ `ContractAcceptance` - Guide accept/reject contracts

#### Wallet Requests
- ✅ `TopUpRequest` - Nạp tiền requests
- ✅ `WithdrawalRequest` - Rút tiền requests với method (Bank, MoMo, Zalo)

#### Notification Module
- ✅ `Notification` - System notifications

#### Location Module
- ✅ `City` - City và Region management

#### Exchange Rate
- ✅ `ExchangeRate` - VND/USD exchange rate management

#### Profile Enhancements
- ✅ `Profile.availabilityStatus` - AVAILABLE, BUSY, ON_TOUR
- ✅ `Profile.companyEmail` - Company email cho in-house guides

### 2. New Enums
- ✅ `AvailabilityStatus` - Guide availability
- ✅ `RequestStatus` - PENDING, APPROVED, REJECTED, COMPLETED
- ✅ `ContractStatus` - NOT_VIEWED, VIEWED, ACCEPTED, REJECTED
- ✅ `WithdrawalMethod` - BANK, MOMO, ZALO, OTHER

---

## 🚧 Cần triển khai (Theo Clean Architecture)

### Phase 1: Core Foundation (Ưu tiên cao)

#### 1.1 Company & Employment Module
**Domain Layer:**
- [ ] `Company` entity với logic generate Company ID
- [ ] `CompanyMember` value objects
- [ ] Domain services: `CompanyService.generateCompanyId()`

**Application Layer:**
- [ ] `CreateCompanyUseCase` - Tự động tạo company khi operator đăng ký
- [ ] `RequestJoinCompanyUseCase` - Guide request join
- [ ] `InviteGuideToCompanyUseCase` - Operator invite guide
- [ ] `AcceptJoinRequestUseCase` - Operator accept/reject
- [ ] `AcceptInvitationUseCase` - Guide accept invitation

**Infrastructure Layer:**
- [ ] `CompanyRepository` implementation
- [ ] `CompanyMemberRepository` implementation

**Presentation Layer:**
- [ ] API routes: `/api/companies/*`
- [ ] Pages: Company list, Invitations management

#### 1.2 Verification Module Enhancement
**Cần bổ sung:**
- [ ] Tách KYC (Guide) và KYB (Operator) logic
- [ ] Document upload với validation
- [ ] Admin approval workflow

**Application Layer:**
- [ ] `SubmitKycUseCase`
- [ ] `SubmitKybUseCase`
- [ ] `ApproveVerificationUseCase`
- [ ] `RejectVerificationUseCase`

**Presentation Layer:**
- [ ] KYC/KYB submission forms
- [ ] Admin verification dashboard

#### 1.3 City & Region Module
**Domain Layer:**
- [ ] `City` entity
- [ ] `Region` value object
- [ ] Region mapping logic

**Application Layer:**
- [ ] `ListCitiesUseCase`
- [ ] `FilterToursByCityUseCase`
- [ ] Region conflict detection (guide không apply 2 tour cùng time khác region)

**Infrastructure Layer:**
- [ ] Seed cities data (Hà Nội, HCM, Đà Nẵng, Hội An, Đà Lạt, Nha Trang)

---

### Phase 2: Tours & Matching

#### 2.1 Tour Module Enhancement
**Domain Layer:**
- [ ] `Tour` entity với rich description support
- [ ] `TourItineraryDay` value object
- [ ] Visibility rules (PUBLIC vs PRIVATE)

**Application Layer:**
- [ ] `CreateTourUseCase` - Enhanced với itinerary, inclusions/exclusions
- [ ] `UpdateTourUseCase`
- [ ] `ChangeTourStatusUseCase` - draft → open → in_progress → completed
- [ ] `ListToursUseCase` - Filter theo visibility, employment type

**Infrastructure Layer:**
- [ ] Rich text editor integration (Tiptap hoặc similar)
- [ ] Image upload trong description
- [ ] File attachment support

**Presentation Layer:**
- [ ] Enhanced tour creation form
- [ ] Itinerary day-by-day editor
- [ ] Inclusions/Exclusions editor

#### 2.2 Applications & Assignments Module
**Domain Layer:**
- [ ] `Application` entity
- [ ] `Assignment` entity
- [ ] Business rules:
  - Guide không apply tour overlap time
  - Guide không apply tour khác region cùng ngày
  - KYC check trước khi apply

**Application Layer:**
- [ ] `ApplyToTourUseCase` - Với conflict checking
- [ ] `AcceptTourApplicationUseCase`
- [ ] `RejectTourApplicationUseCase`
- [ ] `AssignGuideToTourUseCase` - Direct assign cho in-house
- [ ] `GuideAcceptAssignmentUseCase`
- [ ] `GuideRejectAssignmentUseCase` - Với required reason nếu gần ngày

**Presentation Layer:**
- [ ] Applications management page
- [ ] View candidates từ Tour Detail
- [ ] Assignment interface cho operators

#### 2.3 Contract Module
**Application Layer:**
- [ ] `CreateContractUseCase`
- [ ] `ViewContractUseCase`
- [ ] `AcceptContractUseCase`

**Presentation Layer:**
- [ ] Contract template editor
- [ ] Contract viewing & acceptance UI

---

### Phase 3: Wallet & Payments

#### 3.1 Wallet Module Enhancement
**Domain Layer:**
- [ ] `Wallet` entity với locked deposit rules
- [ ] `TopUpRequest` entity
- [ ] `WithdrawalRequest` entity
- [ ] Business rules:
  - Operator: locked deposit 1,000,000 VND
  - Guide: minimum balance 500,000 VND
  - Top-up fill locked deposit trước

**Application Layer:**
- [ ] `TopUpOperatorWalletUseCase` - Với locked deposit logic
- [ ] `TopUpGuideWalletUseCase`
- [ ] `CreateWithdrawalRequestUseCase`
- [ ] `ProcessWithdrawalUseCase` - Admin process
- [ ] `PayGuideForTourUseCase` - Operator → Guide payment

**Infrastructure Layer:**
- [ ] Payment gateway integration (nếu cần)

**Presentation Layer:**
- [ ] Wallet dashboard (operator & guide)
- [ ] Top-up request form
- [ ] Withdrawal request form
- [ ] Admin wallet management

#### 3.2 Exchange Rate Management
**Application Layer:**
- [ ] `UpdateExchangeRateUseCase` - Admin update VND/USD rate
- [ ] `GetCurrentExchangeRateUseCase`

**Presentation Layer:**
- [ ] Admin exchange rate management page
- [ ] Auto-convert currency trong tour pricing

---

### Phase 4: Tour Reports & Completion

#### 4.1 Tour Report Module
**Application Layer:**
- [ ] `SubmitTourReportUseCase` - Guide submit report
- [ ] `ReviewTourReportUseCase` - Operator review
- [ ] `ApprovePaymentRequestUseCase` - Operator approve payment
- [ ] `MarkTourCompleteUseCase`

**Presentation Layer:**
- [ ] Tour report submission form
- [ ] Report review interface
- [ ] Payment request approval

---

### Phase 5: Notifications & Admin

#### 5.1 Notification Module
**Domain Layer:**
- [ ] `Notification` entity
- [ ] Notification types enum

**Application Layer:**
- [ ] `SendNotificationUseCase`
- [ ] `MarkNotificationReadUseCase`
- [ ] `ScheduleReminderUseCase` - Scheduled reminders

**Infrastructure Layer:**
- [ ] Email notification service
- [ ] In-app notification service
- [ ] Scheduled job system (cron hoặc similar)

**Presentation Layer:**
- [ ] Notification center
- [ ] Notification badges
- [ ] Email templates

#### 5.2 Admin Panel Enhancements
**Application Layer:**
- [ ] `ManageUsersUseCase`
- [ ] `ManageCompaniesUseCase`
- [ ] `EditEmploymentTypeUseCase` - Admin chỉnh employment type
- [ ] `EditCompanyLinkUseCase` - Admin chỉnh company link

**Presentation Layer:**
- [ ] Admin dashboard với stats
- [ ] User management
- [ ] Company management
- [ ] Employment type editor

---

### Phase 6: Specialties & Skills

#### 6.1 Specialties Module
**Domain Layer:**
- [ ] `Specialty` entity
- [ ] `GuideSpecialty` relation

**Application Layer:**
- [ ] `ListSpecialtiesUseCase`
- [ ] `UpdateGuideSpecialtiesUseCase`
- [ ] `MatchToursBySpecialtyUseCase` - Matching logic

**Infrastructure Layer:**
- [ ] Seed specialties data

**Presentation Layer:**
- [ ] Specialties selector trong profile
- [ ] Specialties filter trong tour search

---

### Phase 7: Badges & Profile Enhancements

#### 7.1 Badge System
**Domain Layer:**
- [ ] Badge calculation logic:
  - KYC Verified
  - KYB Verified
  - Freelance Guide / In-House Guide
  - City specialization

**Application Layer:**
- [ ] `CalculateBadgesUseCase`
- [ ] `GetUserBadgesUseCase`

**Presentation Layer:**
- [ ] Badge display components
- [ ] Badge trong profile, applications list

---

## 📋 Migration Steps

1. **Tạo migration cho schema mới:**
   ```bash
   npm run db:migrate
   ```

2. **Seed initial data:**
   - Cities (Hà Nội, HCM, Đà Nẵng, Hội An, Đà Lạt, Nha Trang)
   - Specialties
   - Exchange rate (1 USD = 26,000 VND)

3. **Update existing data:**
   - Migrate existing operators → create Company
   - Generate Company IDs
   - Update profiles với availability status

---

## 🏗️ Clean Architecture Structure

```
src/
├── domain/
│   ├── entities/          # Core business entities
│   ├── value-objects/     # Value objects
│   ├── services/          # Domain services
│   └── repositories/      # Repository interfaces
├── application/
│   ├── use-cases/         # Use cases / Interactors
│   └── dto/               # Data Transfer Objects
├── infrastructure/
│   ├── repositories/      # Repository implementations
│   ├── adapters/          # External service adapters
│   └── database/          # DB connection, migrations
└── presentation/
    ├── api/               # API routes
    ├── pages/             # Next.js pages
    └── components/        # UI components
```

---

## 🔄 Next Steps

1. ✅ Schema đã được cập nhật
2. ⏭️ Tạo migration và apply
3. ⏭️ Bắt đầu với Phase 1: Company & Employment Module
4. ⏭️ Implement theo từng module, test từng bước

---

## 📝 Notes

- Tất cả business logic nằm trong Domain & Application layers
- Infrastructure layer chỉ implement interfaces từ Domain
- Presentation layer chỉ gọi use cases, không có business logic
- Mỗi module có thể test độc lập














