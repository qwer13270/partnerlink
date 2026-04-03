# HomeKey KOL Dashboard — Design System

Reference for all established UI patterns across the KOL dashboard. New pages should follow these conventions to stay visually consistent.

---

## Foundations

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg-linen` | warm linen `#f7f3ee` + subtle grain texture | **Standard card background** — CSS class in globals.css. Replaces bg-stone-50. |
| `bg-stone-50/50` | stone-50 at 50% opacity | Empty-state dashed cards only — do not use for solid cards |
| `bg-background` | CSS var / white | Page background, profile card |
| `bg-white` | pure white | Highest-emphasis action cards (e.g. 查看公開頁面) |
| `bg-foreground` | near-black | Dark emphasis sections — banners, primary CTAs |
| `text-foreground` | near-black | Body text |
| `text-muted-foreground` | muted grey | Labels, secondary info |
| `border-foreground/[0.08]` | near-black 8% | Card borders — subtle and consistent |
| `border-foreground/10` | near-black 10% | Section dividers |
| `text-emerald-600` | green | Positive trend indicators (↑) |
| `text-red-500` | red | Negative trend indicators (↓) |
| `text-amber-700` | amber | Pending / warning states |

### Typography

| Element | Classes | Notes |
|---------|---------|-------|
| Page heading | `text-3xl font-serif` | No font-weight modifier — let serif weight speak |
| Section label | `text-xs uppercase tracking-[0.4em] text-muted-foreground` | Always screaming-caps with wide tracking |
| Sub-label (tighter) | `text-xs uppercase tracking-[0.3em] text-muted-foreground` | Used inside cards |
| Display number | `text-[3rem] leading-none font-serif text-foreground` | Stat strip hero numbers |
| Large number | `text-4xl font-serif` | Commission page summaries |
| Medium number | `text-2xl font-serif` | Profile stats, link conv-rate |
| Small number | `text-xl font-serif` | Secondary inline numbers |
| Body text | `text-sm` | Application names, card bodies |
| Meta / date | `text-xs text-muted-foreground` | Sub-row info |
| Micro label | `text-[0.6rem] text-muted-foreground` | Tiny helper text inside step tiles |
| Mono | `font-mono text-xs text-muted-foreground` | Usernames (@handle), IDs |

**Rule**: Never use `font-semibold` or `font-bold` on display text. Weight comes from the serif face itself.

---

## Component Patterns

### Floating Card (primary container)

Used for stat strips, list containers, link cards, commission summaries.

```tsx
<div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md">
  {/* content */}
</div>
```

- `rounded-2xl` — consistent corner radius
- `border-foreground/[0.08]` — barely-there border for definition
- `bg-stone-50` — warm lift from page background
- `shadow-sm` — low-key elevation; `hover:shadow-md` adds depth on hover
- `overflow-hidden` — clips child elements cleanly

### Stat Strip (3-up grid)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
  {stats.map(s => (
    <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm px-7 py-6 transition-shadow duration-300 hover:shadow-md">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{s.label}</p>
      <p className="text-[3rem] leading-none font-serif text-foreground mt-3 tracking-tight">{s.value}</p>
      <p className={`text-xs mt-2.5 tracking-wide ${
        s.sub.startsWith('↑') ? 'text-emerald-600' :
        s.sub.startsWith('↓') ? 'text-red-500' :
        'text-muted-foreground'
      }`}>{s.sub}</p>
    </div>
  ))}
</div>
```

### Dark Banner (full-width emphasis)

Used for resume completion notification — high visibility.

```tsx
<div className="relative overflow-hidden rounded-xl bg-foreground">
  {/* Grain texture */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 opacity-[0.045]"
    style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: '256px 256px',
    }}
  />
  {/* Radial glow (top-right) */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-[0.05]"
    style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
  />
  <div className="relative z-10 px-7 py-6">
    {/* content in text-background colors */}
  </div>
</div>
```

**Text colors inside dark banner**: use `text-background/90`, `text-background/35`, `bg-background/[0.08]`, etc.

### List Container with Dividers

```tsx
<div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.07]">
    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">標題</p>
  </div>
  {/* Rows */}
  <div className="divide-y divide-foreground/[0.06]">
    {items.map(item => (
      <div className="flex items-center gap-4 px-6 py-5 hover:bg-foreground/[0.02] transition-colors duration-200">
        {/* row content */}
      </div>
    ))}
  </div>
  {/* Footer */}
  <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.07]">
    {/* footer content */}
  </div>
