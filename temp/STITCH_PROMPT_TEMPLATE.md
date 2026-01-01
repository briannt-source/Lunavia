# 🎯 Stitch Conversion Prompt Template

## 📋 Prompt Chuẩn Cho Cursor AI

Copy prompt này và paste vào Cursor AI Chat khi convert từng page:

---

```
Tôi đã paste code HTML từ Google Stitch vào file temp/stitch-input.html. 
Code này đã sử dụng Tailwind CSS. Hãy convert sang React component với:

**TUÂN THEO STITCH_CONVENTIONS.md:**

1. TypeScript với proper types và interfaces
2. Giữ nguyên Tailwind CSS classes (KHÔNG refactor)
3. Sử dụng shadcn/ui components thay HTML elements khi có ý nghĩa:
   - <button> → Button từ @/components/ui/button
   - <input> → Input từ @/components/ui/input
   - <select> → Select từ @/components/ui/select
   - <textarea> → Textarea từ @/components/ui/textarea
   - Modal/Dialog → Dialog từ @/components/ui/dialog
   - KHÔNG ép layout <div> → Card nếu chỉ là layout tĩnh
4. Convert HTML attributes:
   - onclick → onClick
   - class → className
   - for → htmlFor
   - href → Link từ next/link (internal links)
5. Next.js 15 App Router compatible
6. Server component mặc định (KHÔNG 'use client' trừ khi cần state/interactivity)
7. Export component với tên: [COMPONENT_NAME]
8. Sử dụng Next.js Image thay <img>
9. Sử dụng path alias @/ cho imports
10. Material Icons → lucide-react icons (theo mapping trong STITCH_CONVENTIONS.md)
11. Nếu phát hiện layout/component lặp lại (header, footer, card, table, modal):
    - Tách thành reusable components
    - Ghi chú rõ vị trí file đề xuất
    - Đặt trong src/components/stitch/[folder-name]/

**Component name:** [COMPONENT_NAME]
**File location:** src/components/stitch/[file-name].tsx

Hãy convert toàn bộ code trong file temp/stitch-input.html.
```

---

## 🔄 Workflow Nhanh

1. **Chạy script prepare:**
   ```bash
   npm run stitch:prepare <page-name>
   ```

2. **Script sẽ tự động:**
   - Copy `code.html` vào `temp/stitch-input.html`
   - Hiển thị component name đề xuất
   - Hiển thị file output đề xuất

3. **Mở Cursor AI:**
   - Mở file `temp/stitch-input.html`
   - Select All (Ctrl+A)
   - Mở Cursor AI Chat (Ctrl+L)
   - Copy prompt trên và thay:
     - `[COMPONENT_NAME]` = Component name từ script
     - `[file-name]` = File name từ script
   - Paste và Enter

4. **Lưu component:**
   - Copy code đã convert
   - Tạo file tại vị trí đề xuất
   - Test component

---

## 📝 Ví Dụ Cụ Thể

### Page: `ai_analytics_dashboard`

**Bước 1:**
```bash
npm run stitch:prepare ai_analytics_dashboard
```

**Output:**
```
✅ Đã prepare page: ai_analytics_dashboard
📁 Code đã copy vào: temp/stitch-input.html
📝 Component name đề xuất: AiAnalyticsDashboard
📁 File output đề xuất: src/components/stitch/ai-analytics-dashboard.tsx
```

**Bước 2: Prompt cho Cursor AI:**
```
... (prompt trên với)
**Component name:** AiAnalyticsDashboard
**File location:** src/components/stitch/ai-analytics-dashboard.tsx
```

---

## ✅ Checklist Sau Khi Convert

- [ ] Server Component (không `use client` nếu không cần)
- [ ] Không Material Icons (đã thay bằng lucide-react)
- [ ] Không Card/Tabs dư thừa (chỉ dùng khi có ý nghĩa UI)
- [ ] Dùng `next/image`, `next/link`
- [ ] Không lỗi TypeScript
- [ ] UI giống Stitch 100%
- [ ] Reusable components đã được tách (nếu có)

---

**Lưu ý:** Luôn tham chiếu `STITCH_CONVENTIONS.md` khi convert!
