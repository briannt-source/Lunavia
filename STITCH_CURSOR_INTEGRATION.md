# Hướng dẫn Tích hợp Google Stitch với Cursor

## Tổng quan

Hướng dẫn này giúp bạn đồng bộ code giữa **Google Stitch** (stitch.withgoogle.com) và **Cursor** (phát triển code) một cách hiệu quả.

[Google Stitch](https://stitch.withgoogle.com) là công cụ AI do Google phát triển, ra mắt tại Google I/O 2025, giúp tạo giao diện người dùng (UI) cho ứng dụng web và di động một cách nhanh chóng và trực quan.

## Quy trình làm việc

### 1. Tạo UI với Google Stitch

1. **Truy cập Google Stitch**: https://stitch.withgoogle.com
2. **Tạo thiết kế UI**:
   - Nhập mô tả bằng ngôn ngữ tự nhiên
   - Hoặc upload hình ảnh (phác thảo, wireframe, screenshot)
3. **Xuất mã**:
   - Google Stitch sẽ tự động generate HTML/CSS code
   - Copy code được generate từ Stitch project

### 2. Import code vào Cursor

#### Cách 1: Copy-paste trực tiếp (Nhanh)

1. **Export code từ Google Stitch project**
2. **Copy HTML/CSS code từ Stitch**
3. **Paste vào Cursor** tại file component cần thiết
4. **Sử dụng Cursor AI** với prompt:
   ```
   Convert code này từ Google Stitch (HTML/CSS) sang React component với:
   - TypeScript
   - Tailwind CSS (thay vì CSS thuần)
   - shadcn/ui components nếu có thể
   - Phù hợp với cấu trúc dự án Next.js 15 App Router
   ```

#### Cách 2: Sử dụng thư mục temp (Khuyến nghị)

1. **Export code từ Google Stitch project**
2. **Paste HTML/CSS code từ Stitch vào** `temp/stitch-input.html` hoặc `temp/stitch-input.tsx`
3. **Mở file trong Cursor**
4. **Sử dụng Cursor AI** với prompt:
   ```
   Convert toàn bộ code trong file này từ Google Stitch (HTML/CSS) sang React component:
   - TypeScript với proper types
   - Tailwind CSS classes thay vì CSS thuần
   - shadcn/ui components thay vì HTML elements
   - Next.js 15 App Router compatible
   - Export component với tên phù hợp
   ```
5. **Copy component đã convert** vào `src/components/stitch/`

### 3. Quy trình làm việc tối ưu

```
1. Google Stitch (Tạo UI)
   - Tạo project tại stitch.withgoogle.com
   - Design UI bằng mô tả hoặc upload ảnh
   ↓
2. Export code từ Stitch project → Copy HTML/CSS
   ↓
3. Paste vào temp/stitch-input.html hoặc temp/stitch-input.tsx
   ↓
4. Sử dụng Cursor AI để convert:
   - HTML → React JSX
   - CSS → Tailwind CSS classes
   - TypeScript types
   - shadcn/ui components
   - Next.js App Router patterns
   ↓
5. Copy component đã convert vào src/components/stitch/
   ↓
6. Test và refine với Cursor AI
   ↓
7. Import và sử dụng trong dự án
   ↓
8. Commit vào Git
```

## Ví dụ cụ thể

### Bước 1: Code từ Google Stitch

Google Stitch thường export HTML/CSS. Ví dụ code từ Stitch:

```html
<!-- Code từ Google Stitch (paste vào temp/stitch-input.html) -->
<div class="button-container">
  <button class="btn-primary" onclick="handleClick()">
    Click me
  </button>
</div>

<style>
.button-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

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

### Bước 2: Prompt cho Cursor AI

```
Convert code HTML/CSS này từ Google Stitch sang React component với:
- TypeScript với proper types
- Tailwind CSS classes thay vì CSS
- Sử dụng Button component từ @/components/ui/button
- Export component với tên StitchButton
- Thêm proper TypeScript interface
- Convert HTML attributes sang React props (onclick → onClick)
```

### Bước 3: Code sau khi convert (Cursor AI sẽ generate)

```tsx
// src/components/stitch/stitch-button.tsx
import { Button } from "@/components/ui/button";

interface StitchButtonProps {
  text: string;
  onClick: () => void;
}

export function StitchButton({ text, onClick }: StitchButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
    >
      {text}
    </Button>
  );
}
```

### Bước 4: Sử dụng component

```tsx
// src/app/some-page/page.tsx
import { StitchButton } from "@/components/stitch/stitch-button";

