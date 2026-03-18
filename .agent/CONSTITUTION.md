# LUNAVIA – MASTER SYSTEM CONSTITUTION (MSC) v1.2

**Version**: 1.2  
**Last updated**: 2026-02-04  
**Phases covered**: 1 → 17  
**Owner**: Founder / System Architect  
**Status**: ACTIVE – must be referenced before any code change

---

## CHAPTER 0 – PRODUCT DNA (BẤT DI BẤT DỊCH)

### 0.1 Lunavia là gì

Lunavia là nền tảng điều phối & bảo chứng nguồn lực hướng dẫn viên du lịch, tập trung vào:
- trách nhiệm vận hành
- khả dụng (availability)
- uy tín (trust)
- khả năng can thiệp khi có sự cố (SOS)

**Lunavia KHÔNG PHẢI:**
- app booking tour
- sàn việc làm thuần job-post
- HR software
- fintech (chưa)

### 0.2 Vấn đề Lunavia giải quyết
- Operator không tìm được guide đúng lúc
- Guide nhận tour trùng giờ / huỷ sát giờ
- Không có cơ chế chịu trách nhiệm & hậu quả
- Không có "last-resort" khi tour sắp chạy

👉 **Vì vậy, ServiceRequest là trung tâm, Trust là xương sống.**

---

## CHAPTER 1 – IDENTITY & ROLE SYSTEM (Updated – Phase 14)

> ⚠️ This section supersedes all previous role definitions. Phase 14 has locked identity and role mechanics.

### 1.1 Roles (LOCKED)

The system supports exactly **two roles**:

| Role | Description |
|------|-------------|
| `TOUR_OPERATOR` | Creates ServiceRequests and hires guides |
| `TOUR_GUIDE` | Applies to and fulfills ServiceRequests |

**There are NO other roles for marketplace participants.**

### 1.2 Role Assignment (IMMUTABLE)

- Role is selected **during signup**
- Role is **immutable** – users cannot switch roles after signup
- Login redirects directly to the dashboard of the assigned role
- No post-login role selection exists or is permitted

### 1.3 Deprecated / Removed

The following are **permanently removed** from the system:

- ❌ `UNASSIGNED` role
- ❌ `/select-role` flow
- ❌ Any post-login role selection mechanism
- ❌ Role switching functionality

### 1.4 Internal Roles (Unchanged)

Internal administrative roles remain separate:
- `SUPER_ADMIN`, `OPS`, `CS`, `FINANCE` – for platform operations
- `OBSERVER` – for audit/compliance/demo (read-only)

---

## CHAPTER 2 – OPERATOR & GUIDE SEMANTICS (Clarified – Phase 14)

### 2.1 TOUR_OPERATOR

**Definition**: An entity that creates ServiceRequests and hires guides.

**Includes (as profile metadata, NOT separate roles):**

| Operator Type | Description |
|---------------|-------------|
| `company` | Licensed tour operator company (has travel license) |
| `agency` | Travel agency (business registration only) |
| `sole` | Sole operator (individual, no license) |

These are **metadata distinctions**, not different roles. All are `TOUR_OPERATOR`.

### 2.2 TOUR_GUIDE

**Definition**: An entity that applies to and fulfills ServiceRequests.

**Includes (as profile metadata, NOT separate roles):**

| Guide Type | Description |
|------------|-------------|
| `freelance` | Independent guide |
| `inhouse` | Guide affiliated with a specific operator |
| `association` | Member of a guide association or social organization |

These are **metadata distinctions**, not different roles. All are `TOUR_GUIDE`.

> ⚠️ There is NO separate "Service Provider" or "Agency" role for guides. Guide providers and associations are represented as `TOUR_GUIDE` with appropriate metadata.

---

## CHAPTER 3 – KYC / KYB FOUNDATION (New – Phase 14)

### 3.1 Principles

| Principle | Description |
|-----------|-------------|
| **Mandatory** | KYC/KYB is mandatory for all users |
| **Declarative** | System records declarations and documents |
| **Non-regulatory** | Lunavia does NOT legally verify documents |
| **Advisory** | Verification is advisory, not regulatory |

