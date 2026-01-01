phep# 🎯 Hướng Dẫn Reuse Components - Cầm Tay Chỉ Việc

> **Workflow chi tiết từng bước để convert và reuse components**

---

## 📋 Tổng Quan Workflow

```
1. Convert page đầu tiên (thủ công với Cursor AI)
   ↓
2. Tách reusable components (thủ công, nhưng có script hỗ trợ)
   ↓
3. Tạo template từ page đầu tiên
   ↓
4. Reuse template cho các pages còn lại (semi-automated)
```

---

## 🚀 Bước 1: Convert Page Đầu Tiên

### **1.1. Prepare Page**

```bash
npm run stitch:prepare user_login_page_1
```

### **1.2. Convert Với Cursor AI**

1. **Mở file:** `temp/stitch-input.html` trong Cursor
2. **Select All:** Ctrl+A
3. **Mở Cursor AI:** Ctrl+L
4. **Copy prompt này:**

```
Tôi đã paste code HTML từ Google Stitch vào file temp/stitch-input.html. 
Code này đã sử dụng Tailwind CSS. Hãy convert sang React component với:

**TUÂN THEO STITCH_CONVENTIONS.md:**

1. TypeScript với proper types và interfaces
2. Giữ nguyên Tailwind CSS classes
3. Sử dụng shadcn/ui components
4. Server component mặc định
5. Material Icons → lucide-react icons
6. Dùng next/image, next/link

**Component name:** UserLoginPage1
**File location:** src/components/stitch/user-login-page-1.tsx

**QUAN TRỌNG:** Nếu thấy các phần có thể reuse (form, layout, header), hãy tách thành separate components và ghi chú rõ:
- Component name
- File location đề xuất
- Props cần thiết

Hãy convert toàn bộ code trong file temp/stitch-input.html.
```

5. **Paste và Enter**
6. **Copy code đã convert**

### **1.3. Lưu Component**

1. Tạo file: `src/components/stitch/user-login-page-1.tsx`
2. Paste code vào
3. Test: `npm run dev` và kiểm tra

---

## 🔧 Bước 2: Tách Reusable Components

### **2.1. Phân Tích Component**

Sau khi convert `user-login-page-1.tsx`, mở file và tìm các phần có thể reuse:

**Ví dụ structure:**
```tsx
export default function UserLoginPage1() {
  return (
    <div>
      {/* Header - có thể reuse */}
      <header>...</header>
      
      {/* Main Content */}
      <main>
        {/* Login Form - có thể reuse */}
        <form>...</form>
        
        {/* Footer - có thể reuse */}
        <footer>...</footer>
      </main>
    </div>
  );
}
```

### **2.2. Tách Từng Component**

#### **A. Tách LoginForm**

**Tạo file:** `src/components/stitch/auth/login-form.tsx`

```tsx
"use client"; // Nếu form có state

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ... other imports

interface LoginFormProps {
  variant?: "default" | "minimal"; // Nếu có nhiều variants
  onSubmit?: (data: { email: string; password: string }) => void;
  className?: string;
}

export function LoginForm({ variant = "default", onSubmit, className }: LoginFormProps) {
  // Copy form logic từ UserLoginPage1
  // Giữ nguyên styling và structure
  
  return (
    <form className={className} onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### **B. Tách AuthLayout**

**Tạo file:** `src/components/stitch/auth/auth-layout.tsx`

```tsx
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header>...</header>
      
      {/* Main Content */}
      <main className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
          {children}
        </div>
      </main>
      
      {/* Footer */}
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
```

#### **C. Tách AuthHeader (nếu có)**

**Tạo file:** `src/components/stitch/auth/auth-header.tsx`

```tsx
import Link from "next/link";
import { Compass } from "lucide-react";

export function AuthHeader() {
  return (
    <header className="...">
      {/* Copy header từ UserLoginPage1 */}
    </header>
  );
}
```

### **2.3. Refactor UserLoginPage1**

Sau khi tách components, refactor `user-login-page-1.tsx`:

```tsx
import { AuthLayout } from "./auth/auth-layout";
import { LoginForm } from "./auth/login-form";
import { AuthHeader } from "./auth/auth-header";

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

---

## 📦 Bước 3: Tạo Template

### **3.1. Tạo Template File**

**Tạo file:** `src/components/stitch/auth/login-page-template.tsx`

