# 🎯 Hướng Dẫn Chi Tiết: Xử Lý Code Từ Stitch

> **⚠️ QUAN TRỌNG:** Trước khi convert, hãy đọc `STITCH_CONVENTIONS.md` để tuân theo chuẩn của dự án.

## 📁 Cấu Trúc Thực Tế

Stitch export mỗi page thành một folder:
```
stitch_lunavia_welcome_page/
├── lunavia_welcome_page/
│   ├── code.html      ← Code HTML (đã có Tailwind CSS!)
│   └── screen.png     ← Screenshot để reference
├── ai_analytics_dashboard/
│   ├── code.html
│   └── screen.png
└── ... (nhiều pages khác)
```

**Tin tốt:** Code từ Stitch đã sử dụng Tailwind CSS rồi! Chỉ cần convert HTML → React.

---

## 🚀 Quy Trình 5 Bước (Cầm Tay Chỉ Việc)

### **BƯỚC 1: Chọn Page Cần Convert** ⏱️ 10 giây

1. Mở folder: `stitch_lunavia_welcome_page`
2. Chọn page bạn muốn (ví dụ: `lunavia_welcome_page`)
3. Mở folder đó

### **BƯỚC 2: Copy Code HTML** ⏱️ 30 giây

1. Mở file `code.html` trong folder page đó
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)

**Ví dụ đường dẫn:**
```
stitch_lunavia_welcome_page/lunavia_welcome_page/code.html
```

### **BƯỚC 3: Paste Vào File Tạm** ⏱️ 20 giây

1. Tạo hoặc mở file: `temp/ 
2. **Paste** toàn bộ code vào (Ctrl+V)
3. **Lưu** file (Ctrl+S)

### **BƯỚC 4: Dùng Cursor AI Convert** ⏱️ 2 phút

1. **Mở file** `temp/stitch-input.html` trong Cursor
2. **Select All** (Ctrl+A)
3. **Mở Cursor AI Chat:**
   - Nhấn `Ctrl+L` (Windows/Linux) 
   - Hoặc `Cmd+L` (Mac)
   - Hoặc click icon Cursor AI ở sidebar
4. **Copy prompt này và paste:**

```
Tôi đã paste code HTML từ Google Stitch vào file temp/stitch-input.html. 
Code này đã sử dụng Tailwind CSS. Hãy convert sang React component với:

1. TypeScript với proper types và interfaces
2. Giữ nguyên Tailwind CSS classes (không cần convert vì đã dùng Tailwind)
3. Sử dụng shadcn/ui components thay vì HTML elements khi có thể:
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
   - href → Link component từ next/link (nếu là internal link)
5. Next.js 15 App Router compatible
6. Server component mặc định (không 'use client' trừ khi cần state/interactivity)
7. Export component với tên phù hợp (ví dụ: LunaviaWelcomePage)
8. Thêm proper TypeScript interfaces cho props
9. Sử dụng Next.js Image component thay vì <img> tag
10. Sử dụng path alias @/ cho imports
11. Giữ nguyên design và styling (đã dùng Tailwind rồi)
12. Xử lý Material Icons: thay <span class="material-symbols-outlined"> bằng lucide-react icons hoặc giữ nguyên nếu cần