### 3.2 Required Documents

- **Proof of Address** – mandatory for all users
- Business registration / license – optional, for trust scoring

### 3.3 KYC/KYB Impact

Completeness of KYC/KYB influences:
- Trust score
- Feature access
- Marketplace visibility (future phases)
- Priority in matching (future phases)

### 3.4 Status Values

| Status | Description |
|--------|-------------|
| `NOT_STARTED` | User has not begun verification |
| `PENDING` | Documents submitted, awaiting review |
| `APPROVED` | Verification complete |
| `REJECTED` | Verification rejected, can resubmit |

---

## CHAPTER 4 – SERVICEREQUEST (TRÁI TIM HỆ THỐNG)

### 4.1 Định nghĩa

**ServiceRequest = 1 yêu cầu vận hành tour**
→ không phải hợp đồng pháp lý
→ là đơn vị logic để:
- block availability
- gán trách nhiệm
- tính trust
- xử lý incident

### 4.2 Trạng thái chuẩn (KHÔNG BỚT)

```
OPEN         (public / đang chờ apply)
OFFERED      (guide đã apply / chờ operator chọn)
ASSIGNED     (đã chọn guide)
IN_PROGRESS  (tour đang chạy)
COMPLETED    (kết thúc)
CANCELLED    (bị huỷ)
```

### 4.3 Nguyên tắc
- 1 ServiceRequest có thể có nhiều guide
- 1 guide KHÔNG được trùng giờ
- state change = event log (audit)

---

## CHAPTER 5 – VISIBILITY & ELIGIBILITY

### 5.1 Visibility
- **Public**: freelance + agency thấy
- **Private**: chỉ inhouse / invited

### 5.2 Eligibility (thay cho visibility cứng)

Eligibility quyết định:
- ai THẤY
- ai APPLY
- ai được ưu tiên

Phụ thuộc:
- role
- trust
- availability
- plan

---

## CHAPTER 6 – AVAILABILITY SYSTEM

### 6.1 Availability là tài sản của guide
- **ON** → có thể được match
- **OFF** → biến mất khỏi hệ thống

### 6.2 Rule cứng
- ASSIGNED / STANDBY → block time
- chưa close tour → không nhận tour mới

---

## CHAPTER 7 – STANDBY & SOS (MONETIZATION CORE)

### 7.1 Standby
- operator trả fee standby
- guide standby:
  - bị block
  - không nhận tour khác
  - cancel standby chỉ trước T–X giờ

### 7.2 SOS
- chỉ cho PRO / PREMIUM
- dùng khi:
  - sát giờ
  - thiếu guide
- SOS = priority override

👉 **SOS là đòn bẩy thu tiền, KHÔNG phải feature miễn phí.**

---

## CHAPTER 8 – TRUST SYSTEM (GOVERNANCE LAYER)

### 8.1 Trust không phải rating

**Trust = uy tín vận hành & trách nhiệm**

### 8.2 Trust thay đổi khi
- cancel sát giờ
- no-show
- dispute
- incident
- hoàn thành tốt

### 8.3 Hệ quả trust
- giảm visibility
- giảm eligibility
- suspend nếu lặp

---

## CHAPTER 9 – PAYMENT CONFIRMATION (KHÔNG ESCROW)

### 9.1 Lunavia không giữ tiền
- operator trả guide ngoài hệ thống

### 9.2 Nhưng Lunavia BẮT BUỘC:
- request payment
- operator xác nhận
- guide xác nhận đã nhận

### 9.3 Chưa close payment
→ guide không nhận tour mới

---

## CHAPTER 10 – INCIDENT & DISPUTE

### 10.1 Incident
- báo trong tour
- log lại
- không tự xử tiền

### 10.2 Cancel request
- guide có thể request
- operator quyết
- hệ thống ghi nhận trust

---

## CHAPTER 11 – PLAN & POLICY

### 11.1 Plan
- **FREE**
- **PRO**
- **PREMIUM**

### 11.2 Unlock
- SOS
- priority
- export
- advanced visibility

