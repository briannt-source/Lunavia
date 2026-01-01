# 🚀 Stitch Batch Conversion Workflow (Enhanced)

> **Tự động hóa quy trình convert 53 pages từ Stitch với 3 strategies: Batch Prepare, Group by Category, Reuse Components**

---

## 🎯 3 Strategies Chính

### 1️⃣ **Batch Prepare** - Prepare nhiều pages cùng lúc
### 2️⃣ **Group by Category** - Convert theo nhóm logic
### 3️⃣ **Reuse Components** - Tái sử dụng cho pages tương tự

---

## 📋 Quick Start

### **Bước 1: Xem Tất Cả Categories**

```bash
npm run stitch:categories
```

**Output:**
```
📊 Pages Theo Category:

📦 WELCOME (1/1 - 100.0%)
   ✅ lunavia_welcome_page

📦 AUTH (0/12 - 0.0%)
   ⏳ user_login_page_1
   ⏳ user_login_page_2
   ...

📦 AI (0/4 - 0.0%)
   ⏳ ai_analytics_dashboard
   ...
```

### **Bước 2: Tìm Pages Tương Tự Để Reuse**

```bash
npm run stitch:similar
```

**Output:**
```
🔍 Tìm Pages Tương Tự Để Reuse Components

📦 LOGIN PAGES
   Total: 10 pages
   ✅ Converted: 0
   ⏳ Remaining: 10

   💡 Strategy:
      1. Convert user_login_page_1 đầu tiên
      2. Tách reusable components (LoginForm, etc.)
      3. Copy và modify cho 9 pages còn lại
      4. Chỉ thay đổi content, giữ nguyên structure
```

### **Bước 3: Batch Prepare Theo Category**

```bash
npm run stitch:batch auth
```

**Output:**
```
📦 Batch Prepare Category: auth
📊 Tổng số pages: 12

📋 Pages cần convert:

1. user_login_page_1
   Component: UserLoginPage1
   File: src/components/stitch/user-login-page-1.tsx

2. user_login_page_2
   Component: UserLoginPage2
   File: src/components/stitch/user-login-page-2.tsx

...

💡 Tip: Prepare page đầu tiên để tạo template, sau đó reuse cho các pages tương tự!
```

---

## 🔄 Workflow Hoàn Chỉnh (Áp Dụng 3 Tips)

### **Strategy 1: Reuse Components (Login Pages)**

```bash
# 1. Tìm similar pages
npm run stitch:similar

# 2. Prepare page đầu tiên
npm run stitch:prepare user_login_page_1

# 3. Convert với Cursor AI và tạo component
# 4. Tách reusable components (LoginForm, AuthLayout, etc.)

# 5. Prepare page thứ 2
npm run stitch:prepare user_login_page_2

# 6. Convert nhưng REUSE components từ page 1
#    - Copy structure từ UserLoginPage1
#    - Chỉ thay đổi content/styling khác biệt
#    - Import reusable components

# 7. Lặp lại cho 8 pages còn lại (nhanh hơn nhiều!)
```

### **Strategy 2: Group by Category (AI Features)**

```bash
# 1. Batch prepare category AI
npm run stitch:batch ai

# 2. Convert từng page trong category
npm run stitch:prepare ai_analytics_dashboard
# ... convert với Cursor AI

npm run stitch:prepare ai_chat_assistant_interface
# ... convert với Cursor AI

# 3. Check progress
npm run stitch:report
```

### **Strategy 3: Batch Prepare Multiple Categories**

```bash
# Prepare nhiều categories cùng lúc
npm run stitch:batch auth      # 12 pages
npm run stitch:batch ai        # 4 pages
npm run stitch:batch tours     # 4 pages

# Sau đó convert từng category một
# Ưu điểm: Có overview rõ ràng, dễ track progress
```

---

## 📊 Categories Available

| Category | Pages | Description |
|----------|-------|-------------|
| `welcome` | 1 | Landing page |
| `auth` | 12 | Login & Registration pages |
| `ai` | 4 | AI features (analytics, chat, matching, itinerary) |
| `tours` | 4 | Tour browsing, details, editing |
| `applications` | 4 | Application management |
| `company` | 4 | Company management |
| `reports` | 2 | Tour reports & payments |
| `emergency` | 5 | Emergency & SOS pages |
| `admin` | 12 | Admin management pages |
| `other` | 6 | Settings, FAQ, conversations, contracts |

---

## 🎯 Recommended Workflow

### **Phase 1: Core Pages (Priority)**

```bash
# 1. Welcome (đã xong)
✅ lunavia_welcome_page

# 2. Auth - Convert 1-2 pages đầu, reuse cho 10 pages còn lại
npm run stitch:batch auth
npm run stitch:prepare user_login_page_1
# Convert và tách reusable components
# Reuse cho 9 pages còn lại
```

### **Phase 2: Main Features**

