# 📦 Hướng Dẫn Xử Lý File ZIP Từ Stitch - Cấu Trúc Thực Tế

## 🎯 Cấu Trúc File ZIP Từ Stitch

Stitch export mỗi page thành một folder riêng, mỗi folder chứa:
- `code.html` - File HTML chứa toàn bộ code (HTML + CSS + JS)
- `screen.png` - Screenshot của page (để reference)

**Ví dụ:**
```
stitch_lunavia_welcome_page/
├── lunavia_welcome_page/
│   ├── code.html          ← Code HTML/CSS/JS
│   └── screen.png         ← Screenshot
├── ai_analytics_dashboard/
│   ├── code.html
│   └── screen.png
├── browse_tours_page_(guide_view)_/
│   ├── code.html
│   └── screen.png
└── ... (nhiều pages khác)
```

---

## 🚀 Quy Trình Xử Lý (5 Bước)

### **Bước 1: Chọn Page Cần Convert** (30 giây)

1. Mở folder `stitch_lunavia_welcome_page`
2. Chọn page bạn muốn convert (ví dụ: `lunavia_welcome_page`)
3. Mở folder đó

### **Bước 2: Copy Code HTML** (1 phút)

1. Mở file `code.html` trong folder page đó
2. Select All (Ctrl+A)
3. Copy (Ctrl+C)

**Ví dụ:**
```
stitch_lunavia_welcome_page/
└── lunavia_welcome_page/
    └── code.html  ← Mở file này
```

### **Bước 3: Paste Vào File Tạm** (30 giây)

1. Tạo hoặc mở file: `temp/stitch-input.html`
2. Paste toàn bộ code vào file này
3. Lưu file

### **Bước 4: Sử Dụng Cursor AI Convert** (2 phút)

1. **Mở file** `temp/stitch-input.html` trong Cursor
2. **Select All** (Ctrl+A)
3. **Mở Cursor AI Chat** (Ctrl+L hoặc Cmd+L)
4. **Copy và paste prompt này:**

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
7. Export component với tên phù hợp (ví dụ: LunaviaWelcomePage, BrowseToursPage)
8. Thêm proper TypeScript interfaces cho props
9. Responsive design với Tailwind breakpoints (sm:, md:, lg:, xl:)
10. Giữ nguyên design và styling từ Stitch nhưng convert sang Tailwind
11. Sử dụng path alias @/ cho imports
12. Đảm bảo component có thể reuse được

Nếu có images/assets, hãy hướng dẫn tôi cách xử lý chúng.