### 11.3 Policy Engine
- soft-gate UI
- không hard-block logic giai đoạn đầu

---

## CHAPTER 12 – NOTIFICATION & COMMUNICATION
- in-app là chính
- email là reminder
- trust change phải notify

---

## CHAPTER 13 – WHAT WE INTENTIONALLY DO NOT BUILD

🚫 **Không:**
- auto assign
- escrow (trước giấy phép)
- rating 5 sao
- marketplace vô kiểm soát
- AI decision thay con người

---

## CHAPTER 14 – PHASE 14 DECISIONS (LOCKED)

The following decisions are **permanently locked** and cannot be reversed without explicit founder approval:

| Decision | Status |
|----------|--------|
| Role selection moved to signup | ✅ LOCKED |
| Auth is database-backed | ✅ LOCKED |
| Role-based middleware simplified | ✅ LOCKED |
| Verification is advisory, not regulatory | ✅ LOCKED |
| Identity is immutable | ✅ LOCKED |
| UNASSIGNED role removed | ✅ LOCKED |
| /select-role flow removed | ✅ LOCKED |

---

## CHAPTER 15 – DEVELOPMENT RULES (CHO AI & DEV)

1. **ServiceRequest là trung tâm**
2. **Không thêm feature nếu:**
   - không gắn ServiceRequest
   - không ảnh hưởng trust / availability
3. **Không simplify role**
4. **Không hardcode policy**
5. **Không phá audit trail**
6. **Không thêm role mới** (Phase 14 locked)
7. **Không cho phép role switching**

---

## 🔒 CHAPTER 16 – INTERNAL GOVERNANCE & PERMISSION MODEL

Add a chapter defining internal roles, authority boundaries, and accountability.

Include exactly these internal roles (no more, no less):
- `SUPER_ADMIN`
- `ADMIN`
- `OPS`
- `CS`
- `FINANCE`
- `OBSERVER` (read-only)

For each role, clearly define:
- ✅ What they CAN do
- ❌ What they CANNOT do
- 🔐 What actions require SUPER_ADMIN approval
- 📜 Audit requirements (what must be logged)

Mandatory governance rules:
- All sensitive actions MUST be auditable
- No silent overrides
- No role may bypass ServiceRequest lifecycle rules
- Internal roles cannot impersonate users

---

## 🎟️ CHAPTER 17 – VOUCHER & PLAN OVERRIDE POLICY

Document the voucher system as a controlled plan override mechanism.

Must include:
- Purpose of vouchers (pilot / early access / marketing)
- Voucher types:
  - duration-based (30 / 90 days)
  - usage-based (X activations)
- Who can generate vouchers (ADMIN / SUPER_ADMIN only)
- Where vouchers are redeemed (Profile Settings)
- Effects:
  - Temporary upgrade from FREE → PRO / PREMIUM
- Hard rules:
  - No stacking
  - No retroactive application
  - Admin can revoke
  - Full audit logging required

Explicitly state:

Lunavia vouchers do NOT represent monetary value and are NOT financial instruments.

---

## 🛠️ CHAPTER 18 – MAINTENANCE & VERSIONING POLICY

Add a chapter defining how Lunavia handles system maintenance and updates.

Must include:
- Maintenance types:
  - Soft maintenance (read-only / limited access)
  - Hard maintenance (full lock)
- Admin-only toggle
- Mandatory user-facing notice
- No data deletion during maintenance
- Rollback principle:
  - If deployment fails → revert without data loss
- Logging of:
  - who triggered maintenance
  - duration
  - affected systems

Explicit rule:

No schema or behavior changes may be deployed without a defined rollback path.

---

## CHAPTER 19 — SERVICE REQUEST CREATION & DRAFT LOGIC (NEW)

### 19.1 Draft is NOT a status list — Draft is an ACTION STATE

A ServiceRequest (e.g. Tour) can be:
- Created as DRAFT
- Edited multiple times
- Then PUBLISHED explicitly by the Operator

Draft is:
- Private to the Operator
- Not visible to guides
- Not part of marketplace
- Not part of matching or trust logic

