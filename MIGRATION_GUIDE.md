# Migration Guide - Tổng hợp các Migration cần chạy

## Tổng quan

File này tổng hợp tất cả các migration cần chạy sau khi triển khai các tính năng mới.

## Các Migration cần chạy

### 1. UserSettings Model (Phase 1, 2, 3)
**Mô tả:** Thêm model UserSettings với các fields cho Account Settings, Notifications, Privacy, Tour Preferences, Guide Preferences, và Payment Preferences.

**Thay đổi:**
- Thêm model `UserSettings` với relation đến `User`
- Thêm relation `userSettings` vào model `User`

**Lệnh:**
```bash
npx prisma migrate dev --name add_user_settings
```

### 2. Company Unique Constraints
**Mô tả:** Thêm unique constraints cho Company để tránh trùng lặp thông tin (email, businessLicenseNumber, travelLicenseNumber).

**Thay đổi:**
- Thêm `@unique` cho `email` trong model `Company`
- Thêm `@unique` cho `businessLicenseNumber` trong model `Company`
- Thêm `@unique` cho `travelLicenseNumber` trong model `Company`

**Lệnh:**
```bash
npx prisma migrate dev --name add_company_unique_constraints
```

### 3. User Block Fields
**Mô tả:** Thêm các fields để admin có thể block/unblock user nếu vi phạm quy định.

**Thay đổi:**
- Thêm enum `UserBlockReason` với 10 lý do block
- Thêm các fields vào model `User`:
  - `isBlocked` (Boolean, default: false)
  - `blockedBy`, `blockedAt`
  - `blockReason` (UserBlockReason)
  - `blockNotes` (Text)
  - `unblockedBy`, `unblockedAt`

**Lệnh:**
```bash
npm run migrate:user-block
# hoặc
powershell -ExecutionPolicy Bypass -File scripts/apply-user-block-migration.ps1
```

**Lưu ý:** Migration này cần chạy bằng script thủ công vì shadow database có thể không có table `users`.

## Script tự động chạy tất cả migrations

Đã tạo sẵn scripts trong thư mục `scripts/`:
- `scripts/run-migrations.ps1` - Cho Windows PowerShell
- `scripts/run-migrations.sh` - Cho Linux/Mac Bash

Các scripts này sẽ tự động:
1. Chạy migration 1 (UserSettings)
2. Chạy migration 2 (Company Unique Constraints)
3. Generate Prisma Client
4. Hiển thị migration status

## Chạy migrations

### ⚡ Cách 1: Chạy script tự động (KHUYẾN NGHỊ)

**Sử dụng npm script (dễ nhất):**
```bash
npm run migrate:all
```

**Hoặc chạy trực tiếp script:**

**Windows:**
```powershell
.\scripts\run-migrations.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

### Cách 2: Chạy từng migration riêng lẻ

**Migration 1 - UserSettings:**
```bash
npm run migrate:settings
# hoặc
npx prisma migrate dev --name add_user_settings
```

**Migration 2 - Company Unique Constraints:**
```bash
npm run migrate:company
# hoặc
npx prisma migrate dev --name add_company_unique_constraints
```

**Migration 3 - User Block Fields:**
```bash
npm run migrate:user-block
# hoặc
powershell -ExecutionPolicy Bypass -File scripts/apply-user-block-migration.ps1
```

**Sau khi chạy migration 3, cần generate Prisma Client:**
```bash
npx prisma generate
```

### Cách 3: Chạy tất cả migrations một lần (nếu chưa có database)
```bash
npx prisma migrate dev
```

## Lưu ý quan trọng

### ⚠️ Trước khi chạy migration:

1. **Backup database:**
   ```bash
   # PostgreSQL
   pg_dump -U username -d database_name > backup.sql
   ```

2. **Áp dụng SQL migration thủ công (nếu có dữ liệu sẵn):**
   ```bash
   # Nếu migration đã được mark nhưng SQL chưa chạy
   psql -U username -d database_name -f scripts/apply-migration.sql
   ```

3. **Kiểm tra dữ liệu duplicate:**
   - Nếu đã có dữ liệu trong database, cần kiểm tra xem có duplicate `businessLicenseNumber`, `travelLicenseNumber`, hoặc `email` trong bảng `companies` không
   - Nếu có, cần xử lý trước khi chạy migration

4. **Kiểm tra schema hiện tại:**
   ```bash
   npx prisma migrate status
   ```

### ⚠️ Sau khi chạy migration:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Kiểm tra migration status:**
   ```bash
   npx prisma migrate status
   ```

3. **Reset database (chỉ trong development):**
   ```bash
   npx prisma migrate reset
   ```

## Xử lý lỗi

### Lỗi: Unique constraint violation
**Nguyên nhân:** Đã có dữ liệu duplicate trong database.

**Giải pháp:**
1. Kiểm tra dữ liệu duplicate:
   ```sql
   SELECT businessLicenseNumber, COUNT(*) 
   FROM companies 
   WHERE businessLicenseNumber IS NOT NULL 
   GROUP BY businessLicenseNumber 
   HAVING COUNT(*) > 1;
   ```

2. Xử lý duplicate (xóa hoặc cập nhật):
   ```sql
   -- Ví dụ: Xóa các record duplicate, giữ lại record đầu tiên
   DELETE FROM companies 
   WHERE id NOT IN (
     SELECT MIN(id) 
     FROM companies 
     GROUP BY businessLicenseNumber
   );
   ```

3. Chạy lại migration

### Lỗi: Migration already applied
**Nguyên nhân:** Migration đã được chạy trước đó.

**Giải pháp:**
- Bỏ qua migration đó hoặc
- Reset database (chỉ trong development):
  ```bash
  npx prisma migrate reset
  ```

## Production Deployment

Khi deploy lên production:

1. **Chạy migration trong production:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Không dùng `migrate dev` trong production** - chỉ dùng `migrate deploy`

3. **Backup trước khi deploy:**
   ```bash
   # Backup database
   pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

## Tóm tắt

### Danh sách migrations:
1. ✅ **add_user_settings** - Thêm UserSettings model
2. ✅ **add_company_unique_constraints** - Thêm unique constraints cho Company
3. ✅ **add_user_block_fields** - Thêm fields để block/unblock user

### Cách chạy nhanh nhất:
```bash
npm run migrate:all
```

### Checklist trước khi chạy:
- [ ] Backup database
- [ ] Kiểm tra duplicate data (dùng `scripts/check-duplicate-companies.sql`)
- [ ] Xử lý duplicate nếu có (dùng `scripts/fix-duplicate-companies.sql`)
- [ ] Chạy migration script

### Files hỗ trợ:
- `MIGRATION_GUIDE.md` - Hướng dẫn chi tiết (file này)
- `scripts/run-migrations.ps1` - Script tự động (Windows)
- `scripts/run-migrations.sh` - Script tự động (Linux/Mac)
- `scripts/check-duplicate-companies.sql` - Kiểm tra duplicate
- `scripts/fix-duplicate-companies.sql` - Xử lý duplicate

### Lưu ý:
- Chạy migrations theo thứ tự
- Backup database trước khi chạy
- Kiểm tra duplicate data trước khi chạy migration 2
- Nếu có lỗi, xem phần "Xử lý lỗi" ở trên

