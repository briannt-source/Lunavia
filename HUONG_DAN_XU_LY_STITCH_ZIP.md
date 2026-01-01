# 📦 Hướng Dẫn Xử Lý File ZIP Từ Google Stitch

## 🎯 Tổng Quan

Google Stitch export mỗi page thành một folder riêng, mỗi folder chứa:
- `code.html` - File HTML chứa toàn bộ code (HTML + Tailwind CSS)
- `screen.png` - Screenshot của page (để reference)

**Cấu trúc thực tế:**
```
stitch_lunavia_welcome_page/
├── lunavia_welcome_page/
│   ├── code.html      ← Code HTML (đã có Tailwind CSS!)
│   └── screen.png     ← Screenshot
├── ai_analytics_dashboard/
│   ├── code.html
│   └── screen.png
└── ... (nhiều pages khác)
```

👉 **Xem hướng dẫn chi tiết:** `HUONG_DAN_STITCH_CHI_TIET.md`

---

## 📋 Bước 1: Giải Nén File ZIP

### 1.1. Tìm file ZIP
- File thường có tên như: `stitch-project.zip`, `design.zip`, hoặc tên project của bạn
- Thường ở thư mục Downloads

### 1.2. Giải nén
- **Windows**: Right-click → Extract All
- **Mac**: Double-click để giải nén
- **Linux**: `unzip stitch-project.zip`

### 1.3. Xem cấu trúc
Sau khi giải nén, bạn sẽ thấy cấu trúc như:
```
stitch-project/
├── index.html          ← File HTML chính
├── styles.css          ← File CSS
├── script.js           ← File JavaScript (nếu có)
├── assets/             ← Thư mục chứa images, fonts
│   ├── images/
│   └── fonts/
└── ...
```

---

## 📋 Bước 2: Xác Định File Cần Convert

### 2.1. Mở file HTML chính
- Thường là `index.html` hoặc file HTML có tên giống project
- Mở bằng text editor (VS Code, Notepad++, etc.)

### 2.2. Kiểm tra nội dung
- Xem có link đến CSS file không: `<link rel="stylesheet" href="styles.css">`
- Xem có link đến JS file không: `<script src="script.js"></script>`
- Xem có images/assets không: `<img src="assets/image.png">`

---

## 📋 Bước 3: Chuẩn Bị Code Để Convert

### 3.1. Copy toàn bộ code HTML

**Cách 1: Copy từ file HTML**
1. Mở file `index.html` (hoặc file HTML chính)
2. Select All (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)

**Cách 2: Copy cả HTML + CSS**
1. Mở file HTML
2. Mở file CSS
3. Copy HTML vào đầu
4. Copy CSS vào sau (trong thẻ `<style>` hoặc riêng)

### 3.2. Paste vào file tạm trong dự án

1. Tạo file mới: `temp/stitch-input.html`
2. Paste toàn bộ code vào file này
3. Lưu file

**Ví dụ cấu trúc:**
```html
<!-- temp/stitch-input.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    /* CSS từ styles.css paste vào đây */
  </style>
</head>
<body>
  <!-- HTML code paste vào đây -->
</body>
</html>
```

---

## 📋 Bước 4: Sử Dụng Cursor AI Để Convert

### 4.1. Mở file trong Cursor
1. Mở file `temp/stitch-input.html` trong Cursor
2. Select All (Ctrl+A / Cmd+A)

### 4.2. Mở Cursor AI Chat
- Nhấn `Ctrl+L` (Windows/Linux) hoặc `Cmd+L` (Mac)
- Hoặc click vào icon Cursor AI ở sidebar

### 4.3. Copy và paste prompt này:

```
Tôi đã paste code HTML/CSS từ Google Stitch vào file temp/stitch-input.html. 
Hãy convert toàn bộ code này sang React component với:

1. TypeScript với proper types và interfaces
2. Tailwind CSS classes thay vì CSS thuần (convert tất cả CSS sang Tailwind)
3. Sử dụng shadcn/ui components thay vì HTML elements:
   - <button> → Button từ @/components/ui/button
   - <input> → Input từ @/components/ui/input
   - <select> → Select từ @/components/ui/select
   - <div class="card"> → Card, CardHeader, CardContent từ @/components/ui/card
   - <dialog> → Dialog từ @/components/ui/dialog
   - <label> → Label từ @/components/ui/label
   - <textarea> → Textarea từ @/components/ui/textarea
   - <div class="tabs"> → Tabs, TabsList, TabsTrigger, TabsContent từ @/components/ui/tabs
4. Convert HTML attributes:
   - onclick → onClick
   - class → className
   - for → htmlFor
   - style → className với Tailwind
5. Next.js 15 App Router compatible
6. Server component mặc định (không 'use client' trừ khi cần state/interactivity)
7. Export component với tên phù hợp (ví dụ: StitchHeroSection, StitchPricingCard)
8. Thêm proper TypeScript interfaces cho props
9. Responsive design với Tailwind breakpoints (sm:, md:, lg:, xl:)
10. Giữ nguyên design và styling từ Stitch nhưng convert sang Tailwind
11. Sử dụng path alias @/ cho imports
12. Đảm bảo component có thể reuse được

Nếu có images/assets, hãy hướng dẫn tôi cách xử lý chúng.

Hãy convert toàn bộ code trong file temp/stitch-input.html.
```

### 4.4. Nhấn Enter và đợi AI convert

---

## 📋 Bước 5: Xử Lý Assets (Images, Fonts, etc.)

