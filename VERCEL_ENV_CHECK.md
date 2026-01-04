# 🔍 Vercel Environment Variables Check

## ❌ VẤN ĐỀ: `NO_SECRET` Error

Lỗi `NO_SECRET` xảy ra khi NextAuth không tìm thấy `NEXTAUTH_SECRET` trong production.

---

## ✅ CÁCH KIỂM TRA

### 1. Kiểm tra trong Vercel Dashboard

1. Vào **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. Tìm `NEXTAUTH_SECRET`:
   - ✅ **Có** → Kiểm tra giá trị (phải ≥ 32 ký tự)
   - ❌ **Không có** → Cần thêm ngay

### 2. Kiểm tra qua API Debug

Truy cập: `https://lunavia.vn/api/debug/env`

Kết quả mong đợi:
```json
{
  "hasNextAuthSecret": true,
  "nextAuthSecretLength": 32,  // hoặc lớn hơn
  "hasDatabaseUrl": true,
  "databaseUrlLength": 100,    // hoặc lớn hơn
  "nodeEnv": "production"
}
```

**Nếu `hasNextAuthSecret: false`** → `NEXTAUTH_SECRET` chưa được set!

---

## 🔧 CÁCH SỬA

### Bước 1: Tạo NEXTAUTH_SECRET (nếu chưa có)

```bash
# Tạo secret ngẫu nhiên (32+ ký tự)
openssl rand -base64 32

# Hoặc dùng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Bước 2: Thêm vào Vercel

1. Vào **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Nhập:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: (paste secret vừa tạo)
   - **Environment**: Chọn **Production**, **Preview**, và **Development**
4. Click **Save**

### Bước 3: Redeploy

Sau khi thêm env var:
- Vercel sẽ tự động trigger redeploy
- Hoặc vào **Deployments** → Click **Redeploy** trên deployment mới nhất

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **NEXTAUTH_SECRET phải ≥ 32 ký tự**
   - Nếu ngắn hơn → NextAuth sẽ reject

2. **Phải set cho tất cả environments**
   - Production ✅
   - Preview ✅
   - Development ✅

3. **Sau khi thêm env var, PHẢI redeploy**
   - Env vars chỉ apply khi deploy mới
   - Không apply cho deployments cũ

4. **Không commit secret vào Git**
   - Secret chỉ set trong Vercel Dashboard
   - Không thêm vào `.env.local` rồi commit

---

## 🧪 TEST SAU KHI SỬA

1. **Check debug endpoint:**
   ```
   https://lunavia.vn/api/debug/env
   ```
   → `hasNextAuthSecret: true`

2. **Test session endpoint:**
   ```
   https://lunavia.vn/api/auth/session
   ```
   → Không còn lỗi `NO_SECRET`

3. **Test homepage:**
   ```
   https://lunavia.vn
   ```
   → Không còn server error

---

## 📋 CHECKLIST

- [ ] `NEXTAUTH_SECRET` có trong Vercel Environment Variables
- [ ] Secret có độ dài ≥ 32 ký tự
- [ ] Set cho Production, Preview, Development
- [ ] Đã redeploy sau khi thêm env var
- [ ] `/api/debug/env` trả về `hasNextAuthSecret: true`
- [ ] `/api/auth/session` không còn lỗi `NO_SECRET`
- [ ] Homepage load được bình thường

---

## 🆘 NẾU VẪN LỖI

1. **Kiểm tra logs trong Vercel:**
   - Vào **Deployments** → Click vào deployment mới nhất
   - Xem **Logs** tab
   - Tìm dòng `[AUTH-CONFIG]` để xem secret có được load không

2. **Kiểm tra build logs:**
   - Xem **Build Logs** trong deployment
   - Tìm lỗi liên quan đến `NEXTAUTH_SECRET`

3. **Clear cache và redeploy:**
   - Vào **Settings** → **General**
   - Click **Clear Build Cache**
   - Redeploy lại

---

**Nếu vẫn không được, hãy check logs và gửi cho tôi!** 🔍

