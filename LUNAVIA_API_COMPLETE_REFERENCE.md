# 📚 LUNAVIA - TỔNG HỢP TÍNH NĂNG VÀ API ENDPOINTS

**Ngày tạo:** 2025-01-15  
**Phiên bản:** 1.0.0  
**Base URL:** `https://lunavia.vn/api`

---

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Public APIs (Không cần authentication)](#public-apis)
3. [Protected APIs (Cần authentication)](#protected-apis)
4. [Admin APIs](#admin-apis)
5. [Tính năng theo module](#tính-năng-theo-module)
6. [API Client Reference](#api-client-reference)

---

## 🎯 TỔNG QUAN

### Thống kê API

- **Tổng số endpoints:** 110+ endpoints
- **Public APIs:** ~5 endpoints
- **Protected APIs:** ~90 endpoints
- **Admin APIs:** ~25 endpoints

### Authentication

- **Method:** NextAuth.js với JWT sessions
- **Header:** Cookie-based (automatic với NextAuth)
- **Session endpoint:** `/api/auth/[...nextauth]`

### Response Format

```json
{
  "success": true,
  "data": {...},
  "error": "Error message"
}
```

---

## 🌐 PUBLIC APIS (Không cần authentication)

### 1. Authentication

#### `POST /api/auth/register`
Đăng ký tài khoản mới

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "TOUR_OPERATOR" | "TOUR_AGENCY" | "TOUR_GUIDE",
  "name": "User Name"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "TOUR_OPERATOR"
  }
}
```

#### `POST /api/auth/[...nextauth]`
NextAuth authentication endpoints (signin, signout, callback, session)

**Endpoints:**
- `POST /api/auth/signin` - Đăng nhập
- `POST /api/auth/signout` - Đăng xuất
- `GET /api/auth/session` - Lấy session hiện tại
- `GET /api/auth/csrf` - CSRF token

---

### 2. Public Data

#### `GET /api/cities`
Lấy danh sách cities (có thể filter theo region)

**Query Parameters:**
- `region` (optional): Filter theo region

**Response:**
```json
{
  "cities": [
    {
      "id": "city_id",
      "name": "Hà Nội",
      "region": "Miền Bắc",
      "code": "HAN"
    }
  ]
}
```

#### `GET /api/exchange-rates`
Lấy tỷ giá hiện tại (USD/VND)

**Response:**
```json
{
  "rate": 25000,
  "currency": "USD",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

#### `GET /api/debug/env`
Debug endpoint để check environment variables (chỉ development)

---

## 🔒 PROTECTED APIS (Cần authentication)

### 1. User & Profile

#### `GET /api/user/info`
Lấy thông tin user hiện tại (bao gồm permissions)

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "TOUR_OPERATOR",
  "verifiedStatus": "APPROVED",
  "profile": {...},
  "wallet": {...},
  "permissions": {
    "canCreateTour": true,
    "canApplyToTour": false
  }
}
```

#### `PUT /api/user/profile`
Cập nhật profile

**Request:**
```json
{
  "name": "New Name",
  "bio": "Bio text",
  "languages": ["Vietnamese", "English"],
  "specialties": ["History", "Culture"],
  "phone": "0987654321"
}
```

---

### 2. Companies & Employment

#### `GET /api/companies`
Danh sách companies (có search)

**Query Parameters:**
- `search` (optional): Tìm kiếm theo tên
- `page` (optional): Số trang
- `limit` (optional): Số items mỗi trang

**Response:**
```json
{
  "companies": [...],
  "total": 100,
  "page": 1
}
```

#### `POST /api/companies`
Tạo company mới (Operator/Agency only)

**Request:**
```json
{
  "name": "Company Name",
  "licenseNumber": "123456789",
  "address": "Address",
  "phone": "0987654321"
}
```

#### `GET /api/companies/[id]`
Lấy thông tin company

#### `POST /api/companies/[id]/join-request`
Guide request to join company

**Request:**
```json
{
  "message": "I want to join"
}
```

#### `POST /api/companies/[id]/invite`
Operator invite guide to company

**Request:**
```json
{
  "guideEmail": "guide@example.com",
  "message": "Invitation message"
}
```

#### `POST /api/companies/join-requests/[id]/accept`
Operator accept join request

#### `POST /api/companies/invitations/[id]/accept`
Guide accept invitation

#### `GET /api/companies/[id]/guides`
Lấy danh sách guides của company

---

### 3. Verification (KYC/KYB)

#### `POST /api/verifications/kyc`
Submit KYC (Guide only)

**Request:**
```json
{
  "certificateNumber": "CERT123",
  "certificateUrl": "https://...",
  "idCardNumber": "001234567890",
  "idCardFrontUrl": "https://...",
  "idCardBackUrl": "https://..."
}
```

#### `POST /api/verifications/kyb`
Submit KYB (Operator/Agency only)

**Request:**
```json
{
  "licenseNumber": "123456789",
  "licenseUrl": "https://...",
  "businessRegistrationUrl": "https://...",
  "taxCode": "TAX123"
}
```

#### `POST /api/verifications/[id]/approve`
Admin approve verification

#### `POST /api/verifications/[id]/reject`
Admin reject verification

**Request:**
```json
{
  "reason": "Reason for rejection"
}
```

---

### 4. Tours

#### `GET /api/tours`
Danh sách tours (có filters)

**Query Parameters:**
- `city` (optional): Filter theo city
- `status` (optional): Filter theo status
- `visibility` (optional): PUBLIC | PRIVATE
- `search` (optional): Tìm kiếm
- `page` (optional): Số trang
- `limit` (optional): Số items

**Response:**
```json
{
  "tours": [...],
  "total": 100,
  "page": 1
}
```

#### `POST /api/tours`
Tạo tour mới (Operator/Agency only)

**Request:**
```json
{
  "title": "Tour Title",
  "description": "Tour description",
  "city": "Hà Nội",
  "startDate": "2025-02-01T08:00:00Z",
  "endDate": "2025-02-05T18:00:00Z",
  "priceMain": 5000000,
  "priceSub": 3000000,
  "pax": 20,
  "languages": ["Vietnamese", "English"],
  "specialties": ["History"],
  "mainGuideSlots": 1,
  "subGuideSlots": 2,
  "visibility": "PUBLIC",
  "inclusions": ["Hotel", "Meals"],
  "exclusions": ["Flight"],
  "additionalRequirements": "Requirements"
}
```

#### `GET /api/tours/check`
Check nếu user có thể tạo tour

**Response:**
```json
{
  "canCreate": true,
  "reason": "OK"
}
```

#### `GET /api/tours/my`
Lấy tours của user hiện tại

**Query Parameters:**
- `status` (optional): Filter theo status

#### `GET /api/tours/[id]`
Lấy thông tin tour chi tiết

#### `PUT /api/tours/[id]`
Cập nhật tour (chỉ owner)

#### `DELETE /api/tours/[id]`
Xóa tour (chỉ owner)

#### `PUT /api/tours/[id]/status`
Thay đổi status tour

**Request:**
```json
{
  "status": "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}
```

#### `PUT /api/tours/[id]/visibility`
Thay đổi visibility

**Request:**
```json
{
  "visibility": "PUBLIC" | "PRIVATE"
}
```

#### `POST /api/tours/[id]/apply`
Apply to tour (Guide only)

**Request:**
```json
{
  "role": "MAIN" | "SUB",
  "coverLetter": "Cover letter text"
}
```

#### `GET /api/tours/[id]/applications`
Lấy danh sách applications của tour (chỉ owner)

#### `POST /api/tours/[id]/applications/[applicationId]/accept`
Accept application (Operator only, chỉ tour của mình)

#### `POST /api/tours/[id]/applications/[applicationId]/reject`
Reject application (Operator only)

**Request:**
```json
{
  "reason": "Reason for rejection"
}
```

#### `POST /api/tours/[id]/assign`
Assign guide to tour (Operator only, PRIVATE tours only)

**Request:**
```json
{
  "guideId": "guide_id",
  "role": "MAIN" | "SUB"
}
```

#### `POST /api/tours/[id]/pay`
Pay guide for tour (Operator only)

**Request:**
```json
{
  "guideId": "guide_id",
  "amount": 5000000
}
```

#### `GET /api/tours/[id]/ai-matching`
AI matching guides cho tour

**Query Parameters:**
- `prioritizeExperience` (optional): boolean
- `prioritizeRating` (optional): boolean
- `prioritizeLanguages` (optional): comma-separated
- `minRating` (optional): number
- `minExperience` (optional): number

**Response:**
```json
{
  "matches": [
    {
      "guide": {...},
      "score": 0.92,
      "reasons": [...]
    }
  ]
}
```

---

### 5. Applications & Assignments

#### `GET /api/applications`
Lấy danh sách applications của user

**Query Parameters:**
- `status` (optional): PENDING | ACCEPTED | REJECTED
- `role` (optional): MAIN | SUB

#### `POST /api/applications/[id]/cancel`
Cancel application (Guide only)

**Request:**
```json
{
  "reason": "Reason for cancellation"
}
```

#### `GET /api/assignments`
Lấy danh sách assignments của user

#### `POST /api/assignments/[id]/accept`
Accept assignment (Guide only)

#### `POST /api/assignments/[id]/reject`
Reject assignment (Guide only)

**Request:**
```json
{
  "reason": "Reason for rejection"
}
```

---

### 6. Guides

#### `GET /api/guides`
Danh sách guides (có filters)

**Query Parameters:**
- `search` (optional): Tìm kiếm
- `availabilityStatus` (optional): AVAILABLE | BUSY | ON_TOUR
- `specialties` (optional): comma-separated
- `languages` (optional): comma-separated

#### `GET /api/guides/[id]/profile`
Lấy profile chi tiết của guide (bao gồm badges, reviews, ratings)

**Response:**
```json
{
  "guide": {...},
  "profile": {...},
  "badges": [...],
  "reviews": [...],
  "ratings": {
    "average": 4.5,
    "count": 10
  }
}
```

#### `GET /api/guides/availability`
Lấy availability của guide

**Query Parameters:**
- `guideId` (required): Guide ID
- `startDate` (optional): Start date
- `endDate` (optional): End date

---

### 7. Wallet

#### `POST /api/wallet/topup`
Tạo top-up request

**Request:**
```json
{
  "amount": 1000000,
  "paymentMethodId": "payment_method_id"
}
```

#### `POST /api/wallet/withdrawal`
Tạo withdrawal request

**Request:**
```json
{
  "amount": 500000,
  "method": "BANK" | "MOMO" | "ZALO" | "OTHER",
  "accountNumber": "1234567890",
  "accountOwnerName": "Name",
  "bankName": "Bank Name"
}
```

#### `GET /api/wallet/transactions`
Lấy transaction history

**Query Parameters:**
- `type` (optional): Filter theo type
- `page` (optional): Số trang
- `limit` (optional): Số items

#### `GET /api/wallet/total-earned`
Tổng số tiền đã kiếm được (Guide only)

#### `GET /api/wallet/total-spent`
Tổng số tiền đã chi (Operator only)

---

### 8. Contracts

#### `POST /api/tours/[id]/contract`
Tạo contract cho tour (Operator only)

**Request:**
```json
{
  "title": "Contract Title",
  "content": "Contract content",
  "templateId": "template_id" // optional
}
```

#### `GET /api/tours/[id]/contract`
Lấy contract của tour

#### `POST /api/contracts/[id]/view`
View contract (Guide only, mark as VIEWED)

#### `POST /api/contracts/[id]/accept`
Accept contract (Guide only)

---

### 9. Tour Reports

#### `POST /api/tours/[id]/reports`
Submit tour report (Guide only)

**Request:**
```json
{
  "overallRating": 5,
  "clientSatisfaction": "VERY_SATISFIED",
  "highlights": "Highlights text",
  "challenges": "Challenges text",
  "recommendations": "Recommendations text"
}
```

#### `GET /api/tours/[id]/reports`
Lấy reports của tour

#### `POST /api/tours/[id]/reports/request-payment`
Request payment trong report (Guide only)

**Request:**
```json
{
  "amount": 5000000
}
```

#### `POST /api/tours/[id]/reports/[guideId]/confirm`
Confirm tour và lock payment (Operator only)

#### `POST /api/tours/reports/[id]/approve-payment`
Approve payment request (Operator only)

---

### 10. Notifications

#### `GET /api/notifications`
Lấy notifications của user

**Query Parameters:**
- `read` (optional): true | false
- `type` (optional): Filter theo type
- `page` (optional): Số trang
- `limit` (optional): Số items

**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 5
}
```

#### `PUT /api/notifications/[id]/read`
Mark notification as read

---

### 11. Payment Methods

#### `GET /api/payment-methods`
Lấy danh sách payment methods của user

#### `POST /api/payment-methods`
Thêm payment method

**Request:**
```json
{
  "type": "BANK" | "MOMO" | "ZALO",
  "accountNumber": "1234567890",
  "accountOwnerName": "Name",
  "bankName": "Bank Name"
}
```

#### `PUT /api/payment-methods/[id]`
Cập nhật payment method

#### `DELETE /api/payment-methods/[id]`
Xóa payment method

#### `POST /api/payment-methods/[id]/verify`
Verify payment method

---

### 12. Settings

#### `GET /api/settings`
Lấy settings của user

#### `PUT /api/settings`
Cập nhật settings

**Request:**
```json
{
  "notifications": {
    "email": true,
    "push": true
  }
}
```

#### `GET /api/settings/account`
Lấy account settings

#### `PUT /api/settings/account`
Cập nhật account settings

---

### 13. File Upload

#### `POST /api/upload`
Upload files (avatar, tour files, documents)

**Request:** FormData
- `file`: File
- `type`: "avatar" | "tour" | "document"

**Response:**
```json
{
  "url": "https://...",
  "filename": "filename.jpg"
}
```

---

### 14. AI Features

#### `GET /api/ai/match`
AI matching service

**Query Parameters:**
- `tourId` (required): Tour ID
- `criteria` (optional): JSON string với matching criteria

---

### 15. Escrow

#### `POST /api/escrow/create`
Tạo escrow account

**Request:**
```json
{
  "tourId": "tour_id",
  "amount": 5000000
}
```

#### `GET /api/escrow`
Lấy escrow accounts của user

#### `POST /api/escrow/[id]/lock`
Lock funds trong escrow

#### `POST /api/escrow/[id]/release`
Release funds từ escrow

#### `POST /api/escrow/[id]/refund`
Refund escrow

**Request:**
```json
{
  "amount": 5000000,
  "reason": "Tour cancelled"
}
```

---

### 16. Disputes

#### `POST /api/disputes`
Tạo dispute

**Request:**
```json
{
  "tourId": "tour_id",
  "type": "PAYMENT" | "ASSIGNMENT" | "NO_SHOW" | "QUALITY",
  "description": "Description",
  "evidenceUrls": ["https://..."]
}
```

#### `GET /api/disputes`
Lấy disputes của user

#### `GET /api/disputes/[id]`
Lấy dispute chi tiết

#### `POST /api/disputes/[id]/evidence`
Add evidence to dispute

**Request:**
```json
{
  "evidenceUrls": ["https://..."]
}
```

#### `POST /api/disputes/[id]/escalate`
Escalate dispute

#### `POST /api/disputes/[id]/resolve`
Resolve dispute (Admin only)

**Request:**
```json
{
  "resolution": "FULL_REFUND" | "PARTIAL_REFUND" | "FULL_PAYMENT" | "PARTIAL_PAYMENT" | "NO_ACTION",
  "resolutionAmount": 5000000,
  "resolutionNotes": "Notes"
}
```

#### `POST /api/disputes/[id]/reject`
Reject dispute (Admin only)

#### `POST /api/disputes/[id]/appeal`
Appeal dispute

---

### 17. Standby Requests

#### `GET /api/standby-requests`
Lấy standby requests

#### `POST /api/standby-requests/[id]/accept`
Accept standby request

#### `POST /api/standby-requests/[id]/reject`
Reject standby request

---

### 18. Emergency & Safety

#### `POST /api/tours/[id]/emergency`
Submit SOS/Emergency report

**Request:**
```json
{
  "type": "MEDICAL" | "ACCIDENT" | "LOST" | "OTHER",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "description": "Description",
  "location": "Location"
}
```

#### `GET /api/tours/[id]/emergencies`
Lấy emergencies của tour

#### `POST /api/tours/[id]/emergencies/[emergencyId]/acknowledge`
Acknowledge emergency (Operator only)

#### `GET /api/operator/emergencies`
Lấy tất cả emergencies (Operator only)

---

### 19. Analytics

#### `GET /api/operator/analytics`
Analytics cho operator

**Response:**
```json
{
  "totalTours": 10,
  "totalApplications": 50,
  "totalRevenue": 50000000,
  "upcomingTours": 3
}
```

#### `GET /api/guide/analytics`
Analytics cho guide

**Response:**
```json
{
  "totalApplications": 20,
  "acceptedApplications": 15,
  "totalEarnings": 25000000,
  "upcomingTours": 2
}
```

---

### 20. Messages

#### `GET /api/messages/conversations`
Lấy conversations

#### `GET /api/messages/conversations/[conversationId]/messages`
Lấy messages của conversation

---

### 21. Operator Payment Requests

#### `GET /api/operator/payment-requests`
Lấy payment requests (Operator only)

**Query Parameters:**
- `status` (optional): PENDING | APPROVED | REJECTED

#### `POST /api/operator/payment-requests/[id]/approve`
Approve payment request

#### `POST /api/operator/payment-requests/[id]/reject`
Reject payment request

---

## 🛡️ ADMIN APIS (Cần admin role)

### 1. User Management

#### `GET /api/admin/users`
Danh sách users

**Query Parameters:**
- `role` (optional): Filter theo role
- `verifiedStatus` (optional): Filter theo status
- `page` (optional): Số trang
- `limit` (optional): Số items

#### `GET /api/admin/users/[id]`
Lấy user chi tiết

#### `PUT /api/admin/users/[id]`
Cập nhật user

#### `DELETE /api/admin/users/[id]`
Xóa user

#### `POST /api/admin/users/[id]/block`
Block user

**Request:**
```json
{
  "reason": "Reason",
  "notes": "Notes"
}
```

#### `GET /api/admin/users/[id]/profile`
Lấy profile của user

#### `POST /api/admin/users/[id]/reset-password`
Reset password user

#### `GET /api/admin/users/for-transfer`
Lấy users cho transfer (có wallet)

---

### 2. Verification Management

#### `GET /api/admin/verifications/[id]`
Lấy verification chi tiết

#### `POST /api/admin/verifications/[id]/approve`
Approve verification

#### `POST /api/admin/verifications/[id]/reject`
Reject verification

---

### 3. Tour Management

#### `GET /api/admin/tours`
Danh sách tours (admin view)

#### `POST /api/admin/tours/[id]/delete`
Xóa tour (admin)

#### `POST /api/admin/tours/[id]/moderate`
Moderate tour

**Request:**
```json
{
  "action": "APPROVE" | "REJECT" | "BLOCK",
  "reason": "Reason"
}
```

---

### 4. Dispute Management

#### `GET /api/admin/disputes/[id]`
Lấy dispute chi tiết

#### `POST /api/admin/disputes/[id]/process`
Process dispute

**Request:**
```json
{
  "resolution": "FULL_REFUND",
  "resolutionAmount": 5000000,
  "resolutionNotes": "Notes"
}
```

---

### 5. Wallet Management

#### `GET /api/admin/topup-requests`
Danh sách top-up requests

#### `POST /api/admin/topup-requests/[id]/process`
Process top-up request

**Request:**
```json
{
  "action": "APPROVE" | "REJECT",
  "adminNotes": "Notes"
}
```

#### `GET /api/admin/withdrawal-requests`
Danh sách withdrawal requests

#### `POST /api/admin/withdrawal-requests/[id]/process`
Process withdrawal request

**Request:**
```json
{
  "action": "APPROVE" | "REJECT",
  "adminNotes": "Notes"
}
```

---

### 6. Transfers

#### `GET /api/admin/transfers`
Lấy transfer history

#### `POST /api/admin/transfers`
Tạo transfer (admin to user)

**Request:**
```json
{
  "toUserId": "user_id",
  "amount": 1000000,
  "description": "Description"
}
```

---

### 7. Company Management

#### `GET /api/admin/companies/[companyId]/members/[guideId]/verify-contract`
Verify contract của company member

---

### 8. Payment Settings

#### `GET /api/admin/payment-settings/bank-accounts`
Lấy bank accounts

#### `POST /api/admin/payment-settings/bank-accounts`
Thêm bank account

#### `PUT /api/admin/payment-settings/bank-accounts/[id]`
Cập nhật bank account

#### `DELETE /api/admin/payment-settings/bank-accounts/[id]`
Xóa bank account

---

## 📦 TÍNH NĂNG THEO MODULE

### 1. Authentication & Authorization ✅
- User registration
- Login/Logout
- Session management
- Role-based access control

### 2. User Management ✅
- Profile management
- User settings
- Account management

### 3. Company & Employment ✅
- Company creation
- Join requests
- Invitations
- In-house guide management

### 4. Verification (KYC/KYB) ✅
- KYC submission (Guide)
- KYB submission (Operator)
- Admin approval workflow

### 5. Tour Management ✅
- Tour creation
- Tour listing với filters
- Tour status management
- Tour visibility controls
- AI matching

### 6. Application System ✅
- Apply to tour
- Accept/Reject applications
- Conflict checking
- Slot availability

### 7. Assignment System ✅
- Direct assignment
- Accept/Reject assignments

### 8. Wallet System ✅
- Top-up requests
- Withdrawal requests
- Transaction history
- Balance management

### 9. Payment System ✅
- Payment processing
- Payment milestones
- Escrow system
- Platform fee calculation

### 10. Contract System ✅
- Contract creation
- Contract viewing
- Contract acceptance

### 11. Tour Reports ✅
- Report submission
- Payment requests
- Report approval

### 12. Notification System ✅
- In-app notifications
- Read/unread tracking
- Notification settings

### 13. Dispute System ✅
- Dispute creation
- Evidence management
- Dispute resolution
- Appeal process

### 14. Emergency & Safety ✅
- SOS reporting
- Emergency management
- Safety check-ins

### 15. Analytics ✅
- Operator analytics
- Guide analytics

### 16. Admin System ✅
- User management
- Verification management
- Tour moderation
- Dispute management
- Wallet management
- Transfer management

---

## 🔧 API CLIENT REFERENCE

### Sử dụng API Client

File: `src/lib/api-client.ts`

```typescript
import { api } from "@/lib/api-client";

// Get user info
const userInfo = await api.user.getInfo();

// Create tour
const tour = await api.tours.create({
  title: "Tour Title",
  // ...
});

// Apply to tour
await api.tours.apply(tourId, {
  role: "MAIN",
  coverLetter: "Cover letter"
});
```

### Available API Methods

Xem file `src/lib/api-client.ts` để biết tất cả available methods.

---

## 📝 NOTES

### Authentication Flow

1. User đăng ký/đăng nhập qua `/api/auth/register` hoặc `/api/auth/signin`
2. NextAuth tạo session và set cookie
3. Tất cả protected endpoints tự động check session
4. Nếu không có session → 401 Unauthorized

### Error Handling

Tất cả endpoints trả về:
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Rate Limiting

⚠️ **Chưa implement rate limiting** - Cần thêm trong tương lai

### File Upload

- Max file size: TBD
- Allowed types: Images, PDFs
- Storage: TBD (có thể là S3, Cloudinary)

---

**Tài liệu này sẽ được cập nhật khi có thay đổi.**