export default function SomePage() {
  return (
    <div>
      <StitchButton 
        text="Click me" 
        onClick={() => console.log("Clicked")} 
      />
    </div>
  );
}
```

## Cursor AI Prompt Templates

### Template 1: Convert cơ bản (HTML/CSS → React)
```
Convert code HTML/CSS này từ Google Stitch sang React component:
- TypeScript
- Tailwind CSS thay vì CSS thuần
- shadcn/ui components thay vì HTML elements
- Next.js 15 App Router
- Convert HTML attributes sang React props
```

### Template 2: Convert với tối ưu
```
Convert và tối ưu code HTML/CSS này từ Google Stitch:
- HTML → React JSX
- CSS → Tailwind CSS classes
- TypeScript với proper types
- shadcn/ui components
- Error handling
- Loading states
- Accessibility features
- Responsive design
```

### Template 3: Convert với tích hợp Next.js
```
Convert code HTML/CSS này và tích hợp vào Next.js App Router:
- HTML → React JSX
- CSS → Tailwind CSS
- Server component (hoặc Client component nếu cần)
- Proper imports
- Next.js Image, Link components
- TypeScript types
- Convert inline styles và CSS classes
```

## Best Practices

### 1. **Luôn review code từ Stitch**

- Stitch có thể generate code không tối ưu
- Luôn review và refactor với Cursor AI

### 2. **Sử dụng Cursor AI để tối ưu**

Prompt mẫu:
```
Tối ưu component này:
- Thêm TypeScript types
- Sử dụng Tailwind CSS thay vì inline styles
- Thay thế bằng shadcn/ui components nếu có thể
- Thêm error handling
- Thêm loading states
```

### 3. **Giữ consistency với Design System**

- Luôn sử dụng colors từ `tailwind.config.ts`
- Sử dụng spacing system của Tailwind
- Tuân thủ component patterns hiện có

### 4. **Version Control**

```bash
# Tạo branch riêng cho Stitch components
git checkout -b feature/stitch-integration

# Commit với message rõ ràng
git commit -m "feat: add component from Stitch AI - [component name]"
```

## Cấu trúc thư mục

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (giữ nguyên)
│   ├── stitch/          # Components từ Stitch AI
│   │   ├── README.md
│   │   ├── stitch-button.tsx
│   │   └── ...
│   └── ...
├── lib/
│   └── stitch-converter.ts  # Utility functions
└── ...

temp/
├── .gitkeep
└── stitch-input.tsx     # Paste code từ Stitch vào đây (gitignored)
```

## Troubleshooting

### Vấn đề: Code từ Google Stitch không hoạt động

**Giải pháp:**
1. Check console errors
2. Đảm bảo đã convert HTML attributes đúng (onclick → onClick, class → className)
3. Sử dụng Cursor AI để debug:
   ```
   Fix lỗi này trong component: [paste error]
   Đảm bảo đã convert HTML attributes sang React props
   ```
4. Đảm bảo đã import đúng dependencies

### Vấn đề: Styling không match

**Giải pháp:**
1. Check Tailwind config
2. Sử dụng Cursor AI:
   ```
   Convert CSS này từ Google Stitch sang Tailwind classes: [paste CSS]
   ```
3. Đảm bảo đã thay thế tất cả CSS classes bằng Tailwind

### Vấn đề: HTML elements không tương thích

**Giải pháp:**
1. Sử dụng Cursor AI để map HTML elements:
   ```
   Thay thế HTML elements này bằng shadcn/ui components:
   - <button> → Button component
   - <input> → Input component
   - <select> → Select component
   [paste HTML code]
   ```

## Checklist khi import từ Stitch

- [ ] Code đã được convert sang TypeScript
- [ ] CSS đã được thay bằng Tailwind
- [ ] Components đã được thay bằng shadcn/ui (nếu có)
- [ ] Đã thêm proper types và interfaces
- [ ] Đã test component hoạt động
- [ ] Đã check responsive design
- [ ] Đã check accessibility
- [ ] Code đã được format và lint
- [ ] Đã commit vào Git

## Lưu ý quan trọng

1. **Luôn backup code trước khi import từ Stitch**
2. **Test kỹ trước khi commit**
3. **Giữ code consistency với dự án hiện tại**
4. **Sử dụng Git để track changes**
5. **Document các components từ Stitch**

## Tài liệu tham khảo

- [Google Stitch](https://stitch.withgoogle.com) - Công cụ AI của Google để tạo UI
- [Cursor AI Documentation](https://cursor.com)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Google I/O 2025 - Stitch Announcement](https://techcrunch.com/2025/05/20/google-launches-stitch-an-ai-powered-tool-to-help-design-apps/)

---

**Tác giả**: Generated for Lunavia Project  
**Cập nhật**: 2025-01-15
