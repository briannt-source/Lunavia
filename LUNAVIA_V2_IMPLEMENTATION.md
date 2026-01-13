# 🚀 LUNAVIA v2 Implementation Guide

## Strategy

### Phase 1: Clean Structure ✅
- Giữ nguyên UI components hiện tại (shadcn/ui đã tốt)
- Tạo structure mới cho pages
- Loại bỏ hoàn toàn `(stitch)` folder

### Phase 2: Rebuild Core Pages
1. **Auth Pages** (login, register)
2. **Dashboard Pages** (operator, guide, admin)
3. **Marketplace Pages** (browse tours, tour detail)
4. **Application Pages** (apply, manage)
5. **Wallet Pages** (balance, transactions)
6. **Admin Pages** (verification, disputes)

### Phase 3: Integration
- Connect to existing APIs
- Test all flows
- Fix bugs

## New Structure

```
src/app/
├── (auth)/              # Auth pages - NEW
│   ├── login/
│   └── register/
├── (dashboard)/         # Dashboard pages - REBUILD
│   ├── operator/
│   ├── guide/
│   └── admin/
├── (marketplace)/       # Public marketplace - REBUILD
│   ├── tours/
│   └── guides/
└── api/                 # API routes - KEEP AS IS
```

## Implementation Order

1. ✅ Auth pages (login, register)
2. ✅ Dashboard layouts
3. ✅ Operator dashboard
4. ✅ Guide dashboard
5. ✅ Admin dashboard
6. ✅ Tour marketplace
7. ✅ Tour detail
8. ✅ Application flow
9. ✅ Wallet pages
10. ✅ Admin pages

## Notes

- **NO** stitch imports
- **NO** stitch components
- **USE** existing shadcn/ui components
- **USE** existing APIs
- **MODERN** UI/UX design
- **RESPONSIVE** mobile-first







