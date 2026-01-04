# 🚀 LUNAVIA Version 2 - Rebuild Plan

## Mục tiêu
- **Database v2**: Cải thiện schema, tối ưu performance
- **Frontend v2**: UI/UX mới hoàn toàn, không phụ thuộc Stitch
- **Backend**: Giữ nguyên APIs hiện tại (đã tốt)
- **Deploy**: Build thành công, không lỗi

## Database Schema v2

### Cải thiện chính:
1. **Indexes tối ưu** cho queries thường dùng
2. **Composite indexes** cho search/filter
3. **Soft deletes** cho audit trail
4. **Full-text search** support
5. **Performance optimizations**

### Schema giữ nguyên:
- Tất cả models hiện tại
- Tất cả relationships
- Tất cả enums
- Business logic

## Frontend v2 Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── operator/
│   │   ├── guide/
│   │   └── admin/
│   ├── (marketplace)/            # Public marketplace
│   │   ├── tours/
│   │   └── guides/
│   └── api/                      # API routes (giữ nguyên)
│
├── components/                    # React Components
│   ├── ui/                       # Base UI components (mới)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── features/                 # Feature-specific components
│   │   ├── tours/
│   │   ├── wallet/
│   │   ├── applications/
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── dashboard-layout.tsx
│   └── shared/                   # Shared components
│       ├── avatar.tsx
│       ├── status-badge.tsx
│       └── ...
│
├── lib/                          # Utilities
│   ├── api-client.ts            # API client
│   ├── auth.ts                  # Auth utilities
│   └── utils.ts                 # Helpers
│
└── styles/                       # Global styles
    └── globals.css
```

## UI Design System

### Color Palette
```css
Primary: Blue (#3B82F6)
Secondary: Purple (#8B5CF6)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Error: Red (#EF4444)
Neutral: Gray scale
```

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Code: JetBrains Mono

### Components
- Modern, clean design
- Consistent spacing (4px grid)
- Smooth animations
- Responsive mobile-first
- Dark mode support

## Migration Strategy

### Phase 1: Database (1-2 hours)
1. Review và optimize schema
2. Add indexes
3. Create migration
4. Test

### Phase 2: UI Components (2-3 hours)
1. Build base UI library
2. Create layout components
3. Build feature components
4. Test components

### Phase 3: Pages (3-4 hours)
1. Auth pages (login, register)
2. Dashboard pages (operator, guide, admin)
3. Marketplace pages
4. Tour detail pages
5. Application pages

### Phase 4: Integration (1-2 hours)
1. Connect to existing APIs
2. Test all flows
3. Fix bugs
4. Optimize

### Phase 5: Polish (1 hour)
1. Responsive design
2. Animations
3. Loading states
4. Error handling

## Success Criteria
- ✅ `npm run build` passes
- ✅ Vercel deployment succeeds
- ✅ All features work
- ✅ UI/UX modern và professional
- ✅ Mobile responsive
- ✅ Fast performance

## Timeline
**Total: 8-12 hours**

---

**Let's build Lunavia v2! 🚀**


