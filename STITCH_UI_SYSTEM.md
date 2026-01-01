# STITCH UI SYSTEM

This document describes the UI extraction system and conventions used when migrating Stitch HTML pages into the Next.js 15 app. Follow these rules strictly: one primitive/composite at a time, preserve Tailwind classes exactly on pages, and stop after one replacement for verification.

## Philosophy

- Primitive-first: extract the smallest reusable pieces (primitives) before composing larger UI pieces (composites). Keep primitives narrowly focused and portable.
- One-usage verification: after creating a component, replace exactly one usage on one page and wait for approval before reusing or updating additional pages.
- Preserve markup: page Tailwind classes and structure must be preserved as-is during replacement — do not refactor page logic or data.
- Server-by-default: components are server components by default; only mark `use client` when strictly necessary.

## Component taxonomy

- Primitives: tiny, re-usable building blocks that encapsulate a single visual pattern or HTML element. Examples: `Button`, `Badge`, `IconWrapper`, `EmptyState`, `Pagination`, `Table`, `StatCard`, `FormField`.
- Composites: composed UI sections built from primitives (and sometimes other composites). Examples: `Header`, `Footer`, `FilterBar`, `CardGrid`, `Hero`, `RoleCard`, `DashboardStats`.
- Page: the full page file under `src/app/.../page.tsx` that wires data + composites. Pages should remain mostly unchanged except for single verified replacements.

## Server vs Client rules

- Default: components are server components (no `use client`) unless they require client-side interactivity.
- Client-only reasons: local state (hooks), event-driven interactivity (drag/drop), browser-only APIs, or 3rd-party client-only components. Keep client surface minimal.
- When you mark a component `use client`:
  - Keep it isolated to the smallest subtree that needs interactivity.
  - Prefer receiving callbacks/props from parent pages rather than coupling to global state.

## Extraction checklist (use before each extraction)

1. Identify repeated pattern in page(s). Confirm it matches a primitive or composite to extract.
2. Create component file under the correct folder (`src/components/ui` for primitives, `src/components/layout` or `src/components/filters` for composites).
3. Component API: keep props minimal and declarative (visual props, children, optional slots). Default to server component.
4. Preserve Tailwind classes: pages keep their existing classes. If moving markup into the component, pass className through and ensure classes remain identical.
5. Replace exactly one usage on one page. Do not change data or logic — only swap markup to import+usage.
6. Add or update imports only in that single page file.
7. Run quick lint/type check (if available) and open the page for visual verification.
8. Stop and request user verification before scaling the component to other pages.

## Naming & folder conventions

- Folder layout:
  - `src/components/ui` — primitives (small, presentation-only)
  - `src/components/form` — form-related primitives (FormField, Input wrappers)
  - `src/components/layout` — page-level composites (Header, Footer, CardGrid)
  - `src/components/filters` — filter/search related composites
  - `src/components/icons` — icon wrappers or shared SVGs (if needed)
- File names: kebab-case matching component name (e.g., `stat-card.tsx`, `empty-state.tsx`).
- Exports: default export for the main component; keep API named via prop shapes in TypeScript.
- Props: accept `className?: string` where visual classes may vary; forward `className` to the root element.

## Do / Don't examples

Do:

- Create a small `EmptyState` primitive and replace one usage on `browse-tours-page` with `<EmptyState title={...} description={...} />` while preserving original Tailwind classes.
- Default to server components and only add `use client` when the component needs hooks or browser APIs.
- Keep the component API minimal and pass visual elements (icons, actions) as props/children.

Don't:

- Do not refactor page logic or change data fetching when extracting a UI primitive.
- Do not change Tailwind classes on the page during replacement — if classes must move into the component, pass them through and preserve exact class strings.
- Do not replace multiple usages or multiple pages in one change — stop after one replacement and request verification.

## Quick checklist for reviewers

- Verify Tailwind classes are visually identical after replacement.
- Confirm no data or state behavior changed.
- Ensure component defaults to server component unless there is a clear client-side need.
- Approve the single replacement before wider refactor.

---

File created by the migration agent to standardize UI extraction. For questions or exceptions, open an issue in the repo and reference this file.
