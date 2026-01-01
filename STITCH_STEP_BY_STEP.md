# 📖 Hướng Dẫn Từng Bước - Convert & Reuse Login Pages

> **Cầm tay chỉ việc từng bước một**

---

## 🎯 Mục Tiêu

Convert 10 login pages, nhưng chỉ convert 1 page đầu tiên, sau đó reuse cho 9 pages còn lại.

---

## 📋 Bước 1: Convert Page Đầu Tiên (Thủ Công)

### **1.1. Prepare Page**

```bash
npm run stitch:prepare user_login_page_1
```

**Output:**
```
✅ Đã prepare page: user_login_page_1
📁 Code đã copy vào: temp/stitch-input.html
📝 Component name đề xuất: UserLoginPage1
📁 File output đề xuất: src/components/stitch/user-login-page-1.tsx
```

### **1.2. Convert Với Cursor AI**

1. **Mở file:** `temp/stitch-input.html` trong Cursor
2. **Select All:** `Ctrl+A`
3. **Mở Cursor AI Chat:** `Ctrl+L` (hoặc `Cmd+L` trên Mac)
4. **Copy và paste prompt này:**

```
Tôi đã paste code HTML từ Google Stitch vào file temp/stitch-input.html. 
Code này đã sử dụng Tailwind CSS. Hãy convert sang React component với:

**TUÂN THEO STITCH_CONVENTIONS.md:**

1. TypeScript với proper types và interfaces
2. Giữ nguyên Tailwind CSS classes (KHÔNG refactor)
3. Sử dụng shadcn/ui components thay HTML elements khi có ý nghĩa:
   - <button> → Button từ @/components/ui/button
   - <input> → Input từ @/components/ui/input
   - <label> → Label từ @/components/ui/label
4. Convert HTML attributes: onclick→onClick, class→className
5. Next.js 15 App Router compatible
6. Server component mặc định (KHÔNG 'use client' trừ khi cần state)
7. Export component với tên: UserLoginPage1
8. Sử dụng Next.js Image thay <img>
9. Sử dụng path alias @/ cho imports
10. Material Icons → lucide-react icons

**Component name:** UserLoginPage1
**File location:** src/components/stitch/user-login-page-1.tsx

**QUAN TRỌNG:** Nếu thấy form, layout, header có thể reuse, hãy tách thành separate components và ghi chú:
- Component name đề xuất
- File location đề xuất
- Props cần thiết

Hãy convert toàn bộ code trong file temp/stitch-input.html.
```

5. **Nhấn Enter** và đợi AI convert (30-60 giây)
6. **Copy code đã convert** từ Cursor AI response

### **1.3. Lưu Component**

1. **Tạo file:** `src/components/stitch/user-login-page-1.tsx`
2. **Paste code** đã convert vào
3. **Kiểm tra imports:** Đảm bảo tất cả imports đúng
4. **Test:** Chạy `npm run dev` và kiểm tra component

---

## 🔧 Bước 2: Tách Reusable Components (Thủ Công, Có Hướng Dẫn)

### **2.1. Phân Tích Component**

Mở file `src/components/stitch/user-login-page-1.tsx` và tìm các phần:

**Ví dụ structure:**
```tsx
export default function UserLoginPage1() {
  return (
    <div className="min-h-screen">
      {/* 1. Header - CÓ THỂ REUSE */}
      <header className="...">
        <Logo />
        <Nav />
      </header>
      
      {/* 2. Main Content */}
      <main className="...">
        {/* 3. Login Form - CÓ THỂ REUSE */}
        <form className="...">
          <Input />
          <Input />
          <Button />
        </form>
      </main>
      
      {/* 4. Footer - CÓ THỂ REUSE */}
      <footer className="...">
        ...
      </footer>
    </div>
  );
}
```

### **2.2. Tách LoginForm Component**

**Tạo file:** `src/components/stitch/auth/login-form.tsx`

1. **Copy form code** từ `user-login-page-1.tsx`
2. **Tạo component mới:**

```tsx
"use client"; // Nếu form có useState, onSubmit handler

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ... other imports từ user-login-page-1.tsx

interface LoginFormProps {
  variant?: "default" | "minimal";
  onSubmit?: (data: { email: string; password: string }) => void;
  className?: string;
}

export function LoginForm({ 
  variant = "default", 
  onSubmit, 
  className 
}: LoginFormProps) {
  // Copy form logic từ UserLoginPage1
  // Giữ nguyên tất cả Tailwind classes
  
  return (
    <form className={className} onSubmit={handleSubmit}>
      {/* Copy form fields từ UserLoginPage1 */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <Button type="submit">Sign In</Button>
      </div>
    </form>
  );
}
```

### **2.3. Tách AuthLayout Component**

**Tạo file:** `src/components/stitch/auth/auth-layout.tsx`

```tsx
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle,
  header,
  footer 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Copy header từ UserLoginPage1, hoặc dùng prop */}
      {header || (
        <header className="...">
          {/* Default header */}
        </header>
      )}
      
      {/* Main Content - Copy structure từ UserLoginPage1 */}
      <main className="flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          {title && (
            <h1 className="text-2xl font-bold">{title}</h1>
          )}
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
          {children}
        </div>
      </main>
      
      {/* Footer */}
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
```

### **2.4. Refactor UserLoginPage1**

Sau khi tách components, refactor `user-login-page-1.tsx`:

