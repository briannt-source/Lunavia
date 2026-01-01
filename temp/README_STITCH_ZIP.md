# 📦 Xử Lý File ZIP Từ Stitch - Quick Guide

## ⚡ 5 Bước Nhanh

### 1️⃣ Giải nén ZIP
- Right-click → Extract All
- Xem cấu trúc file

### 2️⃣ Copy code
- Mở file `index.html` (hoặc file HTML chính)
- Copy toàn bộ code (Ctrl+A, Ctrl+C)

### 3️⃣ Paste vào file này
- Tạo file: `temp/stitch-input.html`
- Paste code vào

### 4️⃣ Dùng Cursor AI
- Mở file `temp/stitch-input.html` trong Cursor
- Select All (Ctrl+A)
- Mở Cursor AI (Ctrl+L)
- Paste prompt từ `STITCH_PROMPT_TEMPLATE.md`
- Nhấn Enter

### 5️⃣ Lưu component
- Copy code đã convert
- Tạo file: `src/components/stitch/your-component.tsx`
- Paste và test

---

## 📋 Prompt Mẫu

```
Tôi đã paste code HTML/CSS từ Google Stitch vào file temp/stitch-input.html. 
Hãy convert toàn bộ code này sang React component với:

1. TypeScript với proper types
2. Tailwind CSS thay CSS thuần
3. shadcn/ui components thay HTML elements
4. Convert attributes: onclick→onClick, class→className
5. Next.js 15 App Router compatible
6. Export component với tên phù hợp
7. Responsive design với Tailwind breakpoints

Convert toàn bộ code trong file temp/stitch-input.html.
```

---

## 🖼️ Xử Lý Images

1. Copy images từ `stitch-project/assets/images/` 
2. Paste vào `public/uploads/` hoặc `public/images/`
3. Update paths trong code: `assets/image.png` → `/uploads/image.png`
4. Sử dụng Next.js Image component

---

## ✅ Checklist

- [ ] Đã giải nén ZIP
- [ ] Đã copy code vào `temp/stitch-input.html`
- [ ] Đã convert bằng Cursor AI
- [ ] Đã copy assets vào `public/`
- [ ] Đã tạo component trong `src/components/stitch/`
- [ ] Đã test trong browser

---

**Xem hướng dẫn chi tiết:** `HUONG_DAN_XU_LY_STITCH_ZIP.md` (ở root project)