```tsx
import { AuthLayout } from "./auth-layout";
import { LoginForm } from "./login-form";
import { AuthHeader } from "./auth-header";

/**
 * Template cho Login Pages
 * 
 * Usage:
 * 1. Copy file này
 * 2. Đổi tên component
 * 3. Adjust props/styling nếu cần
 */
interface LoginPageTemplateProps {
  variant?: "default" | "minimal" | "modern";
  title?: string;
  subtitle?: string;
  formVariant?: "default" | "minimal";
}

export function LoginPageTemplate({
  variant = "default",
  title = "Welcome Back",
  subtitle = "Sign in to your account",
  formVariant = "default",
}: LoginPageTemplateProps) {
  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <LoginForm variant={formVariant} />
    </AuthLayout>
  );
}
```

---

## 🔄 Bước 4: Reuse Cho Pages Còn Lại

### **4.1. Phương Pháp 1: Copy & Modify (Nhanh nhất)**

#### **Cho user_login_page_2:**

```bash
# 1. Copy file
cp src/components/stitch/user-login-page-1.tsx src/components/stitch/user-login-page-2.tsx

# 2. Mở file mới và thay đổi:
# - Component name: UserLoginPage1 → UserLoginPage2
# - Import paths nếu cần
# - Adjust styling/content khác biệt
```

**File mới:**
```tsx
import { AuthLayout } from "./auth/auth-layout";
import { LoginForm } from "./auth/login-form";

export default function UserLoginPage2() {
  return (
    <AuthLayout
      title="Welcome Back" // Có thể thay đổi
      subtitle="Sign in to continue" // Có thể thay đổi
    >
      <LoginForm variant="minimal" /> {/* Có thể thay đổi variant */}
    </AuthLayout>
  );
}
```

#### **Cho user_login_page_3 đến user_login_page_10:**

Lặp lại bước trên, chỉ thay đổi:
- Component name
- Props của AuthLayout/LoginForm (nếu có khác biệt)
- Styling cụ thể (nếu có)

### **4.2. Phương Pháp 2: Sử Dụng Script Generate**

Chạy script để generate base component:

```bash
npm run stitch:generate user_login_page_2 --template user_login_page_1
```

Script sẽ:
1. Copy `user-login-page-1.tsx` → `user-login-page-2.tsx`
2. Thay đổi component name
3. Giữ nguyên imports và structure
4. Tạo file sẵn sàng để bạn chỉnh sửa

---

## 🛠️ Script Hỗ Trợ

### **Generate Component Từ Template**

```bash
npm run stitch:generate <target-page> --from <source-page>
```

**Ví dụ:**
```bash
npm run stitch:generate user_login_page_2 --from user_login_page_1
```

Script sẽ:
1. Đọc `user-login-page-1.tsx`
2. Thay `UserLoginPage1` → `UserLoginPage2`
3. Tạo `user-login-page-2.tsx`
4. Giữ nguyên structure và imports

---

## 📝 Checklist Chi Tiết

### **Bước 1: Convert Page Đầu Tiên**
- [ ] Chạy `npm run stitch:prepare user_login_page_1`
- [ ] Convert với Cursor AI
- [ ] Lưu vào `src/components/stitch/user-login-page-1.tsx`
- [ ] Test component hoạt động

### **Bước 2: Tách Reusable Components**
- [ ] Phân tích component, tìm các phần có thể reuse
- [ ] Tạo `src/components/stitch/auth/login-form.tsx`
- [ ] Tạo `src/components/stitch/auth/auth-layout.tsx`
- [ ] Tạo `src/components/stitch/auth/auth-header.tsx` (nếu cần)
- [ ] Refactor `user-login-page-1.tsx` để dùng reusable components
- [ ] Test lại component

### **Bước 3: Tạo Template**
- [ ] Tạo `login-page-template.tsx` (optional)
- [ ] Document cách sử dụng

### **Bước 4: Reuse Cho Pages Còn Lại**
- [ ] Copy `user-login-page-1.tsx` → `user-login-page-2.tsx`
- [ ] Thay component name
- [ ] Adjust props/styling nếu cần
- [ ] Test component
- [ ] Lặp lại cho 8 pages còn lại

---

## 💡 Tips

1. **Giữ nguyên structure:** Chỉ thay đổi content, không thay đổi layout
2. **Dùng props:** Nếu có khác biệt nhỏ, dùng props thay vì tạo component mới
3. **Test từng bước:** Test sau mỗi component được tách
4. **Commit thường xuyên:** Commit sau mỗi reusable component được tạo

---

## 🆘 Troubleshooting

### **Lỗi: Component không hiển thị**

- Kiểm tra imports
- Kiểm tra component name đã đổi chưa
- Kiểm tra file path

### **Lỗi: Styling khác nhau**

- Kiểm tra Tailwind classes
- Đảm bảo custom colors đã được thêm vào `tailwind.config.ts`

### **Lỗi: Props không match**

- Kiểm tra interface của reusable component
- Đảm bảo props được pass đúng

---

**Bắt đầu ngay với:** `npm run stitch:prepare user_login_page_1` 🚀



