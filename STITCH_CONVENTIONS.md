# STITCH_CONVENTIONS.md v1.0

> Chuẩn hoá quy trình convert UI từ **Google Stitch → Next.js App Router**
>
> **Source of truth:** Component `LunaviaWelcomePage`

---

## 🎯 Mục tiêu

* Giữ **UI giống Stitch 100%**
* Code **sạch – dễ maintain – scale được 50+ pages**
* Tránh over‑engineering từ AI / Cursor
* Team (kể cả intern) làm **đồng nhất một chuẩn**

---

## 1️⃣ Nguyên tắc cốt lõi (CORE PRINCIPLES)

### 1.1 Stitch = UI input, KHÔNG phải architecture

* Stitch quyết định **layout & design**
* App quyết định **structure & performance**

➡️ Không bao giờ thay đổi kiến trúc app chỉ để "giống Stitch hơn".

---

## 2️⃣ Server vs Client Component (RẤT QUAN TRỌNG)

### ✅ MẶC ĐỊNH: Server Component

**KHÔNG dùng `use client`** trừ khi:

* Có `useState`, `useEffect`
* Có form submit, modal, dropdown interactive
* Có logic client rõ ràng

### ❌ KHÔNG ĐƯỢC

* Thêm `use client` chỉ vì có `<button>`
* Thêm `use client` theo thói quen

---

## 3️⃣ Styling & Tailwind CSS

### 3.1 Giữ nguyên Tailwind từ Stitch

* **KHÔNG refactor class nếu không cần**
* Không đổi layout chỉ để "đẹp code hơn"

### 3.2 Custom colors

* Nếu Stitch dùng màu custom → **thêm vào `tailwind.config.ts`**
* Ví dụ:

  * `background-light`
  * `background-dark`
  * `surface-dark`
  * `border-dark`

❌ Không replace bừa sang màu Tailwind default

---

## 4️⃣ shadcn/ui – DÙNG CÓ CHỌN LỌC

### ✅ ĐƯỢC dùng khi có ý nghĩa UI

* `<button>` → `Button`
* `<input>` → `Input`
* `<select>` → `Select`
* `<textarea>` → `Textarea`
* Modal / Dialog → `Dialog`

### ❌ KHÔNG ĐƯỢC

* Ép layout `<div>` → `Card`
* Bọc section chỉ để "trông giống component"
* Dùng Tabs nếu chỉ là layout tĩnh

📌 **Rule:** nếu chỉ là layout → giữ `div + Tailwind`

---

## 5️⃣ Icons (BẮT BUỘC)

### ❌ KHÔNG dùng

* Material Icons
* material-symbols-outlined

### ✅ BẮT BUỘC dùng

* `lucide-react`

### Mapping chuẩn

| Material          | Lucide       |
| ----------------- | ------------ |
| travel_explore    | Compass      |
| business_center   | Building2    |
| badge             | Award        |
| gavel             | Scale        |
| verified_user     | Shield       |
| handshake         | Users        |
| check_circle      | CheckCircle2 |
| domain            | Building2    |
| person_pin_circle | MapPin       |

---

## 6️⃣ Images

### Quy tắc

* `<img>` → `next/image`
* Giai đoạn đầu có thể giữ URL online
* Page quan trọng → copy ảnh vào `/public`

❌ Không dùng `<img>` raw trong component

---

## 7️⃣ Links & Routing

* Internal link → `next/link`
* External link → `<a>`
* Không để `href="#"` trong code final

---

## 8️⃣ Naming & Folder Convention

### Component

```
src/components/stitch/lunavia-welcome-page.tsx
```

* File: `kebab-case`
* Component: `PascalCase`

### Page

```
src/app/welcome/page.tsx
```

---

## 9️⃣ Imports & Structure

* Sử dụng path alias `@/`
* Không import thừa
* Group imports rõ ràng

---

## 🔟 Checklist BẮT BUỘC sau khi convert

* [ ] Server Component (không `use client` nếu không cần)
* [ ] Không Material Icons
* [ ] Không Card/Tabs dư thừa
* [ ] Dùng `next/image`, `next/link`
* [ ] Không lỗi TypeScript
* [ ] UI giống Stitch

---

## 🚨 Lỗi phổ biến cần tránh

❌ Over‑engineering từ Cursor
❌ Thêm UI components không cần thiết
❌ Client hóa toàn page
❌ Mỗi page một style khác nhau

---

## ✅ Kết luận

> **STITCH_CONVENTIONS.md là luật.**
> **Cursor prompt chỉ là công cụ để áp dụng luật đó.**

Mọi page convert từ Stitch **PHẢI tuân theo tài liệu này**.

---

📌 Version: v1.0
📌 Reference: LunaviaWelcomePage