Operators can:
- Create Draft
- Publish immediately
- Cancel Draft
- Edit Draft without penalty

**Draft ≠ Cancelled**
**Draft ≠ Open**
**Draft is a pre-publication workspace**

### 19.2 SERVICE TYPE DEFINITION (NEW)

ServiceRequest must support typed creation:

| Service Type | Notes |
|--------------|-------|
| `TOUR` | Full tour logic applies |
| `CAR` | Driver-based service |
| `RESTAURANT` | Placeholder (future) |
| `OTHER` | Generic service |

*Only TOUR requires extended fields.*

### 19.3 TOUR CREATION (REQUIRED FIELDS)

When Service Type = TOUR, the following fields are mandatory:

**Core**
- Title
- Location (from predefined Admin-managed list)
- Start datetime
- End datetime
- Visibility:
  - `PUBLIC_MARKET`
  - `INHOUSE_ONLY`

**Tour Details**
- Itinerary (free text)
- Inclusion
- Exclusion

**Guide Requirements (MANDATORY)**

Operator must define at least one role needed:

| Role Needed | Description |
|-------------|-------------|
| `MAIN_GUIDE` | Lead guide |
| `SUB_GUIDE` | Assistant |
| `INTERN` | Trainee |

For each role:
- Quantity (number required)
- Eligibility (optional notes)

**Tour cannot be published without role definition.**

### 19.4 LOCATION GOVERNANCE (NEW)
- Locations are selected from a controlled list
- List is managed by Admin / Ops
- Guides & Operators can filter ONLY by active locations
- Prevents free-text chaos

---

## CHAPTER 20 — DASHBOARD GOVERNANCE & STRUCTURE (REVISED)

### 20.1 Operator Navigation

Left Navigation MUST include:
- My Tours (single page)
- Filters:
  - Status (Draft / Open / Assigned / In Progress / Completed / Cancelled)
  - Date range
  - Tour ID search
- My Team (In-house guides)
- Profile
- Settings
- Verification
- Help & Feedback

**Draft / Active / Completed / Cancelled are NOT separate pages**

---

## CHAPTER 21 — VERIFICATION & IDENTITY PROTOCOLS (CRITICAL FIX)

### 21.1 Verification Routing is ROLE-BOUND

Users must NEVER choose verification type manually.

**Rules:**
- `TOUR_OPERATOR` → `/verification/operator`
- `TOUR_GUIDE` → `/verification/guide`

**/verification page must:**
- Detect role
- Redirect automatically

**Any role mismatch is a BLOCKING ERROR.**

### 21.2 VERIFICATION REQUIREMENTS (LOCKED)

**Operator / Agency (KYB)**
- Business registration
- Operating license
- Legal representative name
- Proof of address

**Sole Operator (STRICT)**
- National ID
- Proof of address
- Manual CS approval REQUIRED
- MUST be PRO plan to create tours

**Tour Guide (KYC)**
- Government ID
- Tour guide card (if available)
- Proof of address

**Verification always requires CS approval.**

### 21.3 AVATAR & IDENTITY TRUST SIGNAL
- User profile MUST allow avatar upload
- Real photo required (future KYC matching)
- Avatar contributes to Trust score (soft)

### 21.4 DASHBOARD VERIFICATION CTA CONSISTENCY
- Both Operator and Guide dashboards MUST show:
  - Verification CTA if unverified
  - Same destination logic
  - No dead links
  - `/profile/verification` is deprecated

### 21.5 MAINTENANCE MODE (CONFIRM)

Maintenance Mode:
- Blocks ALL external users
- Admin / Ops bypass only
- Message configurable
- Logged in audit trail

---

## ENFORCEMENT RULES
- **NO** auto-matching outside defined logic
- **NO** free-form location input
- **NO** manual verification selection
- **NO** draft visibility leak
- **NO** creative UX reinterpretation

**Any deviation requires explicit Founder approval.**

---

## TRẠNG THÁI HIỆN TẠI (2026-02-04)

