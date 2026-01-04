# API Endpoints - Lunavia Platform

## Authentication & User
- `GET /api/user/info` - Get user profile info
- `PUT /api/user/profile` - Update user profile

## Companies & Employment
- `GET /api/companies` - List companies (with search)
- `POST /api/companies` - Create company (operator)
- `GET /api/companies/[id]` - Get company details
- `POST /api/companies/[id]/join-request` - Request to join company (guide)
- `POST /api/companies/[id]/invite` - Invite guide to company (operator)
- `POST /api/companies/join-requests/[id]/accept` - Accept join request (operator)
- `POST /api/companies/invitations/[id]/accept` - Accept invitation (guide)

## Verification (KYC/KYB)
- `POST /api/verifications/kyc` - Submit KYC (guide)
- `POST /api/verifications/kyb` - Submit KYB (operator)
- `POST /api/verifications/[id]/approve` - Approve verification (admin)
- `POST /api/verifications/[id]/reject` - Reject verification (admin)

## Tours
- `GET /api/tours` - List tours (with filters)
- `POST /api/tours` - Create tour (operator)
- `GET /api/tours/check` - Check if can create tour
- `GET /api/tours/[id]` - Get tour details
- `PUT /api/tours/[id]/status` - Change tour status (operator)
- `POST /api/tours/[id]/apply` - Apply to tour (guide)
- `GET /api/tours/[id]/applications` - Get applications for tour
- `POST /api/tours/[id]/applications/[applicationId]/accept` - Accept application (operator)
- `POST /api/tours/[id]/applications/[applicationId]/reject` - Reject application (operator)
- `POST /api/tours/[id]/assign` - Assign guide to tour (operator, private only)
- `POST /api/tours/[id]/pay` - Pay guide for tour (operator)
- `POST /api/tours/[id]/reports` - Submit tour report (guide)
- `GET /api/tours/[id]/reports` - Get tour reports
- `POST /api/tours/[id]/contract` - Create contract (operator)
- `GET /api/tours/[id]/contract` - Get contract

## Applications & Assignments
- `POST /api/assignments/[id]/accept` - Accept assignment (guide)
- `POST /api/assignments/[id]/reject` - Reject assignment (guide)

## Guides
- `GET /api/guides/[id]/profile` - Get guide profile with badges

## Wallet
- `POST /api/wallet/topup` - Create top-up request
- `POST /api/wallet/withdrawal` - Create withdrawal request
- `POST /api/wallet/topup-requests/[id]/process` - Process top-up (admin)
- `POST /api/wallet/withdrawal-requests/[id]/process` - Process withdrawal (admin)

## Contracts
- `POST /api/contracts/[id]/view` - View contract (guide)
- `POST /api/contracts/[id]/accept` - Accept contract (guide)

## Notifications
- `GET /api/notifications` - Get notifications (with filters)
- `PUT /api/notifications/[id]/read` - Mark notification as read

## Cities & Exchange Rates
- `GET /api/cities` - List cities (with region filter)
- `GET /api/exchange-rates` - Get current exchange rate
- `POST /api/exchange-rates` - Update exchange rate (admin)

## File Upload
- `POST /api/upload` - Upload files (avatar, tour files)

---

## Tính năng đã implement

### ✅ Phase 1: Core Foundation
1. **Company & Employment Module**
   - Company ID auto-generation
   - Join requests
   - Invitations với invite links
   - In-house guide management

2. **Verification Module**
   - KYC cho guides
   - KYB cho operators
   - Admin approval workflow

3. **City & Region Module**
   - City management
   - Region-based filtering

4. **Exchange Rate Management**
   - USD/VND rate management
   - Admin update

### ✅ Phase 2: Tours & Matching
1. **Tour Module**
   - Create tour với đầy đủ fields
   - Status management (DRAFT → OPEN → IN_PROGRESS → COMPLETED)
   - Visibility (PUBLIC/PRIVATE)
   - Inclusions/Exclusions
   - Main/Sub guide slots

2. **Applications & Assignments**
   - Apply to tour với conflict checking
   - Availability checking
   - Accept/Reject applications
   - Direct assignment cho private tours
   - Guide accept/reject assignments

3. **View Guide Profile**
   - Full profile với badges
   - Reviews, ratings
   - Company info
   - Verification status

### ✅ Phase 3: Wallet & Payments
1. **Top-Up Requests**
   - Create top-up request
   - Admin process với locked deposit logic cho operators

2. **Withdrawal Requests**
   - Create withdrawal request
   - Minimum balance check cho guides
   - Admin process

3. **Payments**
   - Operator pay guide
   - Available balance checking
   - Transaction tracking

### ✅ Phase 4: Tour Reports & Completion
1. **Tour Reports**
   - Submit report (guide)
   - Payment request trong report
   - Approve payment request (operator)

### ✅ Phase 5: Notifications & Contracts
1. **Notifications**
   - Auto notifications cho:
     - New applications
     - Application status changes
     - New assignments
     - Payments
     - Verification status changes
   - Mark as read
   - Unread count

2. **Contracts**
   - Create contract (operator)
   - View contract (guide)
   - Accept contract (guide)
   - Track acceptance status

---

## Business Rules Implemented

### Tour Operators
- ✅ Must have KYB approved
- ✅ Must have license number
- ✅ Must have 1,000,000 VND locked deposit
- ✅ Top-up fills locked deposit first
- ✅ Cannot withdraw locked deposit

### Tour Guides
- ✅ Must have KYC approved
- ✅ Must have minimum 500,000 VND balance
- ✅ Cannot apply if balance < 500k
- ✅ Cannot withdraw below 500k minimum

### Applications
- ✅ Conflict checking (overlap dates)
- ✅ Slot availability checking
- ✅ Visibility rules (PUBLIC vs PRIVATE)
- ✅ Auto-reject when slots full

### Assignments
- ✅ Only for private tours
- ✅ Only for in-house guides
- ✅ Guide can reject với reason required

### Notifications
- ✅ Auto-sent for all major events
- ✅ Track read/unread status

---

## Database Schema
Tất cả entities đã được tạo trong `prisma/schema.prisma`:
- User, Profile, Wallet
- Company, CompanyMember, CompanyInvitation, JoinRequest
- Tour, Application, Assignment
- Verification
- Payment, Transaction
- TopUpRequest, WithdrawalRequest
- TourReport
- Contract, ContractAcceptance
- Notification
- City, ExchangeRate

---

## Clean Architecture Structure
```
src/
├── domain/
│   └── services/          # Domain services (business logic)
├── application/
│   └── use-cases/          # Use cases (application logic)
└── app/
    └── api/                # API routes (presentation layer)
```

Tất cả tính năng đã được implement theo Clean Architecture principles!









