# 🔧 Fix NextAuth Error - /api/auth/error

## Nguyên nhân thường gặp

Lỗi `/api/auth/error` thường do:

1. **Thiếu NEXTAUTH_SECRET** - NextAuth cần secret để sign JWT tokens
2. **NEXTAUTH_URL sai** - URL không khớp với domain thực tế
3. **Database connection error** - Lỗi khi query database trong authorize function
4. **Syntax error trong auth-config.ts** - Lỗi cú pháp

## ✅ Checklist Kiểm Tra

### 1. Environment Variables trên Vercel

Vào Vercel Dashboard → Settings → Environment Variables

**Đảm bảo có:**
```env
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://lunavia.vn
DATABASE_URL=postgresql://...
```

**Cách tạo NEXTAUTH_SECRET:**
```bash
# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac:
openssl rand -base64 32
```

**⚠️ QUAN TRỌNG:**
- `NEXTAUTH_URL` phải là `https://lunavia.vn` (không có trailing slash `/`)
- `NEXTAUTH_SECRET` phải có ít nhất 32 ký tự
- Sau khi thêm/sửa environment variables, cần **Redeploy** trên Vercel

### 2. Kiểm tra Database Connection

Lỗi có thể xảy ra nếu database connection fail trong `authorize` function.

**Test:**
- Vào Neon Dashboard → SQL Editor
- Chạy: `SELECT COUNT(*) FROM "users";`
- Nếu có lỗi → Database connection issue

### 3. Check Vercel Logs

1. Vào Vercel Dashboard → Deployments
2. Click vào deployment mới nhất
3. Click **"View Function Logs"**
4. Tìm lỗi cụ thể:
   - `NEXTAUTH_SECRET is missing`
   - `Database connection error`
   - `Prisma error`

## 🔧 Fix đã áp dụng

1. ✅ Thêm error handling trong `authorize` function
2. ✅ Thêm `debug: true` cho development
3. ✅ Wrap database queries trong try-catch

## 📝 Next Steps

1. **Kiểm tra Environment Variables trên Vercel**
   - Đảm bảo có `NEXTAUTH_SECRET` và `NEXTAUTH_URL`

2. **Redeploy trên Vercel**
   - Sau khi thêm/sửa environment variables
   - Vào Deployments → Click "Redeploy"

3. **Test lại login**
   - Vào https://lunavia.vn/auth/signin
   - Thử login với test account

4. **Check Logs nếu vẫn lỗi**
   - Xem Vercel Function Logs để tìm lỗi cụ thể