```bash
# 3. Tours
npm run stitch:batch tours

# 4. Applications
npm run stitch:batch applications

# 5. AI Features
npm run stitch:batch ai
```

### **Phase 3: Management Pages**

```bash
# 6. Company
npm run stitch:batch company

# 7. Reports
npm run stitch:batch reports

# 8. Emergency
npm run stitch:batch emergency
```

### **Phase 4: Admin & Other**

```bash
# 9. Admin
npm run stitch:batch admin

# 10. Other
npm run stitch:batch other
```

---

## 💡 Reuse Strategy Chi Tiết

### **Example: Login Pages (10 pages tương tự)**

#### **Bước 1: Convert Page Đầu Tiên**

```bash
npm run stitch:prepare user_login_page_1
```

Convert với Cursor AI và tạo:
- `src/components/stitch/user-login-page-1.tsx`
- Tách reusable components:
  - `src/components/stitch/auth/login-form.tsx`
  - `src/components/stitch/auth/auth-layout.tsx`

#### **Bước 2: Reuse Cho Pages Còn Lại**

```bash
npm run stitch:prepare user_login_page_2
```

**Thay vì convert lại từ đầu:**
1. Copy `user-login-page-1.tsx` → `user-login-page-2.tsx`
2. Import reusable components
3. Chỉ thay đổi content/styling khác biệt
4. Test và done!

**Tiết kiệm:** ~80% thời gian cho 9 pages còn lại!

### **Example: Admin User Management (8 pages tương tự)**

```bash
# 1. Convert page đầu tiên
npm run stitch:prepare user_management_page_(admin_view)__1

# 2. Tách reusable components:
#    - UserTable
#    - UserFilters
#    - UserActions

# 3. Reuse cho 7 pages còn lại
#    - Chỉ thay đổi columns, filters, actions
#    - Giữ nguyên structure
```

---

## 📝 Commands Reference

```bash
# List & Explore
npm run stitch:list                    # List tất cả pages
npm run stitch:categories               # List theo category
npm run stitch:similar                  # Tìm pages tương tự

# Prepare & Convert
npm run stitch:prepare <page-name>      # Prepare một page
npm run stitch:batch <category>         # Batch prepare category

# Track Progress
npm run stitch:report                   # Generate report
```

---

## ⚡ Time Estimation (Với Reuse Strategy)

### **Without Reuse:**
- 53 pages × 5 phút = **~265 phút (~4.4 giờ)**

### **With Reuse Strategy:**

| Group | Pages | First Convert | Reuse Others | Total |
|-------|-------|---------------|--------------|-------|
| Login Pages | 10 | 5 min | 9 × 1 min | **14 min** |
| Admin User Mgmt | 8 | 5 min | 7 × 1 min | **12 min** |
| Emergency SOS | 4 | 5 min | 3 × 1 min | **8 min** |
| Other Unique | 31 | 31 × 5 min | - | **155 min** |
| **Total** | **53** | - | - | **~189 min (~3.2 giờ)** |

**Tiết kiệm:** ~1.2 giờ (27% faster)!

---

## ✅ Checklist Cho Mỗi Category

### **Khi Bắt Đầu Category:**

- [ ] Chạy `npm run stitch:batch <category>`
- [ ] Check `npm run stitch:similar` để tìm pages tương tự
- [ ] Convert 1-2 pages đầu tiên
- [ ] Tách reusable components (nếu có)
- [ ] Reuse cho các pages tương tự
- [ ] Convert các pages unique
- [ ] Check `npm run stitch:report`

### **Khi Convert Page:**

- [ ] Đã chạy `npm run stitch:prepare <page-name>`
- [ ] Đã convert với Cursor AI
- [ ] Đã tách reusable components (nếu cần)
- [ ] Đã lưu component vào đúng vị trí
- [ ] Đã test component (không lỗi TypeScript)
- [ ] Đã check UI giống Stitch

---

## 🚨 Best Practices

1. **Luôn check similar pages trước khi convert category**
2. **Convert 1-2 pages đầu để tạo template**
3. **Tách reusable components ngay từ đầu**
4. **Reuse structure, chỉ thay content**
5. **Track progress thường xuyên với `npm run stitch:report`**
6. **Commit sau mỗi category hoàn thành**

---

## 📊 Progress Tracking

### **Check Progress:**

```bash
npm run stitch:report
```

**Output:**
```
📊 STITCH CONVERSION REPORT

Total pages: 53
✅ Converted: 5
⏳ Remaining: 48
📈 Progress: 9.4%

📊 By Category:
  welcome: 1/1 (100.0%)
  auth: 2/12 (16.7%)
  ai: 0/4 (0.0%)
  ...
```

### **Manual Tracking:**

File `temp/stitch-conversion-report.md` được tự động update sau mỗi lần chạy report.

---

**Chúc bạn convert hiệu quả với 3 strategies này! 🚀**
