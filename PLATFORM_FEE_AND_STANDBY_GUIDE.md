# Platform Fee & Standby Request Guide

## Tổng quan

Tài liệu này mô tả hệ thống Platform Fee và Standby Request đã được triển khai.

## 1. Platform Fee Structure

### Fee Rates

- **Freelance Guides (5%):**
  - Platform fee: 5% của payment amount
  - Fee được trừ từ số tiền guide nhận
  - Ví dụ: Operator trả 1,000,000 VND → Guide nhận 950,000 VND, Platform fee: 50,000 VND

- **In-house Guides (1% hoặc 0%):**
  - **Chưa xác minh hợp đồng:** 1% platform fee
    - Fee được charge từ operator (operator trả amount + fee)
    - Guide nhận full amount
  - **Đã xác minh hợp đồng:** 0% platform fee
    - Operator chỉ trả amount, không có fee
    - Guide nhận full amount

### Employment Contract Requirement

Để được 0% fee cho in-house guides:
1. Guide phải là in-house member của company
2. Company phải upload employment contract
3. Admin phải verify contract (`contractVerified = true`)
4. Sau khi verify, tất cả payments cho guide đó sẽ có 0% fee

### Implementation

- `PlatformFeeService.calculateFee()` - Tính platform fee tự động
- `WalletService.transfer()` - Đã được update để tính fee
- Payment model đã có fields: `platformFee`, `netAmount`, `isFreelance`, `employmentContractUrl`

## 2. Standby Request

### Model Structure

`StandbyRequest` model đã có trong schema:
- `operatorId` - Operator tạo request
- `title`, `city`, `requiredDate` - Thông tin standby
- `budget` - Tổng budget
- `standbyFee` - Phí standby service (optional, charge thêm cho operator)
- `mainGuideId`, `subGuideId` - Guides được assign
- `status` - PENDING, ACCEPTED, REJECTED, COMPLETED

### Business Logic

**Standby Request là gì?**
- Tour operator có thể tạo standby request khi cần guide sẵn sàng trong trường hợp khẩn cấp
- Guide có thể accept/reject standby request
- Nếu accept, guide sẽ được trả `standbyFee` (nếu có) + payment khi tour thực sự diễn ra
- Standby fee là phí riêng, không liên quan đến platform fee

**Fee Structure cho Standby:**
- Standby fee: Charge từ operator (optional, có thể không có)
- Payment khi tour diễn ra: Áp dụng platform fee như bình thường

### Status Flow

1. **PENDING** - Operator tạo request, chờ guide accept
2. **ACCEPTED** - Guide đã accept, sẵn sàng standby
3. **REJECTED** - Guide từ chối
4. **COMPLETED** - Tour đã hoàn thành, payment đã được xử lý

## 3. Availability Management

### Current Implementation

- `GuideAvailability` model - Lưu availability theo ngày
- `AvailabilityService` - Service để check và update availability
- `Profile.availabilityStatus` - AVAILABLE, BUSY, ON_TOUR

### Guide có thể:
- Set availability status (AVAILABLE, BUSY, ON_TOUR)
- System tự động set ON_TOUR khi application/assignment được accept
- System check conflict khi guide apply tour

### Cần bổ sung:
- UI để guide quản lý availability calendar
- API để guide set availability slots

## 4. Implementation Status

### ✅ Đã hoàn thành:

1. **Platform Fee System:**
   - ✅ `PlatformFeeService` với logic tính fee
   - ✅ Payment model với fee fields
   - ✅ `WalletService.transfer()` đã tính fee tự động
   - ✅ `PayGuideForTourUseCase` đã check balance bao gồm fee

2. **Schema Updates:**
   - ✅ Payment model: `platformFee`, `netAmount`, `isFreelance`, `employmentContractUrl`, `standbyRequestId`
   - ✅ CompanyMember: `employmentContractUrl`, `contractVerified`, `contractVerifiedBy`, `contractVerifiedAt`
   - ✅ StandbyRequest: `standbyFee`, `acceptedAt`, `rejectedAt`, `completedAt`, `payments` relation

### ⏳ Cần implement:

1. **Standby Request APIs:**
   - [ ] `POST /api/standby-requests` - Operator tạo standby request
   - [ ] `GET /api/standby-requests` - List standby requests (operator/guide)
   - [ ] `POST /api/standby-requests/[id]/accept` - Guide accept
   - [ ] `POST /api/standby-requests/[id]/reject` - Guide reject
   - [ ] `POST /api/standby-requests/[id]/complete` - Mark completed

2. **Standby Request UI:**
   - [ ] Operator: Tạo standby request form
   - [ ] Guide: List và accept/reject standby requests
   - [ ] Display standby fee và payment breakdown

3. **Availability Management UI:**
   - [ ] Guide: Calendar view để set availability
   - [ ] Guide: Quick status toggle (AVAILABLE/BUSY)
   - [ ] API: `PUT /api/guides/availability` - Update availability

4. **Employment Contract Verification:**
   - [ ] Company member: Upload contract khi join
   - [ ] Admin: Verify contract UI
   - [ ] API: `PUT /api/admin/companies/[id]/members/[guideId]/verify-contract`

5. **Platform Fee Display:**
   - [ ] Payment breakdown trong UI
   - [ ] Show fee details khi operator pay guide
   - [ ] Transaction history hiển thị fee

## 5. Fee Calculation Examples

### Example 1: Freelance Guide
- Payment amount: 1,000,000 VND
- Platform fee: 50,000 VND (5%)
- Guide receives: 950,000 VND
- Operator pays: 1,000,000 VND

### Example 2: In-house Guide (Contract NOT verified)
- Payment amount: 1,000,000 VND
- Platform fee: 10,000 VND (1%)
- Guide receives: 1,000,000 VND (full amount)
- Operator pays: 1,010,000 VND (amount + fee)

### Example 3: In-house Guide (Contract verified)
- Payment amount: 1,000,000 VND
- Platform fee: 0 VND (0%)
- Guide receives: 1,000,000 VND (full amount)
- Operator pays: 1,000,000 VND (no fee)

## 6. Recommendations

### Platform Fee 5% cho Freelance
✅ **Hợp lý** - Tương đương với các platform khác (Upwork: 10-20%, Fiverr: 20%, etc.)
- 5% là competitive và fair cho cả operator và guide
- Đủ để cover platform costs và generate revenue

### In-house Fee Structure
✅ **Hợp lý** - Charge ít hơn hoặc 0% khi có contract
- Khuyến khích operators sử dụng in-house guides với contract
- Giảm risk của platform (có contract = legal protection)
- Vẫn có revenue từ in-house (1% nếu chưa verify)

### Employment Contract Requirement
✅ **Cần thiết** - Tránh lách luật
- Yêu cầu upload contract khi guide join company
- Admin verify contract trước khi approve
- Chỉ guide với verified contract mới được 0% fee
- Contract URL được lưu trong CompanyMember và Payment records

## 7. Next Steps

1. **Tạo migration** cho schema changes
2. **Implement Standby Request APIs**
3. **Implement Availability Management UI**
4. **Implement Contract Verification UI**
5. **Update Payment UI** để hiển thị fee breakdown

