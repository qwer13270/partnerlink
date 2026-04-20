# PartnerLink Landing — Design System

Reference for the landing page theme (`src/app/page.tsx` + `src/components/landing/*`). Use this when refactoring other pages (dashboards, auth, merchant/KOL sections) to match the same visual language.

---

## 1. Aesthetic direction

**Theme name**: _Liquid-glass network / infrastructure editorial._

One-line positioning: a dark, high-contrast editorial surface where translucent glass chips float over an animated "network" backdrop, bilingual typography (English serif italics + Traditional Chinese sans) carrying the voice.

Aesthetic pillars:
- **Dark, not black-flat** — true black `#000` as canvas, but depth built from radial glows, gradient meshes, faint grids, and scan beams. Never a single solid dark panel without atmosphere.
- **Liquid glass as the primary surface** — almost every card, chip, button, and badge uses the shared `.liquid-glass` / `.liquid-glass-strong` utilities (blurred, saturated, gradient-masked border).
- **Editorial typography** — italic serif display (`font-heading`) paired with a light sans body (`font-body`). Mixed-language headings alternate between the two fonts mid-sentence.
- **Network / data motif** — SVG node-graph backdrops (`HeroNetworkBG`, `CtaNetworkBG`, `StatsBG`), scroll-linked arc paths (`ScrollArc`), scan beams on the Trusted By marquee. Motion is always "flow through a system," never "bouncy."
- **Restrained cool accents** — icy blue-whites (`rgba(180,220,255,*)`, `#7aa8ff`, `#6497ff`) on gray text. No saturated brand colors, no warm tones on this page.

---

## 2. Color palette (landing-scoped)

Landing uses its own palette; the app-level `:root` variables (`--background: #faf9f6` cream, etc.) are the _other_ theme (Kanzo editorial) used elsewhere. Do not mix.

| Token | Value | Usage |
|-------|-------|-------|
| Canvas | `#000` | Page background, section fades-to-black |
| Primary text | `#ffffff` | Headings |
| Body text | `rgba(255,255,255,0.65–0.90)` | Paragraphs, links |
| Secondary text | `rgba(255,255,255,0.40–0.60)` | Captions, eyebrows, footer |
| Tertiary text | `rgba(255,255,255,0.25–0.35)` | Tick marks, decorative |
| Glass fill | `rgba(120,170,255,0.06)` | `.liquid-glass` background |
| Glass border | `rgba(200,220,255,0.15–0.50)` gradient | `.liquid-glass::before` |
| Accent blue | `rgba(140,200,255,*)` / `#7aa8ff` / `#6497ff` | Glows, scan beams, progress bars, wordmark gradient |
| Inverse CTA | `#fff` bg + `#000` text | Primary button (signup) |

Hex references to keep: `#dbeafe`, `#7aa8ff`, `#6497ff` (wordmark gradient stops).

---

## 3. Typography

Two variable fonts loaded via `next/font`:
- `--font-heading` → Instrument Serif (fallback) — display, always italic in hero-style callouts
- `--font-body` → Barlow (fallback) — everything else
- Plus Traditional Chinese equivalents: `--font-serif-tc`, `--font-sans-tc`

### Rules of thumb

| Role | Size | Weight | Style | Notes |
|------|------|--------|-------|-------|
| Hero H1 | `text-6xl → text-[5.5rem]` | default (serif) | italic | `leading-[0.8]`, centered |
| Section H2 | `text-4xl → text-6xl` | default | mixed — regular + italic inline `<span>` for emphasis | `leading-[1.05–1.1]`, tracking-tight |
| Stats number | `text-4xl → text-6xl` | default | italic | `leading-[0.9]` |
| Eyebrow / tag | `text-[10–11px]` | default | uppercase | `tracking-[0.25em–0.4em]`, sits inside `.liquid-glass` pill |
| Body paragraph | `text-sm md:text-base` | `font-light` | — | `text-white/65–80` |
| UI label / nav | `text-sm` | `font-medium` | — | `font-body` |
| Micro / mono | `text-[9px]–[11px]` | — | uppercase | `font-mono`, `tracking-[0.2em+]` |

### Bilingual heading idiom

Mid-sentence font/style switch. Always use Chinese as roman, English as italic serif span:

```jsx
<h2 className="font-heading text-white tracking-tight leading-[1.1] text-4xl md:text-5xl lg:text-6xl">
  常見 <span className="italic">問題</span>
</h2>
```

