# 🔧 Error Handling Guide - User-Friendly Messages

## Tổng quan

Đã tạo hệ thống xử lý lỗi tập trung để chuyển đổi các thông báo lỗi kỹ thuật (Prisma, database, etc.) thành thông báo thân thiện với người dùng bằng tiếng Việt.

## Files đã tạo

### 1. `src/lib/error-messages.ts`
Utility functions để parse và chuyển đổi error messages:
- `getUserFriendlyError()` - Chuyển đổi error thành message thân thiện
- `validateTourData()` - Validate tour data và trả về errors
- Field label mapping - Map field names sang tiếng Việt

### 2. `src/lib/api-error-handler.ts`
Centralized API error handler:
- `handleApiError()` - Xử lý API errors
- `apiCall()` - Wrapper cho API calls với error handling

## Cách sử dụng

### Trong API Routes

```typescript
import { getUserFriendlyError } from "@/lib/error-messages";

try {
  // ... API logic
} catch (error: any) {
  console.error("Error:", error);
  const userFriendlyError = getUserFriendlyError(error);
  return NextResponse.json(
    { error: userFriendlyError },
    { status: 500 }
  );
}
```

### Trong Frontend Components

```typescript
import { getUserFriendlyError } from "@/lib/error-messages";

try {
  // ... API call
} catch (error: any) {
  const userFriendlyError = getUserFriendlyError(error);
  toast.error(userFriendlyError);
}
```

### Validation trước khi submit

```typescript
import { validateTourData } from "@/lib/error-messages";

const validation = validateTourData(formData);
if (!validation.isValid) {
  validation.errors.forEach((error) => toast.error(error));
  return;
}
```

## Error Types được xử lý

### 1. Prisma Errors
- Invalid Date → "Vui lòng nhập ngày hợp lệ"
- Required fields → "Vui lòng điền thông tin: [field name]"
- Type mismatches → "Thông tin [field] không đúng định dạng"
- Unique constraints → "Email này đã được sử dụng"
- Foreign key errors → "Thông tin không hợp lệ"

### 2. Date Validation
- Invalid startDate → "Vui lòng nhập ngày bắt đầu tour hợp lệ"
- Invalid endDate → "Vui lòng nhập ngày kết thúc tour hợp lệ"
- End date before start → "Ngày kết thúc phải sau ngày bắt đầu"

### 3. Required Fields
- Missing title → "Vui lòng nhập tiêu đề tour"
- Missing description → "Vui lòng nhập mô tả tour"
- Missing city → "Vui lòng chọn thành phố"
- Invalid pax → "Vui lòng nhập số lượng khách hợp lệ"

### 4. Network Errors
- Fetch errors → "Lỗi kết nối. Vui lòng kiểm tra kết nối internet"

## Field Labels (Tiếng Việt)

Đã map các field names sang labels tiếng Việt:
- `title` → "Tiêu đề tour"
- `description` → "Mô tả tour"
- `city` → "Thành phố"
- `startDate` → "Ngày bắt đầu"
- `endDate` → "Ngày kết thúc"
- `pax` → "Số lượng khách"
- `priceMain` → "Giá HDV chính"
- `priceSub` → "Giá HDV phụ"
- ... và nhiều hơn

## Validation Rules

### Tour Creation
- ✅ Title: Required, không được rỗng
- ✅ Description: Required, không được rỗng
- ✅ City: Required
- ✅ Start Date: Required, phải là valid date
- ✅ End Date: Optional, nếu có phải sau start date
- ✅ Pax: Required, phải > 0
- ✅ Prices: Optional, nếu có không được âm

## Best Practices

1. **Validate ở Frontend trước**: Giúp user biết lỗi ngay lập tức
2. **Validate ở Backend**: Đảm bảo data integrity
3. **User-friendly messages**: Luôn hiển thị message dễ hiểu
4. **Log technical errors**: Console.error cho debugging
5. **Consistent format**: Sử dụng utility functions thống nhất

## Ví dụ

### Trước (Technical Error):
```
Invalid `prisma.tour.create()` invocation:
Invalid value for argument `startDate`: Provided Date object is invalid.
```

### Sau (User-Friendly):
```
Vui lòng nhập ngày bắt đầu tour hợp lệ (định dạng: DD/MM/YYYY)
```

## Đã cập nhật

- ✅ `src/app/api/tours/route.ts` - Validation và error handling
- ✅ `src/app/tours/create/page.tsx` - Frontend validation và error messages

## Cần cập nhật thêm (Optional)

Có thể áp dụng pattern này cho các API routes khác:
- `/api/tours/[id]/route.ts` (PUT)
- `/api/wallet/topup/route.ts`
- `/api/verifications/kyb/route.ts`
- `/api/verifications/kyc/route.ts`
- ... và các routes khác






