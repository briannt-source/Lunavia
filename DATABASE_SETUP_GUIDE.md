# 🗄️ LUNAVIA - Database Setup Guide

## Tình huống: Không tìm thấy DATABASE_URL trong Vercel

Có 2 khả năng:
1. **Chưa setup database** → Cần tạo database mới
2. **Đã có database nhưng chưa thêm vào Vercel** → Cần thêm DATABASE_URL vào Environment Variables

---

## 🔍 Cách 1: Kiểm tra xem đã có DATABASE_URL chưa

### Bước 1: Vào Vercel Dashboard

1. Mở https://vercel.com/dashboard
2. Chọn project **lunavia**
3. Click **Settings** (ở thanh menu trên)
4. Click **Environment Variables** (ở menu bên trái)

### Bước 2: Tìm DATABASE_URL

Trong danh sách Environment Variables, tìm:
- Key: `DATABASE_URL`
- Value: `postgresql://...` (sẽ bị ẩn, click để xem)

**Nếu KHÔNG có `DATABASE_URL`** → Tiếp tục với **Cách 2: Setup Database mới**

**Nếu CÓ `DATABASE_URL`** → Copy value và dùng để chạy migrations

---

## 🆕 Cách 2: Setup Database mới

Bạn có thể chọn một trong các options sau:

### Option A: Vercel Postgres (Khuyến nghị - Dễ nhất) ⭐

**Ưu điểm:**
- Tích hợp sẵn với Vercel
- Tự động thêm DATABASE_URL vào Environment Variables
- Free tier: 256 MB storage, 60 hours compute/month

**Cách setup:**

1. **Vào Vercel Dashboard**
   - https://vercel.com/dashboard
   - Chọn project **lunavia**

2. **Tạo Vercel Postgres**
   - Click tab **Storage**
   - Click **Create Database**
   - Chọn **Postgres**
   - Đặt tên: `lunavia-db` (hoặc tên bạn muốn)
   - Chọn region gần nhất (ví dụ: `Singapore` hoặc `Tokyo`)
   - Click **Create**

3. **Kết nối với Project**
   - Sau khi tạo xong, Vercel sẽ tự động:
     - Tạo DATABASE_URL
     - Thêm vào Environment Variables
     - Link với project

4. **Kiểm tra**
   - Vào **Settings** → **Environment Variables**
   - Tìm `POSTGRES_URL` hoặc `DATABASE_URL`
   - Copy value để dùng

**Lưu ý:** Vercel Postgres có thể tạo `POSTGRES_URL` thay vì `DATABASE_URL`. Nếu vậy, bạn cần:
- Thêm `DATABASE_URL` với cùng value
- Hoặc update code để dùng `POSTGRES_URL`

---

### Option B: Supabase (Free tier tốt) ⭐⭐

**Ưu điểm:**
- Free tier: 500 MB database, 2 GB bandwidth
- Có dashboard quản lý database
- Dễ setup và sử dụng

**Cách setup:**

1. **Tạo tài khoản Supabase**
   - Vào https://supabase.com
   - Sign up / Login

2. **Tạo Project mới**
   - Click **New Project**
   - Đặt tên: `lunavia`
   - Chọn organization
   - Đặt database password (lưu lại!)
   - Chọn region: `Southeast Asia (Singapore)` hoặc gần nhất
   - Click **Create new project**

3. **Lấy Connection String**
   - Sau khi project tạo xong, vào **Settings** → **Database**
   - Tìm section **Connection string**
   - Chọn **URI** tab
   - Copy connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
   - Thay `[YOUR-PASSWORD]` bằng password bạn đã đặt

4. **Thêm vào Vercel**
   - Vào Vercel Dashboard → Project → Settings → Environment Variables
   - Click **Add New**
   - Key: `DATABASE_URL`
   - Value: Paste connection string đã copy
   - Environment: Chọn **Production**, **Preview**, **Development** (hoặc tất cả)
   - Click **Save**

---

### Option C: Neon (Serverless PostgreSQL) ⭐⭐

**Ưu điểm:**
- Serverless, auto-scaling
- Free tier: 0.5 GB storage
- Có branch cho dev/staging/prod

**Cách setup:**