Or English roman → italic:

```jsx
Connect Brands & <BlurText text="Creators" className="italic" />
```

Both are signature — keep one per section.

---

## 4. Core surface primitives

Defined in `src/app/globals.css` around line 718+. **Do not redeclare locally.**

### `.liquid-glass`
- Translucent tinted fill, `backdrop-filter: blur(14px) saturate(160%)`
- Gradient-masked hairline border via `::before`
- `position: relative` and `overflow: hidden` baked in — see Tailwind v4 caveat below

### `.liquid-glass-strong`
- Heavier blur (`50px`), brighter border, drop shadow
- Use for navbar pill, primary CTAs, preloader central chip

### When to use which
- **Glass** (light): passive cards, eyebrow pills, secondary buttons, accordion items, stats container.
- **Glass-strong**: anything elevated — nav pill, primary action buttons, feature icons.
- **Solid white**: the single highest-affordance CTA (`bg-white text-black`). Use exactly once per view.

### ⚠️ Tailwind v4 specificity caveat
`.liquid-glass` is declared unlayered, so it **beats Tailwind utility classes**. If you need positioning on a `.liquid-glass` element, override with `!`:

```jsx
className="!absolute top-8 right-8 inline-flex w-fit liquid-glass ..."
```

See `design-file-integration` skill for the full write-up.

---

## 5. Layout conventions

- **Max widths**: sections use `max-w-7xl mx-auto` (1280px); dense content sections `max-w-6xl` or `max-w-4xl`.
- **Horizontal padding**: `px-6 md:px-12 lg:px-20` — keep consistent across sections.
- **Vertical rhythm**: section spacing `py-28` → `py-32` → `py-40`. Hero-adjacent bigger, dense comparison sections smaller.
- **Section boundaries**: fade-to-black gradients top and bottom (`height: 200`, `linear-gradient(to bottom, #000, transparent)`) to smoothly dissolve animated backgrounds.
- **Grids**: two-column layouts use `grid-cols-1 lg:grid-cols-[360px_1fr]` for intro-card + content, or `grid-cols-2 md:grid-cols-4` for stats.
- **Equal-height columns**: rely on CSS grid default `stretch` — don't use `lg:sticky` on a column that needs to match the other's height.

---

## 6. Motion language

Three tiers — don't mix within one element:

### Ambient (always-on, CSS-only)
- Marquee loops (`@keyframes tb-marquee`, 60s linear infinite)
- Scan beams (`@keyframes tb-scan`, 7s linear infinite, `mix-blend-mode: screen`)
- Pulse / glow cycles (6s–9s ease-in-out, low amplitude)
- Rail flickers (4.5s ease-in-out)

### Reveal (on scroll-into-view)
- IntersectionObserver sets a `visible` flag
- Transitions: `opacity`, `translate-y-2 → 0`, `translate-x-3 → 0`, `blur(10px) → blur(0)`
- Duration `700–900ms`, cubic-bezier `(0.2, 0.8, 0.2, 1)` or standard ease
- Staggered by index: `transitionDelay: i * 110ms`

### Orchestrated (page-load / preloader)
- `<Motion>` + Framer props: `initial`, `animate`, `transition.delay`
- Cascading delays `0.2s → 0.8s → 1.1s` between hero badge / headline / subtitle / CTA

Rules:
- Transitions use `cubic-bezier(0.2, 0.8, 0.2, 1)` or `(0.4, 0, 0.2, 1)` — never plain `ease-in-out` for primary motion.
- Respect `prefers-reduced-motion`: disable marquees, scan beams, and item-pulse (see `TrustedBy.tsx`).
- No hover-pause on marquees — user-explicit preference.

---

## 7. Component recipes (copy these, don't invent)

### Eyebrow / tag pill
```jsx
<div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5">
  <svg width="14" height="14" .../>
  <span className="text-[11px] tracking-[0.25em] text-white/70 font-body uppercase">
    FAQ
  </span>
</div>
```

### Primary CTA (high-affordance)
```jsx
<Link className="bg-white text-black rounded-full px-6 py-3 text-sm font-body font-medium flex items-center gap-2">
  成為 KOL <ArrowUpRight size={16} />
</Link>
```

### Secondary CTA
```jsx
<Link className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-body font-medium text-white flex items-center gap-2">
  成為商家 <ArrowUpRight size={16} />
</Link>
```

