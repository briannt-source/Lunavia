# 🎨 Sea You Travel - Lunavia Design System

## Brand Identity

### Logo
- **Primary Logo**: Sea You Travel với icon SY và waves
- **Colors**: Blue (#3B82F6) - Primary brand color
- **Usage**: 
  - Full logo với text cho headers
  - Icon only cho favicon và small spaces
  - Variants: light (white text) và dark (dark text)

### Color Palette

#### Primary Colors
- **Sea Blue**: `#3B82F6` (hsl(217, 91%, 60%))
  - Primary actions, buttons, links
  - Brand identity
- **Sea Blue Dark**: `hsl(217, 91%, 40%)`
  - Hover states, active states
- **Sea Blue Light**: `hsl(217, 91%, 95%)`
  - Backgrounds, subtle highlights
- **Sea Dark**: `hsl(217, 30%, 15%)`
  - Text on light backgrounds

#### Neutral Colors
- **Slate 50-900**: For text, borders, backgrounds
- **White**: Primary background
- **Black**: Text on light backgrounds

#### Semantic Colors
- **Success**: Green (for success states)
- **Warning**: Amber (for warnings)
- **Error**: Red (for errors)
- **Info**: Blue (for information)

## Typography

### Font Family
- **Primary**: Inter (sans-serif)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Font Sizes
- **Display**: 3xl-6xl (Hero sections)
- **Heading 1**: 2xl-3xl (Page titles)
- **Heading 2**: xl-2xl (Section titles)
- **Heading 3**: lg-xl (Subsection titles)
- **Body**: base (16px) - Primary text
- **Small**: sm (14px) - Secondary text
- **Tiny**: xs (12px) - Labels, captions

## Spacing

### Standard Spacing Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

## Components

### Buttons

#### Primary Button
```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Primary Action
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
  Secondary Action
</Button>
```

#### Ghost Button
```tsx
<Button variant="ghost" className="text-slate-700 hover:text-blue-600">
  Ghost Action
</Button>
```

### Cards
- **Background**: White
- **Border**: `border-slate-100` or `border-slate-200`
- **Shadow**: `shadow-sm` (default), `shadow-md` (hover)
- **Radius**: `rounded-xl` or `rounded-2xl`

### Inputs
- **Border**: `border-slate-300`
- **Focus**: `ring-blue-500`
- **Radius**: `rounded-lg`

## Layout Patterns

### Dashboard Layout
- **Sidebar**: Fixed, 288px width (72 * 4)
- **Main Content**: Margin left 288px on desktop
- **Background**: Gradient from `blue-50` to `white`

### Page Header
- **Title**: Large, bold, `text-slate-900`
- **Description**: Medium, `text-slate-600`
- **Spacing**: `mb-6` or `mb-8`

### Section Spacing
- **Between sections**: `py-16` or `py-20`
- **Container padding**: `px-4` (mobile), `px-6` (desktop)

## Design Principles

1. **Consistency**: Use the same components and patterns throughout
2. **Clarity**: Clear hierarchy and spacing
3. **Accessibility**: Sufficient contrast, readable fonts
4. **Modern**: Clean, minimal, professional
5. **Brand Identity**: Sea You Travel blue as primary color

## Usage Guidelines

### When to use Blue
- Primary actions (buttons, links)
- Active states
- Brand elements (logo, highlights)
- Important information

### When to use Slate/Gray
- Body text
- Borders
- Secondary information
- Backgrounds

### When to use White
- Card backgrounds
- Main content areas
- Contrast with colored backgrounds

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile First
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)

## Animation & Transitions

### Standard Transitions
- **Duration**: 200-300ms
- **Easing**: `ease-out` or `ease-in-out`
- **Properties**: `transition-colors`, `transition-shadow`, `transition-transform`

### Hover States
- Buttons: Darker shade of primary color
- Cards: Slight shadow increase
- Links: Color change to blue