1. **Tạo tài khoản Neon**
   - Vào https://neon.tech
   - Sign up / Login

2. **Tạo Project**
   - Click **Create Project**
   - Đặt tên: `lunavia`
   - Chọn region: `Singapore` hoặc gần nhất
   - Click **Create Project**

3. **Lấy Connection String**
   - Sau khi tạo xong, vào **Dashboard**
   - Tìm **Connection Details**
   - Copy **Connection string** (format: `postgresql://user:password@host.neon.tech/dbname`)

4. **Thêm vào Vercel**
   - Vào Vercel Dashboard → Project → Settings → Environment Variables
   - Click **Add New**
   - Key: `DATABASE_URL`
   - Value: Paste connection string
   - Environment: Chọn tất cả
   - Click **Save**

---

### Option D: Railway (Dễ setup) ⭐

**Ưu điểm:**
- Free tier: $5 credit/month
- Dễ deploy và quản lý

**Cách setup:**

1. **Tạo tài khoản Railway**
   - Vào https://railway.app
   - Sign up với GitHub

2. **Tạo Database**
   - Click **New Project**
   - Click **+ New** → **Database** → **PostgreSQL**
   - Railway sẽ tự động tạo database

3. **Lấy Connection String**
   - Click vào database service
   - Vào tab **Variables**
   - Tìm `DATABASE_URL` hoặc `POSTGRES_URL`
   - Copy value

4. **Thêm vào Vercel**
   - Vào Vercel Dashboard → Project → Settings → Environment Variables
   - Click **Add New**
   - Key: `DATABASE_URL`
   - Value: Paste connection string
   - Click **Save**

---

## ✅ Sau khi có DATABASE_URL

### Bước 1: Verify DATABASE_URL trong Vercel

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Tìm `DATABASE_URL`
3. Click vào để xem value (sẽ bị ẩn, click để reveal)
4. Copy value

### Bước 2: Chạy Migrations

```bash
# Windows PowerShell:
$env:DATABASE_URL="postgresql://user:password@host:5432/database"
npm run db:migrate:deploy

# Linux/Mac:
export DATABASE_URL="postgresql://user:password@host:5432/database"
npm run db:migrate:deploy
```

**Lưu ý:** Thay `postgresql://user:password@host:5432/database` bằng connection string thật của bạn.

### Bước 3: Seed Data (Optional)

```bash
npm run db:seed
```

---

## 🔧 Troubleshooting

### Lỗi: "Connection refused" hoặc "Cannot connect to database"

**Nguyên nhân:**
- Database chưa được tạo
- Connection string sai
- Database không cho phép connection từ IP của bạn

**Giải pháp:**
1. Kiểm tra connection string format: `postgresql://user:password@host:port/database`
2. Với Supabase/Neon: Kiểm tra firewall settings, có thể cần whitelist IP
3. Test connection bằng psql hoặc Prisma Studio:
   ```bash
   # Test với psql
   psql "postgresql://user:password@host:5432/database"
   
   # Hoặc dùng Prisma Studio
   npm run db:studio
   ```

### Lỗi: "Database does not exist"

**Giải pháp:**
- Với Supabase/Neon: Database thường tự động tạo, nhưng có thể cần tạo thủ công
- Với Vercel Postgres: Database tự động tạo khi setup

### Lỗi: "Authentication failed"

**Nguyên nhân:**
- Password sai
- User không có quyền

**Giải pháp:**
- Kiểm tra lại password trong connection string
- Với Supabase: Reset password trong Settings → Database

---

## 📝 Quick Reference

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Ví dụ:**
```
postgresql://postgres:mypassword@db.abc123.supabase.co:5432/postgres
```

### Environment Variables cần có trong Vercel

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://lunavia.vn
```

---

## 🎯 Recommended Setup

**Cho production:**
1. **Vercel Postgres** - Nếu muốn đơn giản, tích hợp sẵn
2. **Supabase** - Nếu muốn free tier tốt, có dashboard
3. **Neon** - Nếu muốn serverless, auto-scaling

**Cho development:**
- Có thể dùng local PostgreSQL
- Hoặc dùng Supabase/Neon free tier

---

**Sau khi setup xong database, quay lại `NEXT_STEPS.md` để tiếp tục! 🚀**