```tsx
import { AuthLayout } from "./auth/auth-layout";
import { LoginForm } from "./auth/login-form";

export default function UserLoginPage1() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <LoginForm variant="default" />
    </AuthLayout>
  );
}
```

**Test lại:** Đảm bảo component vẫn hoạt động giống như trước.

---

## 🔄 Bước 3: Reuse Cho Pages Còn Lại (Semi-Automated)

### **3.1. Sử Dụng Script Generate**

```bash
npm run stitch:generate user_login_page_2 --from user_login_page_1
```

**Script sẽ:**
1. Copy `user-login-page-1.tsx` → `user-login-page-2.tsx`
2. Thay `UserLoginPage1` → `UserLoginPage2`
3. Giữ nguyên structure và imports
4. Tạo file sẵn sàng để bạn chỉnh sửa

**Output:**
```
✅ Đã generate component từ template!
📁 Source: src/components/stitch/user-login-page-1.tsx
📁 Target: src/components/stitch/user-login-page-2.tsx
📝 Component: UserLoginPage1 → UserLoginPage2

🚀 Bước tiếp theo:
   1. Mở file src/components/stitch/user-login-page-2.tsx
   2. Review và adjust styling/content nếu cần
   3. Test component
```

### **3.2. Review & Adjust (Nếu Cần)**

Mở file `user-login-page-2.tsx` và kiểm tra:

**Nếu page 2 có styling/content khác:**
```tsx
export default function UserLoginPage2() {
  return (
    <AuthLayout
      title="Welcome Back" // Có thể thay đổi
      subtitle="Sign in to continue" // Có thể thay đổi
    >
      <LoginForm 
        variant="minimal" // Có thể thay đổi variant
      />
    </AuthLayout>
  );
}
```

**Nếu page 2 giống hệt page 1:**
- Không cần thay đổi gì, chỉ cần test!

### **3.3. Lặp Lại Cho 8 Pages Còn Lại**

```bash
# Generate tất cả pages còn lại
npm run stitch:generate user_login_page_3 --from user_login_page_1
npm run stitch:generate user_login_page_4 --from user_login_page_1
npm run stitch:generate user_login_page_5 --from user_login_page_1
npm run stitch:generate user_login_page_6 --from user_login_page_1
npm run stitch:generate user_login_page_7 --from user_login_page_1
npm run stitch:generate user_login_page_8 --from user_login_page_1
npm run stitch:generate user_login_page_9 --from user_login_page_1
npm run stitch:generate user_login_page_10 --from user_login_page_1
```

**Hoặc tạo script batch:**

```bash
# Tạo file: scripts/generate-all-login-pages.sh
for i in {2..10}; do
  npm run stitch:generate user_login_page_$i --from user_login_page_1
done
```

---

## ✅ Checklist Hoàn Chỉnh

### **Bước 1: Convert Page Đầu Tiên**
- [ ] `npm run stitch:prepare user_login_page_1`
- [ ] Convert với Cursor AI (prompt ở trên)
- [ ] Lưu vào `src/components/stitch/user-login-page-1.tsx`
- [ ] Test component hoạt động

### **Bước 2: Tách Reusable Components**
- [ ] Phân tích `user-login-page-1.tsx`, tìm các phần có thể reuse
- [ ] Tạo `src/components/stitch/auth/login-form.tsx`
- [ ] Tạo `src/components/stitch/auth/auth-layout.tsx`
- [ ] Refactor `user-login-page-1.tsx` để dùng reusable components
- [ ] Test lại component vẫn hoạt động

### **Bước 3: Reuse Cho Pages Còn Lại**
- [ ] `npm run stitch:generate user_login_page_2 --from user_login_page_1`
- [ ] Review và adjust `user-login-page-2.tsx` (nếu cần)
- [ ] Test component
- [ ] Lặp lại cho 8 pages còn lại
- [ ] Test tất cả 10 pages

---

## 💡 Tips Quan Trọng

1. **Giữ nguyên structure:** Chỉ thay đổi content, không thay đổi layout
2. **Dùng props:** Nếu có khác biệt nhỏ, dùng props thay vì tạo component mới
3. **Test từng bước:** Test sau mỗi component được tách
4. **Commit thường xuyên:** Commit sau mỗi reusable component được tạo

---

## 🆘 Troubleshooting

### **Lỗi: "Source file không tồn tại"**

```bash
# Convert source page trước
npm run stitch:prepare user_login_page_1
# Convert với Cursor AI
# Lưu component
# Sau đó mới generate
```

### **Lỗi: "Target file đã tồn tại"**

```bash
# Xóa file cũ nếu muốn overwrite
rm src/components/stitch/user-login-page-2.tsx
# Hoặc đổi tên file
```

### **Lỗi: Component không hiển thị**

- Kiểm tra imports
- Kiểm tra component name đã đổi chưa
- Kiểm tra file path

---

## 📊 Kết Quả

**Thời gian:**
- Bước 1 (Convert page đầu): ~5 phút
- Bước 2 (Tách components): ~10 phút
- Bước 3 (Reuse 9 pages): ~9 phút (1 phút/page)

**Tổng:** ~24 phút cho 10 pages (thay vì 50 phút nếu convert từng cái!)

**Tiết kiệm:** ~26 phút (52% faster)!

---

**Bắt đầu ngay:** `npm run stitch:prepare user_login_page_1` 🚀