### Accordion item (see `FaqSection.tsx`)
Uses CSS grid `1fr ⇄ 0fr`, **not** JS `scrollHeight`. Copy that pattern for any collapse.

### Status chip (preloader pattern)
```jsx
<div className="!absolute top-10 right-10 inline-flex w-fit liquid-glass rounded-full px-3 py-1 gap-2">
  <span className="relative w-2 h-2">
    <span className="absolute inset-0 rounded-full bg-blue-300/70 animate-ping" />
    <span className="relative w-1.5 h-1.5 rounded-full bg-blue-200" />
  </span>
  <span className="text-[10px] tracking-[0.2em] text-white/70 font-body uppercase">
    Initializing
  </span>
</div>
```

### Icon treatment
- Lucide React for UI icons at `size={14–22}`.
- Custom SVGs for brand/decorative (wordmark, network nodes, comparison indicators) — inline, use gradient fills via `<linearGradient>` defs.
- Icon in a "coin": `w-12 h-12` rounded-full with `radial-gradient(circle at 35% 30%, rgba(140,190,255,0.25) 0%, rgba(20,40,80,0.4) 70%)` + `border: 1px solid rgba(255,255,255,0.12)` + `box-shadow: 0 0 30px rgba(140,190,255,0.15)`.

---

## 8. Backgrounds

Each full-bleed section has its own SVG/canvas backdrop:
- `HeroNetworkBG` — live node graph
- `StatsBG`, `CtaNetworkBG` — sparser variants
- `ScrollArc` — scroll-progress-linked curve weaving through `FeaturesChess` + `FeaturesGrid`

For new sections that inherit the theme, either:
- Reuse an existing BG component (don't fork lightly), or
- Stack ambient layers: radial-gradient glow + faint grid + optional scan beam. Pattern in `Preloader.tsx` lines 68–87 is the reference.

---

## 9. Applying this to a new page

Checklist when refactoring a page to match:

1. **Wrap page in** `<div className="bg-black min-h-screen partnerlink-landing">` if you need the font overrides, or rely on `font-heading` / `font-body` classes.
2. **Do not inherit the app's light theme** — `:root` variables paint cream background. Force dark with `bg-black` on the outer container and use the palette in §2.
3. **Replace any solid cards** with `.liquid-glass` (pick light vs strong per §4).
4. **Replace primary buttons** with `liquid-glass-strong` or `bg-white text-black` (pick one — never two whites per view).
5. **Re-type section headings** using the bilingual idiom (§3) — italic serif for emphasis span.
6. **Add a backdrop** — even a subtle radial glow is better than solid black.
7. **Add reveal transitions** on scroll via IntersectionObserver if the section is taller than viewport.
8. **Verify in Chrome preview**:
   - Compare against hero / FAQ section visually.
   - `preview_eval` on button rects to confirm glass rendering is visible (backdrop-filter requires a blurred source behind it).
   - Check `prefers-reduced-motion` path.
9. **Do not introduce new color tokens** without updating this file.
10. **Follow the** `design-file-integration` **skill** for the full iterative workflow.

---

## 10. Anti-patterns (do not do)

- Purple gradients, neon pinks, or any warm/saturated accent on this theme.
- Solid gray cards (`bg-gray-900`, `bg-zinc-800`) instead of liquid glass — loses the whole identity.
- Using `Inter` or the app's sans for headings on this page — breaks the editorial feel.
- Framer Motion for simple fades — use CSS transitions.
- JS `scrollHeight` measurement for collapse — use CSS grid rows.
- Hover-pause on marquees — explicitly removed.
- Two solid-white CTAs in one view — reserve for single primary action.
- Redeclaring `.liquid-glass` locally — always reuse the global utility.

---

## 11. Files and ownership

| Concern | File |
|---------|------|
| Global tokens & glass utilities | `src/app/globals.css` (line 690+) |
| Font loading | `src/app/layout.tsx` |
| Page composition | `src/app/page.tsx` |
| Landing components | `src/components/landing/*.tsx` |
| Motion primitives | `src/components/landing/Motion.tsx`, `BlurText.tsx` |
| Animated backdrops | `HeroNetworkBG.tsx`, `CtaNetworkBG.tsx`, `StatsBG.tsx`, `FeaturesChess.tsx#ScrollArc` |

When updating the theme (new color, new primitive), edit this file in the same PR.