Hãy convert toàn bộ code trong file temp/stitch-input.html.
```

5. **Nhấn Enter** và đợi AI convert (khoảng 30-60 giây)

### **BƯỚC 5: Lưu Component** ⏱️ 1 phút

1. **Copy code đã convert** từ Cursor AI response
2. **Quyết định nơi lưu:**

   **Nếu là Page (trang riêng):**
   ```
   src/app/welcome/page.tsx
   ```
   
   **Nếu là Component (dùng lại được):**
   ```
   src/components/stitch/lunavia-welcome-page.tsx
   ```

3. **Tạo file mới** và paste code vào
4. **Kiểm tra imports:**
   - Đảm bảo imports đúng: `@/components/ui/...`
   - Kiểm tra có lỗi TypeScript không

5. **Test:**
   - Chạy `npm run dev`
   - Mở browser và kiểm tra

---

## 📋 Danh Sách Pages Có Sẵn

Bạn có **50+ pages** từ Stitch! Dưới đây là danh sách:

### **🏠 Welcome & Auth (13 pages)**
- `lunavia_welcome_page/` ⭐ **Bắt đầu từ đây!**
- `user_login_page_1/` đến `user_login_page_10/`
- `user_registration_page/`

### **🗺️ Tour Pages (4 pages)**
- `browse_tours_page_(guide_view)_/`
- `tour_details_&_apply_(guide_view)_page/`
- `edit_tour_page/`
- `my_tours_(participating)_page_(guide_view)_/`

### **📝 Application & Assignment (4 pages)**
- `application_management_overview/`
- `application_details_&_guide_profile/`
- `my_applications_page_(guide_view)_/`
- `my_assignments_page_(guide_view)_/`

### **🤖 AI Features (4 pages)**
- `ai_analytics_dashboard/`
- `ai_chat_assistant_interface/`
- `ai_guide_matching_page/`
- `ai_itinerary_generation_page/`

### **🏢 Company Management (3 pages)**
- `company_profile_&_management/`
- `invite_guide_to_company/`
- `pending_guide_join_requests_1/` và `pending_guide_join_requests_2/`

### **📊 Reports & Payments (2 pages)**
- `submit_tour_report_page/`
- `approve_payment_request_from_report/`

### **🚨 Emergency & SOS (5 pages)**
- `emergency_management_page/`
- `emergency_sos_report_page_1/` đến `emergency_sos_report_page_4/`

### **👨‍💼 Admin Pages (15 pages)**
- `user_management_page_(admin_view)__1/` đến `user_management_page_(admin_view)__8/`
- `verification_management_overview/`
- `verification_details_&_approval/`
- `verification_submission_page/`
- `wallet_requests_management_page/`

### **⚙️ Other Pages (4 pages)**
- `settings_page/`
- `faq_page/`
- `conversation_list_page_1/` và `conversation_list_page_2/`
- `create_contract_page/`
- `view_&_accept_contract_page/`

---

## 🎯 Workflow Đề Xuất

### **Phase 1: Core Pages (Ưu tiên cao)**
1. ✅ `lunavia_welcome_page/` - Trang chào mừng
2. ✅ `user_login_page_1/` - Trang login
3. ✅ `user_registration_page/` - Trang đăng ký
4. ✅ `browse_tours_page_(guide_view)_/` - Browse tours
5. ✅ `tour_details_&_apply_(guide_view)_page/` - Chi tiết tour

### **Phase 2: Dashboard Pages**
6. ✅ `ai_analytics_dashboard/` - Dashboard analytics
7. ✅ `application_management_overview/` - Quản lý applications
8. ✅ `settings_page/` - Settings

### **Phase 3: Advanced Features**
9. ✅ `ai_guide_matching_page/` - AI matching
10. ✅ `company_profile_&_management/` - Quản lý công ty
11. ✅ Các pages còn lại...

---

## 💡 Tips Quan Trọng

### **1. Xem Screenshot Trước**
- Mở file `screen.png` để xem design trước khi convert
- Giúp bạn hiểu component cần làm gì

### **2. Convert Từng Page Một**
- Đừng convert nhiều pages cùng lúc
- Convert → Test → Fix → Tiếp tục

### **3. Giữ Tên Rõ Ràng**
- File component: `lunavia-welcome-page.tsx`
- Component name: `LunaviaWelcomePage`

### **4. Test Ngay Sau Khi Convert**
- Chạy `npm run dev`
- Kiểm tra trong browser
- Fix lỗi ngay nếu có

### **5. Sử Dụng Cursor AI Để Fix**
Nếu có lỗi, dùng prompt:
```
Fix lỗi này trong component: [paste error]
Đảm bảo component hoạt động đúng.
```

---

## 🐛 Troubleshooting

### **Lỗi: Material Icons không hiển thị**

**Giải pháp:**
- Thay `<span class="material-symbols-outlined">` bằng lucide-react icons
- Hoặc cài đặt Material Icons font

### **Lỗi: Images không hiển thị**

**Giải pháp:**
- Code từ Stitch có thể dùng Google Images URL
- Thay bằng Next.js Image component
- Hoặc copy images vào `public/` folder

### **Lỗi: Tailwind classes không hoạt động**

**Giải pháp:**
- Kiểm tra `tailwind.config.ts` có custom colors không
- Code từ Stitch có thể dùng custom colors như `bg-primary`
- Cần thêm vào `tailwind.config.ts` hoặc thay bằng Tailwind classes chuẩn

---

## ✅ Checklist Sau Khi Convert

- [ ] Code đã được convert sang TypeScript
- [ ] HTML attributes đã được convert (onclick→onClick, class→className)
- [ ] Đã thay HTML elements bằng shadcn/ui components (nếu có)
- [ ] Đã sử dụng Next.js Image thay vì <img>
- [ ] Đã sử dụng Next.js Link thay vì <a> (cho internal links)
- [ ] Component đã được export với tên phù hợp
- [ ] Imports đều đúng và sử dụng path alias @/
- [ ] Component hoạt động khi test trong browser
- [ ] Responsive design đã được kiểm tra
- [ ] Không có lỗi TypeScript

---

## 🚀 Bắt Đầu Ngay!

**Đề xuất:** Bắt đầu với `lunavia_welcome_page/` vì đây là trang chào mừng quan trọng.

1. Mở: `stitch_lunavia_welcome_page/lunavia_welcome_page/code.html`
2. Copy toàn bộ code
3. Paste vào `temp/stitch-input.html`
4. Dùng Cursor AI với prompt ở Bước 4
5. Lưu vào `src/app/welcome/page.tsx` hoặc `src/components/stitch/lunavia-welcome-page.tsx`
6. Test!

---

**Chúc bạn thành công! 🎉**

Nếu gặp vấn đề, hãy mô tả cụ thể và tôi sẽ giúp bạn fix!

