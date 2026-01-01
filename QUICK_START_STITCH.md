# ⚡ Quick Start: Tích Hợp Code Từ Stitch (5 Phút)

## 🎯 Mục Tiêu
Convert code UI từ Google Stitch sang React component trong dự án Lunavia.

## 📦 Nếu Bạn Có File ZIP Từ Stitch
👉 **Xem hướng dẫn chi tiết:** `HUONG_DAN_XU_LY_STITCH_ZIP.md`

---

## 📝 Các Bước Thực Hiện

### **1. Paste Code Vào File Tạm** (30 giây)

```bash
# Mở file này trong Cursor:
temp/stitch-input.html
```

Paste code HTML/CSS từ Stitch vào file này.

---

### **2. Copy Prompt Này** (10 giây)

```
Convert code HTML/CSS này từ Google Stitch sang React component:

1. TypeScript với proper types
2. Tailwind CSS thay vì CSS thuần
3. shadcn/ui components thay HTML elements
4. Convert attributes: onclick→onClick, class→className
5. Next.js 15 App Router compatible
6. Export component với tên phù hợp
7. Responsive design với Tailwind breakpoints

Convert toàn bộ code trong file này.
```

---

### **3. Sử Dụng Cursor AI** (2 phút)

1. Mở file `temp/stitch-input.html`
2. Select all (Ctrl+A)
3. Mở Cursor AI Chat (Ctrl+L)
4. Paste prompt ở bước 2
5. Nhấn Enter và đợi AI generate

---

### **4. Lưu Component** (1 phút)

1. Copy code đã convert
2. Tạo file mới: `src/components/stitch/your-component.tsx`
3. Paste code vào
4. Kiểm tra imports

---

### **5. Sử Dụng Component** (1 phút)

```tsx
// Trong page hoặc component khác
import { YourComponent } from "@/components/stitch/your-component";

export default function Page() {
  return <YourComponent />;
}
```

---

## ✅ Done!

Component đã sẵn sàng sử dụng. Test trong browser và refine nếu cần.

---

## 🆘 Cần Giúp?

Sử dụng Cursor AI với prompt:
```
[Paste vấn đề cụ thể của bạn]
Fix lỗi này và đảm bảo component hoạt động đúng.
```

---

**Xem hướng dẫn chi tiết:** `HUONG_DAN_STITCH.md`

