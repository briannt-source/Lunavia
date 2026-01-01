# 🎨 Hướng Dẫn Paste Code Từ Google Stitch

> **⚠️ QUAN TRỌNG:** Trước khi convert, hãy đọc `STITCH_CONVENTIONS.md` (ở root project) để tuân theo chuẩn.

## 📁 Cấu Trúc File ZIP Từ Stitch

Stitch export mỗi page thành một folder:
- `code.html` - Code HTML (đã có Tailwind CSS!)
- `screen.png` - Screenshot

**Ví dụ:** `stitch_lunavia_welcome_page/lunavia_welcome_page/code.html`

## ⚡ Quick Start (3 Bước)

### 1. Paste Code Vào File Này
- Copy code HTML/CSS từ Google Stitch
- Paste vào file: `temp/stitch-input.html` (hoặc tạo file mới với tên phù hợp)

### 2. Mở File Trong Cursor
- Mở file vừa paste trong Cursor
- Select all (Ctrl+A)

### 3. Sử Dụng Cursor AI
- Mở Cursor AI Chat (Ctrl+L hoặc Cmd+L)
- Copy prompt từ file `STITCH_PROMPT_TEMPLATE.md` trong thư mục này
- Paste prompt và nhấn Enter
- Đợi AI convert code

---

## 📋 Prompt Mẫu (Copy & Paste)

```
Convert code HTML/CSS này từ Google Stitch sang React component với:

1. TypeScript với proper types và interfaces
2. Tailwind CSS classes thay vì CSS thuần
3. Sử dụng shadcn/ui components thay vì HTML elements
4. Convert HTML attributes: onclick→onClick, class→className
5. Next.js 15 App Router compatible
6. Export component với tên phù hợp
7. Responsive design với Tailwind breakpoints

Convert toàn bộ code trong file này.
```

---

## 📁 Cấu Trúc File

```
temp/
├── STITCH_INSTRUCTIONS.md      ← File này
├── STITCH_PROMPT_TEMPLATE.md   ← Template prompts
└── stitch-input.html           ← Paste code từ Stitch vào đây
```

---

## ✅ Sau Khi Convert

1. **Copy code đã convert** từ Cursor AI
2. **Tạo file mới** trong `src/components/stitch/`
3. **Paste code** và kiểm tra imports
4. **Test component** trong browser

---

## 📚 Xem Thêm

- **Hướng dẫn chi tiết:** `HUONG_DAN_STITCH.md` (ở root project)
- **Quick start:** `QUICK_START_STITCH.md` (ở root project)
- **Template prompts:** `STITCH_PROMPT_TEMPLATE.md` (trong thư mục này)

---

## 💡 Tips

- File trong `temp/` sẽ không được commit vào Git (đã gitignored)
- Sau khi convert xong, có thể xóa file input
- Component đã convert sẽ được đặt vào `src/components/stitch/`
- Luôn test component sau khi convert

---

**Chúc bạn thành công! 🚀**