### 5.1. Copy assets vào dự án

1. **Images:**
   ```bash
   # Copy images từ stitch-project/assets/images/ 
   # vào public/uploads/ hoặc public/images/
   ```

2. **Fonts (nếu có):**
   ```bash
   # Copy fonts vào public/fonts/
   ```

### 5.2. Update paths trong code đã convert

- Thay `assets/image.png` → `/uploads/image.png` hoặc `/images/image.png`
- Sử dụng Next.js Image component:
  ```tsx
  import Image from "next/image";
  
  <Image src="/uploads/image.png" alt="..." width={500} height={300} />
  ```

---

## 📋 Bước 6: Lưu Component Đã Convert

### 6.1. Copy code từ Cursor AI
- Copy toàn bộ code React component đã được convert

### 6.2. Tạo file component mới

1. Tạo file trong `src/components/stitch/`:
   ```
   src/components/stitch/your-component-name.tsx
   ```

2. Paste code đã convert vào

3. Kiểm tra imports:
   ```tsx
   import { Button } from "@/components/ui/button";
   import { Card, CardContent, CardHeader } from "@/components/ui/card";
   // ... các imports khác
   ```

### 6.3. Fix lỗi (nếu có)

Nếu có lỗi TypeScript hoặc imports:
- Sử dụng Cursor AI: "Fix lỗi TypeScript trong component này"
- Hoặc: "Fix imports trong component này"

---

## 📋 Bước 7: Sử Dụng Component

### 7.1. Import component

```tsx
// Trong page hoặc component khác
import { YourStitchComponent } from "@/components/stitch/your-component-name";
```

### 7.2. Sử dụng component

```tsx
export default function YourPage() {
  return (
    <div>
      <YourStitchComponent 
        prop1="value1"
        prop2="value2"
      />
    </div>
  );
}
```

### 7.3. Test trong browser
- Chạy `npm run dev`
- Mở browser và kiểm tra component

---

## 📋 Bước 8: Tối Ưu (Optional)

### 8.1. Sử dụng Cursor AI để tối ưu

Prompt:
```
Tối ưu component này:
- Thêm error handling
- Thêm loading states nếu cần
- Cải thiện accessibility (ARIA labels, keyboard navigation)
- Thêm responsive design nếu chưa có
- Refactor code để dễ maintain
- Thêm comments cho logic phức tạp
```

---

## 🎯 Checklist Hoàn Thành

- [ ] Đã giải nén file ZIP từ Stitch
- [ ] Đã copy code HTML/CSS vào `temp/stitch-input.html`
- [ ] Đã sử dụng Cursor AI để convert
- [ ] Đã copy assets (images, fonts) vào `public/`
- [ ] Đã tạo component trong `src/components/stitch/`
- [ ] Đã fix tất cả lỗi TypeScript và imports
- [ ] Đã test component trong browser
- [ ] Component hoạt động đúng và responsive
- [ ] Đã commit vào Git (nếu cần)

---

## 🐛 Troubleshooting

### Vấn đề: File ZIP không có file HTML

**Giải pháp:**
- Kiểm tra xem có file `.html`, `.htm`, hoặc file text nào không
- Có thể Stitch export React code, tìm file `.tsx` hoặc `.jsx`

### Vấn đề: CSS không được convert đúng

**Giải pháp:**
1. Đảm bảo đã paste cả CSS vào file `temp/stitch-input.html`
2. Sử dụng Cursor AI: "Convert CSS này sang Tailwind classes: [paste CSS]"

### Vấn đề: Images không hiển thị

**Giải pháp:**
1. Kiểm tra đã copy images vào `public/` chưa
2. Kiểm tra paths trong code đã đúng chưa
3. Sử dụng Next.js Image component thay vì `<img>` tag

### Vấn đề: Component có nhiều lỗi

**Giải pháp:**
1. Sử dụng Cursor AI: "Fix tất cả lỗi trong component này"
2. Kiểm tra imports có đúng không
3. Kiểm tra TypeScript types

---

## 💡 Tips & Best Practices

1. **Chia nhỏ component lớn:**
   - Nếu Stitch export một page lớn, chia thành nhiều components nhỏ
   - Sử dụng Cursor AI: "Chia component này thành các components nhỏ hơn"

2. **Giữ code gốc:**
   - Giữ file ZIP và code gốc để reference sau này
   - Comment trong code nếu cần giải thích logic

3. **Test từng phần:**
   - Convert và test từng section một
   - Đừng convert toàn bộ page một lúc

4. **Sử dụng Git:**
   ```bash
   git checkout -b feature/stitch-integration
   git add .
   git commit -m "feat: add component from Stitch - [component name]"
   ```

---

## 📚 Tài Liệu Tham Khảo

- **Hướng dẫn chi tiết:** `HUONG_DAN_STITCH.md`
- **Quick start:** `QUICK_START_STITCH.md`
- **Template prompts:** `temp/STITCH_PROMPT_TEMPLATE.md`

---

## 🚀 Bắt Đầu Ngay

1. **Giải nén file ZIP** từ Stitch
2. **Mở file HTML chính** và copy code
3. **Paste vào** `temp/stitch-input.html`
4. **Sử dụng Cursor AI** với prompt ở Bước 4.3
5. **Lưu component** vào `src/components/stitch/`
6. **Test và refine**

---

**Chúc bạn thành công! 🎉**

Nếu gặp vấn đề, hãy sử dụng Cursor AI với mô tả cụ thể về vấn đề bạn đang gặp.

