# 🎨 Hướng Dẫn Tích Hợp Code UI Từ Google Stitch

> **⚠️ QUAN TRỌNG:** Trước khi convert, hãy đọc `STITCH_CONVENTIONS.md` để tuân theo chuẩn của dự án.

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn convert và tích hợp code UI từ **Google Stitch** (stitch.withgoogle.com) vào dự án **Lunavia** một cách nhanh chóng và hiệu quả.

## 📦 Nếu Bạn Có File ZIP Từ Stitch
👉 **Xem hướng dẫn xử lý file ZIP:** `HUONG_DAN_XU_LY_STITCH_ZIP.md`

## 🚀 Quy Trình 5 Bước

### **Bước 1: Chuẩn Bị Code Từ Stitch**

1. Mở project của bạn trên [stitch.withgoogle.com](https://stitch.withgoogle.com)
2. Export code (HTML/CSS hoặc React) từ Stitch
3. Copy toàn bộ code vào clipboard

### **Bước 2: Paste Code Vào File Tạm**

1. Tạo hoặc mở file: `temp/stitch-input.html` (hoặc `.tsx` nếu là React code)
2. Paste code từ Stitch vào file này
3. Lưu file

**Ví dụ cấu trúc file:**
```
temp/
└── stitch-input.html  ← Paste code từ Stitch vào đây
```

### **Bước 3: Sử Dụng Cursor AI Để Convert**

1. **Mở file** `temp/stitch-input.html` trong Cursor
2. **Select toàn bộ code** (Ctrl+A)
3. **Mở Cursor AI Chat** (Ctrl+L hoặc Cmd+L)
4. **Paste prompt sau:**

```
Convert code HTML/CSS này từ Google Stitch sang React component với:

1. TypeScript với proper types và interfaces
2. Tailwind CSS classes thay vì CSS thuần
3. Sử dụng shadcn/ui components thay vì HTML elements:
   - <button> → Button từ @/components/ui/button
   - <input> → Input từ @/components/ui/input
   - <select> → Select từ @/components/ui/select
   - <div class="card"> → Card, CardHeader, CardContent từ @/components/ui/card
4. Convert HTML attributes:
   - onclick → onClick
   - class → className
   - for → htmlFor
5. Next.js 15 App Router compatible
6. Server component mặc định (không 'use client' trừ khi cần state/interactivity)
7. Export component với tên phù hợp (ví dụ: StitchHeroSection, StitchPricingCard)
8. Thêm proper TypeScript interfaces cho props
9. Responsive design với Tailwind breakpoints (sm:, md:, lg:)
10. Giữ nguyên design và styling từ Stitch nhưng convert sang Tailwind

Hãy convert toàn bộ code trong file này.
```

5. **Nhấn Enter** và đợi Cursor AI generate code

### **Bước 4: Lưu Component Đã Convert**

1. **Copy code đã convert** từ Cursor AI
2. **Tạo file mới** trong `src/components/stitch/` với tên phù hợp:
   ```
   src/components/stitch/your-component-name.tsx
   ```
3. **Paste code đã convert** vào file
4. **Kiểm tra imports** - đảm bảo tất cả imports đều đúng:
   ```tsx
   import { Button } from "@/components/ui/button";
   import { Card, CardContent, CardHeader } from "@/components/ui/card";
   // ... các imports khác
   ```

### **Bước 5: Sử Dụng Component Trong Dự Án**

1. **Import component** vào page hoặc component khác:
   ```tsx
   import { YourStitchComponent } from "@/components/stitch/your-component-name";
   ```

2. **Sử dụng component:**
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

3. **Test component** trong browser
4. **Refine nếu cần** - sử dụng Cursor AI để tối ưu thêm

---

## 📝 Ví Dụ Cụ Thể

### **Ví Dụ 1: Convert Button Component**

**Code từ Stitch (HTML/CSS):**
```html
<button class="btn-primary" onclick="handleClick()">
  Click me
</button>

<style>
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-primary:hover {
  background-color: #2563eb;
}
</style>
```

**Sau khi convert (React/TypeScript):**
```tsx
// src/components/stitch/stitch-button.tsx
import { Button } from "@/components/ui/button";

interface StitchButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function StitchButton({ onClick, children }: StitchButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
    >
      {children}
    </Button>
  );
}
```

### **Ví Dụ 2: Convert Card Component**

**Code từ Stitch:**
```html
<div class="card">
  <h3 class="card-title">Title</h3>
  <p class="card-content">Content here</p>
</div>

<style>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
```

**Sau khi convert:**
```tsx
// src/components/stitch/stitch-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StitchCardProps {
  title: string;
  content: string;
}

export function StitchCard({ title, content }: StitchCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Mapping Table: HTML → shadcn/ui Components

| HTML Element | shadcn/ui Component | Import Path |
|-------------|---------------------|-------------|
| `<button>` | `Button` | `@/components/ui/button` |
| `<input>` | `Input` | `@/components/ui/input` |
| `<select>` | `Select` | `@/components/ui/select` |
| `<div class="card">` | `Card`, `CardHeader`, `CardContent` | `@/components/ui/card` |
| `<dialog>` | `Dialog` | `@/components/ui/dialog` |
| `<label>` | `Label` | `@/components/ui/label` |
| `<textarea>` | `Textarea` | `@/components/ui/textarea` |
| `<div class="tabs">` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@/components/ui/tabs` |
| `<div class="badge">` | `Badge` | `@/components/ui/badge` |
| `<div class="alert">` | `Alert` | `@/components/ui/alert` |

---

## 🔧 CSS → Tailwind Mapping

| CSS | Tailwind Class |
|-----|----------------|
| `display: flex` | `flex` |
| `justify-content: center` | `justify-center` |
| `align-items: center` | `items-center` |
| `padding: 1rem` | `p-4` |
| `margin: 1rem` | `m-4` |
| `background-color: #3b82f6` | `bg-blue-600` |
| `color: white` | `text-white` |
| `border-radius: 0.5rem` | `rounded-lg` |
| `font-weight: 600` | `font-semibold` |
| `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` | `shadow-sm` |

**💡 Tip:** Sử dụng Cursor AI với prompt:
```
Convert CSS này sang Tailwind classes: [paste CSS]
```

---

## ✅ Checklist Sau Khi Convert

- [ ] Code đã được convert sang TypeScript
- [ ] Tất cả CSS đã được thay bằng Tailwind classes
- [ ] HTML elements đã được thay bằng shadcn/ui components
- [ ] HTML attributes đã được convert (onclick → onClick, class → className)
- [ ] Đã thêm TypeScript interfaces cho props
- [ ] Component đã được export với tên phù hợp
- [ ] Imports đều đúng và sử dụng path alias `@/`
- [ ] Component hoạt động khi test trong browser
- [ ] Responsive design đã được kiểm tra (mobile, tablet, desktop)
- [ ] Code đã được format và không có linter errors

---

## 🐛 Troubleshooting

### **Lỗi: Component không hiển thị**

**Giải pháp:**
1. Kiểm tra console errors trong browser
2. Đảm bảo đã import đúng component
3. Kiểm tra xem component có cần `'use client'` directive không

### **Lỗi: Styling không đúng**

**Giải pháp:**
1. Kiểm tra Tailwind classes có đúng không
2. Sử dụng Cursor AI: "Fix styling cho component này, đảm bảo match với design từ Stitch"
3. Kiểm tra `tailwind.config.ts` có custom colors không

### **Lỗi: TypeScript errors**

**Giải pháp:**
1. Kiểm tra interfaces và types
2. Sử dụng Cursor AI: "Fix TypeScript errors trong component này"
3. Đảm bảo tất cả props đều có type definitions

---

## 📚 Tài Liệu Tham Khảo

- **Google Stitch**: https://stitch.withgoogle.com
- **shadcn/ui Components**: https://ui.shadcn.com/docs/components
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Next.js 15**: https://nextjs.org/docs

---

## 🎓 Best Practices

1. **Luôn test component** sau khi convert
2. **Giữ code consistency** với dự án hiện tại
3. **Document props** của component
4. **Sử dụng Git** để track changes
5. **Review code** trước khi commit

---

## 💡 Pro Tips

1. **Sử dụng Cursor AI để tối ưu:**
   ```
   Tối ưu component này:
   - Thêm error handling
   - Thêm loading states
   - Cải thiện accessibility
   - Thêm responsive design
   ```

2. **Convert từng phần nhỏ:**
   - Không convert toàn bộ page một lúc
   - Chia nhỏ thành các components riêng biệt
   - Convert và test từng component

3. **Lưu code gốc từ Stitch:**
   - Giữ file `temp/stitch-input.html` để reference sau này
   - Comment trong code nếu cần giải thích logic

---

**Chúc bạn thành công! 🚀**

Nếu gặp vấn đề, hãy sử dụng Cursor AI với prompt cụ thể về vấn đề bạn đang gặp.