| Component | Status |
|-----------|--------|
| Architecture | ✅ |
| Trust / Notification | ✅ |
| Observer / Referral | ⚠️ (defer) |
| ServiceRequest | ✅ (Phase 13) |
| Identity & Role System | ✅ (Phase 14) |
| KYC/KYB Foundation | ✅ (Phase 14) |
| Internal Governance | ✅ (Phase 17) |
| Voucher System | ✅ (Phase 17) |
| Draft & Dashboard Logic | ⚠️ (Phase 19 Update) |
| Verification Protocol | ⚠️ (Phase 19 Update) |

---

## CHANGELOG

### v1.2 (UPDATE) – 2026-02-04
- Added **Chapter 19**: Service Request Creation & Draft Logic
- Added **Chapter 20**: Dashboard Governance & Structure
- Added **Chapter 21**: Verification & Identity Protocols
- Enforced Role-Bound Verification Routing
- Locked Draft as Action State (not Status)
- Defined Location Governance
- Clarified Maintenance Mode
- Previous v1.2 changes (Internal Roles, Vouchers) retained

### v1.1 – 2026-02-04
- Locked role system to `TOUR_OPERATOR` / `TOUR_GUIDE`
- Removed post-login role selection (`/select-role`)
- Removed `UNASSIGNED` role permanently
- Introduced KYC/KYB foundation
- Clarified operator vs guide semantics (metadata-based distinctions)
- Added Phase 14 locked decisions
- Constitution aligned with Phase 14 implementation
- Updated development rules for role immutability

### v1.0 – 2026-02-03
- Initial constitution documenting Phases 1–12
- Defined ServiceRequest lifecycle
- Established Trust system principles
- Documented Standby & SOS monetization

**Version**: 1.1  
**Last updated**: 2026-02-04  
**Phases covered**: 1 → 14  
**Owner**: Founder / System Architect  
**Status**: ACTIVE – must be referenced before any code change

---

## CHAPTER 0 – PRODUCT DNA (BẤT DI BẤT DỊCH)

### 0.1 Lunavia là gì

Lunavia là nền tảng điều phối & bảo chứng nguồn lực hướng dẫn viên du lịch, tập trung vào:
- trách nhiệm vận hành
- khả dụng (availability)
- uy tín (trust)
- khả năng can thiệp khi có sự cố (SOS)

**Lunavia KHÔNG PHẢI:**
- app booking tour
- sàn việc làm thuần job-post
- HR software
- fintech (chưa)

### 0.2 Vấn đề Lunavia giải quyết
- Operator không tìm được guide đúng lúc
- Guide nhận tour trùng giờ / huỷ sát giờ
- Không có cơ chế chịu trách nhiệm & hậu quả
- Không có "last-resort" khi tour sắp chạy

👉 **Vì vậy, ServiceRequest là trung tâm, Trust là xương sống.**

---

## CHAPTER 1 – IDENTITY & ROLE SYSTEM (Updated – Phase 14)

> ⚠️ This section supersedes all previous role definitions. Phase 14 has locked identity and role mechanics.

### 1.1 Roles (LOCKED)

The system supports exactly **two roles**:

| Role | Description |
|------|-------------|
| `TOUR_OPERATOR` | Creates ServiceRequests and hires guides |
| `TOUR_GUIDE` | Applies to and fulfills ServiceRequests |

**There are NO other roles for marketplace participants.**

### 1.2 Role Assignment (IMMUTABLE)

- Role is selected **during signup**
- Role is **immutable** – users cannot switch roles after signup
- Login redirects directly to the dashboard of the assigned role
- No post-login role selection exists or is permitted

### 1.3 Deprecated / Removed

The following are **permanently removed** from the system:

- ❌ `UNASSIGNED` role
- ❌ `/select-role` flow
- ❌ Any post-login role selection mechanism
- ❌ Role switching functionality

### 1.4 Internal Roles (Unchanged)

Internal administrative roles remain separate:
- `SUPER_ADMIN`, `OPS`, `CS`, `FINANCE` – for platform operations
- `OBSERVER` – for audit/compliance/demo (read-only)

---

## CHAPTER 2 – OPERATOR & GUIDE SEMANTICS (Clarified – Phase 14)