</div>
```

### Status Badges

Pending / Approved / Rejected — three consistent patterns:

```tsx
const STATUS_CFG = {
  pending:  { label: '審核中', dot: 'bg-amber-400',   text: 'text-amber-700'   },
  approved: { label: '已核准', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  rejected: { label: '未通過', dot: 'bg-red-400',     text: 'text-red-600'     },
}

// Usage — dot + label
<span className={`flex items-center gap-1.5 text-[0.6rem] uppercase tracking-widest ${cfg.text}`}>
  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
  {cfg.label}
</span>
```

Commission-specific badges (filled pill):

```tsx
const STATUS_CFG = {
  pending:   { label: '待入帳', color: 'text-amber-700 border-amber-200 bg-amber-50'       },
  confirmed: { label: '已確認', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  paid:      { label: '已入帳', color: 'text-blue-700 border-blue-200 bg-blue-50'           },
}
<span className={`text-xs uppercase tracking-widest px-1.5 py-px border ${cfg.color}`}>
  {cfg.label}
</span>
```

### Action Cards (2-up grid — used on /kol/resume)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Light card */}
  <Link href="..." className="group relative overflow-hidden rounded-xl border border-foreground/[0.09] bg-white px-6 py-7 transition-all duration-300 hover:border-foreground/20 hover:bg-stone-50">
    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.04] text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground transition-colors duration-200">
      <Eye className="h-4 w-4" />
    </div>
    <p className="text-sm font-medium leading-snug text-foreground">查看公開頁面</p>
    <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">副標題說明文字</p>
    <div className="mt-6 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-foreground/50 transition-colors duration-200">
      <span>前往</span><span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
    </div>
  </Link>

  {/* Dark card (primary CTA) */}
  <Link href="..." className="group relative overflow-hidden rounded-xl border border-foreground bg-foreground px-6 py-7 transition-all duration-300 hover:bg-foreground/90">
    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-background/20 bg-background/[0.07] text-background/60 group-hover:bg-background/[0.12] group-hover:text-background/80 transition-colors duration-200">
      <Pencil className="h-4 w-4" />
    </div>
    <p className="text-sm font-medium leading-snug text-background">編輯履歷</p>
    <p className="mt-2 text-[0.72rem] leading-relaxed text-background/50">副標題說明文字</p>
    <div className="mt-6 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-background/30 group-hover:text-background/50 transition-colors duration-200">
      <span>前往</span><span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
    </div>
  </Link>
</div>
```

### Expandable Row (accordion)

Used in commissions and applications for detail panels.

```tsx
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-foreground/[0.08] bg-foreground/[0.015] divide-y divide-foreground/[0.06]">
        {/* expanded content */}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Page Layout

### Standard Page Header

```tsx
<motion.div variants={fadeUp} className="border-b border-foreground/10 pb-8">
  <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground mb-4">
    KOL 後台 · 頁面名稱
  </p>
  <div className="flex items-end justify-between gap-4">
    <h1 className="text-3xl font-serif">頁面標題</h1>
    {/* optional right-side CTA buttons */}
  </div>
</motion.div>
```

### Page Spacing

```tsx
<motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
  {/* sections separated by space-y-8 */}
</motion.div>
```

---

## Animation

### Entrance Variants

```tsx
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}
```

Apply to page root: `<motion.div variants={stagger} initial="hidden" animate="visible">`

Apply to each section: `<motion.div variants={fadeUp}>`

For custom-indexed items (not stagger children):

```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}
// usage:
<motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
```

---

## Sidebar

Order and icons (defined in `KOLDashboardLayout.tsx`):

| # | Route | Label | Icon |
|---|-------|-------|------|
| 1 | `/kol/home` | 首頁 | `Home` |
| 2 | `/kol/resume` | 我的履歷 | `ScrollText` |
| 3 | `/kol/links` | 我的推廣 | `Link2` |
| 4 | `/kol/applications` | 商案申請 | `ClipboardList` |
| 5 | `/kol/commissions` | 佣金管理 | `BadgeDollarSign` |

---

## Apple-Inspired Touches (applied to all KOL pages)

The following principles were intentionally adopted to improve visual clarity without changing the overall theme:

1. **Individual floating cards** — each stat gets its own `rounded-2xl bg-stone-50 shadow-sm` card instead of flat bordered strips.
2. **Readable label sizes** — all labels are `text-xs`, never sub-10px micro-sizes. First glance should be immediate.
3. **Color-coded signals** — trends and statuses use semantic color (`text-emerald-600`, `text-amber-700`, `text-red-500`), not monochrome text.
4. **No font-weight inflation** — display numbers and headings use `font-serif` without `font-semibold`. Serif weight is enough.
5. **Hover elevation** — cards transition from `shadow-sm` → `shadow-md` on hover for tactile feedback.
6. **Consistent spacing within cards** — `px-5 py-6` or `px-7 py-6` depending on card width; never dense.

---

## Data Patterns

All data is currently mock/hardcoded (investor demo phase). Data lives in:

- `src/data/` — resume mock data, default resume builder
- `src/hooks/useMockData.ts` — React hooks returning typed mock objects (`AffiliateLink`, etc.)
- `src/lib/types.ts` — shared TypeScript types

When a new page needs data, add mock data in `src/data/` and a corresponding hook in `src/hooks/useMockData.ts` so it can be swapped for real API calls later.