Hãy convert toàn bộ code trong file temp/stitch-input.html.
```

5. **Nhấn Enter** và đợi AI convert

### **Bước 5: Lưu Component** (1 phút)

1. **Copy code đã convert** từ Cursor AI
2. **Tạo file mới** trong `src/components/stitch/` hoặc page tương ứng:
   ```
   src/components/stitch/lunavia-welcome-page.tsx
   ```
   Hoặc nếu là page:
   ```
   src/app/welcome/page.tsx
   ```
3. **Paste code** và kiểm tra imports
4. **Test component** trong browser

---

## 📋 Danh Sách Các Pages Có Sẵn

Dựa trên folder `stitch_lunavia_welcome_page`, bạn có các pages sau:

### **Welcome & Auth Pages**
- `lunavia_welcome_page/` - Trang chào mừng
- `user_login_page_1/` đến `user_login_page_10/` - Các variant của trang login
- `user_registration_page/` - Trang đăng ký

### **Tour Pages**
- `browse_tours_page_(guide_view)_/` - Trang browse tours (guide view)
- `tour_details_&_apply_(guide_view)_page/` - Trang chi tiết tour và apply
- `edit_tour_page/` - Trang edit tour
- `my_tours_(participating)_page_(guide_view)_/` - Tours guide đang tham gia

### **Application & Assignment Pages**
- `application_management_overview/` - Tổng quan quản lý applications
- `application_details_&_guide_profile/` - Chi tiết application và profile guide
- `my_applications_page_(guide_view)_/` - Applications của guide
- `my_assignments_page_(guide_view)_/` - Assignments của guide

### **AI Features**
- `ai_analytics_dashboard/` - Dashboard analytics với AI
- `ai_chat_assistant_interface/` - Chat assistant với AI
- `ai_guide_matching_page/` - AI guide matching
- `ai_itinerary_generation_page/` - AI tạo itinerary

### **Company Management**
- `company_profile_&_management/` - Quản lý công ty
- `invite_guide_to_company/` - Mời guide vào công ty
- `pending_guide_join_requests_1/` và `pending_guide_join_requests_2/` - Join requests

### **Reports & Payments**
- `submit_tour_report_page/` - Nộp báo cáo tour
- `approve_payment_request_from_report/` - Duyệt payment request

### **Emergency & SOS**
- `emergency_management_page/` - Quản lý emergency
- `emergency_sos_report_page_1/` đến `emergency_sos_report_page_4/` - Các variant SOS report

### **Admin Pages**
- `user_management_page_(admin_view)__1/` đến `user_management_page_(admin_view)__8/` - Quản lý users
- `verification_management_overview/` - Tổng quan verification
- `verification_details_&_approval/` - Chi tiết và duyệt verification
- `verification_submission_page/` - Nộp verification
- `wallet_requests_management_page/` - Quản lý wallet requests

### **Other Pages**
- `settings_page/` - Trang settings
- `faq_page/` - FAQ page
- `conversation_list_page_1/` và `conversation_list_page_2/` - Danh sách conversations
- `create_contract_page/` - Tạo contract
- `view_&_accept_contract_page/` - Xem và accept contract

---

## 🎯 Workflow Đề Xuất

### **Option 1: Convert Từng Page Một**

1. Chọn 1 page cần convert
2. Copy code từ `code.html`
3. Paste vào `temp/stitch-input.html`
4. Dùng Cursor AI convert
5. Lưu component
6. Test
7. Lặp lại cho page tiếp theo

### **Option 2: Convert Nhiều Pages Cùng Lúc**

1. Chọn nhiều pages liên quan (ví dụ: tất cả login pages)
2. Convert từng page một
3. Tổng hợp lại sau

---

## 💡 Tips

1. **Xem screenshot trước:** Mở `screen.png` để xem design trước khi convert
2. **Convert từng phần:** Nếu page quá lớn, chia nhỏ thành các components
3. **Giữ nguyên tên:** Giữ tên folder/page để dễ track
4. **Test ngay:** Test từng component sau khi convert

---

## 📝 Ví Dụ Cụ Thể: Convert Welcome Page

### **Bước 1:**
```
Mở: stitch_lunavia_welcome_page/lunavia_welcome_page/code.html
```

### **Bước 2:**
```
Copy toàn bộ code (Ctrl+A, Ctrl+C)
```

### **Bước 3:**
```
Paste vào: temp/stitch-input.html
```

### **Bước 4:**
```
Dùng Cursor AI với prompt ở trên
```

### **Bước 5:**
```
Lưu vào: src/app/welcome/page.tsx
hoặc: src/components/stitch/lunavia-welcome-page.tsx
```

---

## ✅ Checklist

- [ ] Đã chọn page cần convert
- [ ] Đã mở file `code.html` trong folder page đó
- [ ] Đã copy code vào `temp/stitch-input.html`
- [ ] Đã sử dụng Cursor AI để convert
- [ ] Đã tạo component trong `src/components/stitch/` hoặc page tương ứng
- [ ] Đã test component trong browser
- [ ] Component hoạt động đúng

---

## 🆘 Cần Giúp?

Nếu gặp vấn đề:
1. Kiểm tra file `code.html` có code không
2. Đảm bảo đã paste đầy đủ code vào `temp/stitch-input.html`
3. Sử dụng Cursor AI: "Fix lỗi này: [mô tả vấn đề]"

---

**Bắt đầu ngay:** Chọn 1 page và làm theo 5 bước ở trên! 🚀



