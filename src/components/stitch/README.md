# Google Stitch Components

Thư mục này chứa các components được tạo từ **Google Stitch** (stitch.withgoogle.com) và đã được convert để phù hợp với dự án.

## Cấu trúc

```
stitch/
├── README.md              # File này
├── templates/            # Templates để convert từ Stitch
└── [component-name].tsx  # Các components đã convert
```

## Quy trình import component từ Google Stitch

1. **Tạo UI trong Google Stitch** (stitch.withgoogle.com)
2. **Export HTML/CSS code từ Stitch project**
3. **Paste vào file mới trong thư mục này** (hoặc temp/stitch-input.html)
4. **Sử dụng Cursor AI với prompt:**
   ```
   Convert code HTML/CSS này từ Google Stitch sang React component:
   - HTML → React JSX
   - CSS → Tailwind CSS classes
   - HTML attributes → React props (onclick → onClick, class → className)
   - TypeScript với proper types
   - shadcn/ui components thay vì HTML elements
   - Phù hợp với Next.js 15 App Router
   ```
5. **Test component**
6. **Import và sử dụng trong dự án**

## Naming Convention

- File name: `stitch-[component-name].tsx`
- Component name: `Stitch[ComponentName]`
- Ví dụ: `stitch-button.tsx` → `StitchButton`

## Checklist

Khi import component từ Google Stitch, đảm bảo:

- [ ] Đã convert HTML → React JSX
- [ ] Đã convert HTML attributes (onclick → onClick, class → className)
- [ ] Đã convert CSS → Tailwind CSS classes
- [ ] Đã thay HTML elements bằng shadcn/ui components (nếu có)
- [ ] Đã thêm TypeScript types
- [ ] Đã test component
- [ ] Đã document props và usage

## Ví dụ

Xem các file trong thư mục này để tham khảo cách convert components từ Google Stitch.

### Lưu ý về Google Stitch

- Google Stitch thường export HTML/CSS, không phải React code
- Cần convert HTML attributes sang React props
- Cần convert CSS sang Tailwind classes
- Nên thay HTML elements bằng shadcn/ui components để consistency