### 2.1 TOUR_OPERATOR

**Definition**: An entity that creates ServiceRequests and hires guides.

**Includes (as profile metadata, NOT separate roles):**

| Operator Type | Description |
|---------------|-------------|
| `company` | Licensed tour operator company (has travel license) |
| `agency` | Travel agency (business registration only) |
| `sole` | Sole operator (individual, no license) |

These are **metadata distinctions**, not different roles. All are `TOUR_OPERATOR`.

### 2.2 TOUR_GUIDE

**Definition**: An entity that applies to and fulfills ServiceRequests.

**Includes (as profile metadata, NOT separate roles):**

| Guide Type | Description |
|------------|-------------|
| `freelance` | Independent guide |
| `inhouse` | Guide affiliated with a specific operator |
| `association` | Member of a guide association or social organization |

These are **metadata distinctions**, not different roles. All are `TOUR_GUIDE`.

> ⚠️ There is NO separate "Service Provider" or "Agency" role for guides. Guide providers and associations are represented as `TOUR_GUIDE` with appropriate metadata.

---

## CHAPTER 3 – KYC / KYB FOUNDATION (New – Phase 14)

### 3.1 Principles

| Principle | Description |
|-----------|-------------|
| **Mandatory** | KYC/KYB is mandatory for all users |
| **Declarative** | System records declarations and documents |
| **Non-regulatory** | Lunavia does NOT legally verify documents |
| **Advisory** | Verification is advisory, not regulatory |

### 3.2 Required Documents

- **Proof of Address** – mandatory for all users
- Business registration / license – optional, for trust scoring

### 3.3 KYC/KYB Impact

Completeness of KYC/KYB influences:
- Trust score
- Feature access
- Marketplace visibility (future phases)
- Priority in matching (future phases)

### 3.4 Status Values

| Status | Description |
|--------|-------------|
| `NOT_STARTED` | User has not begun verification |
| `PENDING` | Documents submitted, awaiting review |
| `APPROVED` | Verification complete |
| `REJECTED` | Verification rejected, can resubmit |

---

## CHAPTER 4 – SERVICEREQUEST (TRÁI TIM HỆ THỐNG)

### 4.1 Định nghĩa

**ServiceRequest = 1 yêu cầu vận hành tour**
→ không phải hợp đồng pháp lý
→ là đơn vị logic để:
- block availability
- gán trách nhiệm
- tính trust
- xử lý incident

### 4.2 Trạng thái chuẩn (KHÔNG BỚT)

```
OPEN         (public / đang chờ apply)
OFFERED      (guide đã apply / chờ operator chọn)
ASSIGNED     (đã chọn guide)
IN_PROGRESS  (tour đang chạy)
COMPLETED    (kết thúc)
CANCELLED    (bị huỷ)
```

### 4.3 Nguyên tắc
- 1 ServiceRequest có thể có nhiều guide
- 1 guide KHÔNG được trùng giờ
- state change = event log (audit)

---

## CHAPTER 5 – VISIBILITY & ELIGIBILITY

### 5.1 Visibility
- **Public**: freelance + agency thấy
- **Private**: chỉ inhouse / invited

### 5.2 Eligibility (thay cho visibility cứng)

Eligibility quyết định:
- ai THẤY
- ai APPLY
- ai được ưu tiên

Phụ thuộc:
- role
- trust
- availability
- plan

---

## CHAPTER 6 – AVAILABILITY SYSTEM

### 6.1 Availability là tài sản của guide
- **ON** → có thể được match
- **OFF** → biến mất khỏi hệ thống

### 6.2 Rule cứng
- ASSIGNED / STANDBY → block time
- chưa close tour → không nhận tour mới

---

## CHAPTER 7 – STANDBY & SOS (MONETIZATION CORE)

### 7.1 Standby
- operator trả fee standby
- guide standby:
  - bị block
  - không nhận tour khác
  - cancel standby chỉ trước T–X giờ

### 7.2 SOS
- chỉ cho PRO / PREMIUM
- dùng khi:
  - sát giờ
  - thiếu guide
