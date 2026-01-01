# 🔧 Vercel Troubleshooting Guide - Server Error

## Lỗi: "Application error: a server-side exception has occurred"

### 🔍 Triệu chứng thường gặp:
- ✅ `/auth/signin` → vào được
- ✅ `/auth/register` → vào được  
- ❌ `/` (homepage) → Application error (server-side exception)

**Nguyên nhân:** Homepage gọi `getServerSession()` cần database connection. Nếu database chưa có migrations hoặc connection không thành công → lỗi.

**Đã fix:** Homepage giờ có error handling, sẽ hiển thị public page ngay cả khi database chưa sẵn sàng.

**Nhưng vẫn cần:** Chạy database migrations để app hoạt động đầy đủ.

### ✅ Checklist Kiểm Tra

#### 1. Environment Variables (QUAN TRỌNG NHẤT)

Vào Vercel Dashboard → Project → Settings → Environment Variables

**BẮT BUỘC phải có:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://lunavia.vn
```

**Cách tạo NEXTAUTH_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 2. Database Connection

**Kiểm tra:**
- Database có đang chạy không?
- DATABASE_URL có đúng format không?
- Database có tồn tại không?
- User có quyền truy cập không?

**Test connection:**
```bash
# Từ local, test với production DATABASE_URL
psql "postgresql://user:password@host:5432/database"
```

#### 3. Database Migrations

**QUAN TRỌNG:** Database production phải có schema!

**Cách chạy migrations trên production:**

**Option A: Từ local (khuyến nghị)**
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

**Option B: Từ Vercel (dùng Vercel CLI)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration command
vercel env pull .env.production
npx prisma migrate deploy
```

**Option C: Từ database provider (Supabase/Neon/etc)**
- Vào dashboard của database provider
- Chạy SQL migrations thủ công

#### 4. Prisma Client Generation

Đã fix trong `package.json`:
- `postinstall`: `prisma generate` ✅
- `build`: `prisma generate && next build` ✅

Nhưng cần đảm bảo:
- `prisma` package có trong `devDependencies` ✅
- `@prisma/client` có trong `dependencies` ✅

#### 5. Check Vercel Logs

Vào Vercel Dashboard → Project → Deployments → Click vào deployment → View Function Logs

Tìm lỗi cụ thể:
- Database connection error?
- Missing environment variable?
- Prisma error?

#### 6. Common Issues

**Issue 1: Database chưa có migrations**
```
Error: Table "users" does not exist
```
**Fix:** Chạy `prisma migrate deploy` trên production database

**Issue 2: DATABASE_URL sai format**
```
Error: Invalid connection string
```
**Fix:** Kiểm tra format: `postgresql://user:password@host:port/database`

**Issue 3: NEXTAUTH_SECRET thiếu**
```
Error: Missing NEXTAUTH_SECRET
```
**Fix:** Thêm vào Vercel Environment Variables

**Issue 4: NEXTAUTH_URL sai**
```
Error: Invalid NEXTAUTH_URL
```
**Fix:** Set `NEXTAUTH_URL=https://lunavia.vn` (không có trailing slash)

---

## 🚀 Quick Fix Steps

### Bước 1: Kiểm tra Environment Variables trên Vercel

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project **lunavia**
3. Vào **Settings** → **Environment Variables**
4. **Đảm bảo có các biến sau:**

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://lunavia.vn
```

**⚠️ QUAN TRỌNG:**
- `NEXTAUTH_URL` phải là `https://lunavia.vn` (không có trailing slash `/`)
- `DATABASE_URL` phải là connection string đầy đủ
- `NEXTAUTH_SECRET` phải có ít nhất 32 ký tự

### Bước 2: Chạy Database Migrations trên Production

**Option A: Từ Local (Khuyến nghị)**

```bash
# 1. Lấy DATABASE_URL từ Vercel
# Vào Vercel Dashboard → Settings → Environment Variables → Copy DATABASE_URL

# 2. Set environment variable
# Windows PowerShell:
$env:DATABASE_URL="postgresql://user:password@host:5432/database"

# Linux/Mac:
export DATABASE_URL="postgresql://user:password@host:5432/database"

# 3. Chạy migrations
npm run db:migrate:deploy
```

**Option B: Từ Vercel CLI**

```bash
# 1. Install Vercel CLI (nếu chưa có)
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Pull environment variables
vercel env pull .env.production

# 5. Chạy migrations
npm run db:migrate:deploy
```

**Option C: Từ Database Provider Dashboard**

Nếu dùng Supabase/Neon/AWS RDS:
1. Vào database dashboard
2. Mở SQL Editor
3. Copy nội dung từ `prisma/migrations/*/migration.sql`
4. Chạy từng migration theo thứ tự

### Bước 3: Kiểm tra Database Connection

```bash
# Test connection (từ local)
psql "postgresql://user:password@host:5432/database"

# Hoặc dùng Prisma Studio
npm run db:studio
```

### Bước 4: Redeploy trên Vercel

1. Vào Vercel Dashboard → **Deployments**
2. Click **"Redeploy"** hoặc push code mới:
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

### Bước 5: Check Logs

1. Vào Vercel Dashboard → **Deployments**
2. Click vào deployment mới nhất
3. Click **"View Function Logs"**
4. Tìm lỗi cụ thể:
   - `Table "users" does not exist` → Chưa chạy migrations
   - `Invalid connection string` → DATABASE_URL sai
   - `Missing NEXTAUTH_SECRET` → Thiếu environment variable

---

## 📝 Next Steps

Sau khi fix, kiểm tra:
- [ ] Homepage load được
- [ ] Login page load được
- [ ] Có thể login
- [ ] Database queries hoạt động

