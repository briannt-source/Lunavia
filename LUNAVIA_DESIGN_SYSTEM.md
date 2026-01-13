# 🎨 LUNAVIA Design System - Stitch Integration Guide

## Color Palette

### Primary Colors

```css
/* Main Brand Colors */
--lunavia-primary: #0077B6      /* Primary blue - buttons, links, highlights */
--lunavia-secondary: #003049    /* Secondary/dark - headers, important text */
--lunavia-accent: #001D3D       /* Accent/darkest - deep backgrounds, emphasis */
--lunavia-light: #E6F2F8        /* Light tint - backgrounds, cards */
--lunavia-lighter: #F0F8FB      /* Lighter tint - subtle backgrounds */
```

### Usage in Tailwind

```tsx
// Primary color
<div className="bg-sea-blue text-white">...</div>
// hoặc
<div className="bg-lunavia-primary text-white">...</div>

// Dark backgrounds
<div className="bg-sea-blue-dark text-white">...</div>
<div className="bg-lunavia-secondary text-white">...</div>

// Accent
<div className="bg-sea-dark text-white">...</div>
<div className="bg-lunavia-accent text-white">...</div>

// Light backgrounds
<div className="bg-sea-blue-light">...</div>
<div className="bg-lunavia-light">...</div>
```

---

## Stitch Design Patterns

### Available Stitch Components

Các components Stitch đã có sẵn trong `src/components/stitch/`:

1. **Welcome Page Components:**
   - `lunavia-welcome-page.tsx` - Main welcome page
   - `welcome/welcome-header.tsx` - Header component
   - `welcome/welcome-footer.tsx` - Footer component
   - `welcome/role-card.tsx` - Role selection card
   - `welcome/feature-card.tsx` - Feature showcase card

### Cách sử dụng Stitch Designs

#### 1. Copy HTML/CSS từ Stitch

Khi có code từ Stitch (HTML/CSS):
1. Convert HTML → JSX (class → className, onclick → onClick)
2. Convert CSS classes → Tailwind classes
3. Map colors sang Lunavia color palette
4. Sử dụng shadcn/ui components thay vì custom components

#### 2. Color Mapping

```css
/* Stitch colors → Lunavia colors */
Stitch Blue → #0077B6 (lunavia-primary)
Stitch Dark Blue → #003049 (lunavia-secondary)
Stitch Darkest → #001D3D (lunavia-accent)
```

#### 3. Component Patterns

**Buttons:**
```tsx
// Primary button
<Button className="bg-sea-blue hover:bg-sea-blue-dark text-white">
  Click me
</Button>

// Secondary button
<Button variant="outline" className="border-sea-blue-dark text-sea-blue-dark hover:bg-sea-blue-light">
  Secondary
</Button>
```

**Cards:**
```tsx
<Card className="border-sea-blue-light bg-white shadow-sm">
  <CardHeader>
    <CardTitle className="text-sea-blue-dark">Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**Gradients:**
```tsx
<div className="bg-gradient-to-br from-sea-blue via-sea-blue-dark to-sea-dark">
  ...
</div>
```

---

## Design Principles

### 1. Color Usage

- **Primary (#0077B6)**: Buttons, links, active states, CTAs
- **Secondary (#003049)**: Headers, important text, navigation
- **Accent (#001D3D)**: Deep backgrounds, emphasis, dark mode
- **Light (#E6F2F8)**: Card backgrounds, subtle sections
- **Lighter (#F0F8FB)**: Page backgrounds, subtle highlights

### 2. Typography

- **Headings**: Use `text-sea-blue-dark` hoặc `text-sea-dark`
- **Body**: Default foreground color
- **Links**: `text-sea-blue hover:text-sea-blue-dark`

### 3. Spacing

- Follow Tailwind spacing scale
- Use consistent padding/margins
- Card padding: `p-6` hoặc `p-8`
- Section spacing: `py-12` hoặc `py-16`

### 4. Components

- Use shadcn/ui components as base
- Customize với Lunavia colors
- Maintain consistency với existing pages

---

## Example: Converting Stitch Page

### Before (Stitch HTML):
```html
<div class="container">
  <button class="btn-primary" style="background: #0077B6;">Click</button>
</div>
```

### After (Lunavia React):
```tsx
<div className="container mx-auto px-4">
  <Button className="bg-sea-blue hover:bg-sea-blue-dark text-white">
    Click
  </Button>
</div>
```

---

## Quick Reference

### Common Patterns

**Hero Section:**
```tsx
<section className="bg-gradient-to-b from-sea-blue-light to-white py-20">
  <div className="container mx-auto px-4">
    <h1 className="text-4xl font-bold text-sea-blue-dark">Title</h1>
  </div>
</section>
```

**Feature Cards:**
```tsx
<Card className="border-sea-blue-light hover:border-sea-blue transition-colors">
  <CardHeader>
    <CardTitle className="text-sea-blue-dark">Feature</CardTitle>
  </CardHeader>
  <CardContent>
    Description
  </CardContent>
</Card>
```

**Buttons:**
```tsx
// Primary
<Button className="bg-sea-blue hover:bg-sea-blue-dark text-white">

// Outline
<Button variant="outline" className="border-sea-blue text-sea-blue hover:bg-sea-blue-light">

// Ghost
<Button variant="ghost" className="text-sea-blue-dark hover:bg-sea-blue-light">
```

---

## Integration với Existing Pages

Khi code pages mới:
1. Sử dụng Lunavia color palette
2. Follow existing page patterns (xem `src/app/page.tsx`, `src/app/auth/signin/page.tsx`)
3. Use shadcn/ui components
4. Maintain responsive design
5. Follow Tailwind best practices

---

**Colors đã được cập nhật trong Tailwind config và globals.css!** 🎨