- SOS = priority override

👉 **SOS là đòn bẩy thu tiền, KHÔNG phải feature miễn phí.**

---

## CHAPTER 8 – TRUST SYSTEM (GOVERNANCE LAYER)

### 8.1 Trust không phải rating

**Trust = uy tín vận hành & trách nhiệm**

### 8.2 Trust thay đổi khi
- cancel sát giờ
- no-show
- dispute
- incident
- hoàn thành tốt

### 8.3 Hệ quả trust
- giảm visibility
- giảm eligibility
- suspend nếu lặp

---

## CHAPTER 9 – PAYMENT CONFIRMATION (KHÔNG ESCROW)

### 9.1 Lunavia không giữ tiền
- operator trả guide ngoài hệ thống

### 9.2 Nhưng Lunavia BẮT BUỘC:
- request payment
- operator xác nhận
- guide xác nhận đã nhận

### 9.3 Chưa close payment
→ guide không nhận tour mới

---

## CHAPTER 10 – INCIDENT & DISPUTE

### 10.1 Incident
- báo trong tour
- log lại
- không tự xử tiền

### 10.2 Cancel request
- guide có thể request
- operator quyết
- hệ thống ghi nhận trust

---

## CHAPTER 11 – PLAN & POLICY

### 11.1 Plan
- **FREE**
- **PRO**
- **PREMIUM**

### 11.2 Unlock
- SOS
- priority
- export
- advanced visibility

### 11.3 Policy Engine
- soft-gate UI
- không hard-block logic giai đoạn đầu

---

## CHAPTER 12 – NOTIFICATION & COMMUNICATION
- in-app là chính
- email là reminder
- trust change phải notify

---

## CHAPTER 13 – WHAT WE INTENTIONALLY DO NOT BUILD

🚫 **Không:**
- auto assign
- escrow (trước giấy phép)
- rating 5 sao
- marketplace vô kiểm soát
- AI decision thay con người

---

## CHAPTER 14 – PHASE 14 DECISIONS (LOCKED)

The following decisions are **permanently locked** and cannot be reversed without explicit founder approval:

| Decision | Status |
|----------|--------|
| Role selection moved to signup | ✅ LOCKED |
| Auth is database-backed | ✅ LOCKED |
| Role-based middleware simplified | ✅ LOCKED |
| Verification is advisory, not regulatory | ✅ LOCKED |
| Identity is immutable | ✅ LOCKED |
| UNASSIGNED role removed | ✅ LOCKED |
| /select-role flow removed | ✅ LOCKED |

---

## CHAPTER 15 – DEVELOPMENT RULES (CHO AI & DEV)

1. **ServiceRequest là trung tâm**
2. **Không thêm feature nếu:**
   - không gắn ServiceRequest
   - không ảnh hưởng trust / availability
3. **Không simplify role**
4. **Không hardcode policy**
5. **Không phá audit trail**
6. **Không thêm role mới** (Phase 14 locked)
7. **Không cho phép role switching**

---

## TRẠNG THÁI HIỆN TẠI (2026-02-04)

| Component | Status |
|-----------|--------|
| Architecture | ✅ |
| Trust / Notification | ✅ |
| Observer / Referral | ⚠️ (defer) |
| ServiceRequest | ✅ (Phase 13) |
| Identity & Role System | ✅ (Phase 14) |
| KYC/KYB Foundation | ✅ (Phase 14) |

---

## CHANGELOG

### v1.1 – 2026-02-04
- Locked role system to `TOUR_OPERATOR` / `TOUR_GUIDE`
- Removed post-login role selection (`/select-role`)
- Removed `UNASSIGNED` role permanently
- Introduced KYC/KYB foundation
- Clarified operator vs guide semantics (metadata-based distinctions)
- Added Phase 14 locked decisions
- Constitution aligned with Phase 14 implementation
- Updated development rules for role immutability

### v1.0 – 2026-02-03
- Initial constitution documenting Phases 1–12
- Defined ServiceRequest lifecycle
- Established Trust system principles
- Documented Standby & SOS monetization
