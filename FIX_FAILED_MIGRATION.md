# 🔧 Fix Failed Migration - P3009 Error

## Vấn đề

Migration `20250115000003_add_user_block_fields` đã fail. Prisma không cho phép chạy migrations mới khi có migration fail.

## Giải pháp

Có 2 cách:

### Cách 1: Mark Migration as Rolled Back (Khuyến nghị)

Nếu migration chưa apply thành công (tables/columns chưa được tạo):

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20250115000003_add_user_block_fields
```

Sau đó chạy lại migrations:

```bash
npm run db:migrate:deploy
```

### Cách 2: Fix Migration Manually

Nếu migration đã apply một phần (ví dụ: enum đã tạo nhưng columns chưa):

1. **Kiểm tra database state:**
   - Vào Neon Dashboard → SQL Editor
   - Chạy: `SELECT * FROM "_prisma_migrations" WHERE migration_name = '20250115000003_add_user_block_fields';`
   - Xem status

2. **Nếu migration đã apply một phần:**
   - Vào Neon Dashboard → SQL Editor
   - Chạy SQL thủ công để hoàn thành migration:
   ```sql
   -- Kiểm tra xem enum đã có chưa
   SELECT typname FROM pg_type WHERE typname = 'UserBlockReason';
   
   -- Nếu chưa có, tạo enum
   CREATE TYPE "UserBlockReason" AS ENUM ('FRAUD', 'POLICY_VIOLATION', 'INAPPROPRIATE_BEHAVIOR', 'SPAM', 'FALSE_INFORMATION', 'UNAUTHORIZED_ACTIVITY', 'LEGAL_VIOLATION', 'UNETHICAL_BEHAVIOR', 'SAFETY_CONCERN', 'OTHER');
   
   -- Kiểm tra xem columns đã có chưa
   SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('isBlocked', 'blockedBy', 'blockedAt', 'blockReason', 'blockNotes', 'unblockedBy', 'unblockedAt');
   
   -- Nếu chưa có, thêm columns
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blockedBy" TEXT;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blockedAt" TIMESTAMP(3);
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blockReason" "UserBlockReason";
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "blockNotes" TEXT;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "unblockedBy" TEXT;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "unblockedAt" TIMESTAMP(3);
   ```

3. **Mark migration as applied:**
   ```bash
   npx prisma migrate resolve --applied 20250115000003_add_user_block_fields
   ```

4. **Chạy tiếp migrations:**
   ```bash
   npm run db:migrate:deploy
   ```

### Cách 3: Reset Database (Chỉ dùng nếu database mới, chưa có data)

⚠️ **CẢNH BÁO:** Chỉ dùng nếu database mới, chưa có data quan trọng!

```bash
# Reset database (xóa tất cả data!)
npx prisma migrate reset

# Sau đó chạy lại migrations
npm run db:migrate:deploy
```

---

## Quick Fix (Thử cách này trước)

```bash
# 1. Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20250115000003_add_user_block_fields

# 2. Chạy lại migrations
npm run db:migrate:deploy
```

Nếu vẫn lỗi, thử cách 2 (fix manually).

