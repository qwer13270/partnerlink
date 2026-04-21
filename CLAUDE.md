# CLAUDE.md

## What this is

**PartnerLink 夥伴** — a Taiwan-market platform that connects merchants (建案 property developers and 商案 commercial shops) with KOLs. KOLs get trackable referral links (`/r/[code]`) that route visitors to a merchant-owned project page; inquiries and deals are attributed back to the KOL.

See `SPEC.md` for a detailed feature, schema, and API map.

## Tech stack

- **Framework**: Next.js 16.1 (App Router) + React 19, TypeScript strict
- **Styling**: Tailwind v4 + shadcn/ui primitives (`src/components/ui/*`)
- **Backend**: Supabase (Postgres + Auth + Storage) with RLS on every table
- **AI**: OpenAI + Anthropic SDKs (project content extraction, audience insights, market trends)
- **Maps**: Leaflet / react-leaflet
- **Motion**: Framer Motion
- **Tests**: Vitest (`src/lib/__tests__/`)

Brand is **PartnerLink** end-to-end (package name, metadata, UI copy). The earlier `homekey`/`房客` naming has been fully retired.

## Dev commands

```bash
npm run dev          # localhost:3000
npm run build
npm run lint
npm run test         # vitest run
npm run test:watch
```

## Roles and auth

Three roles, stored in `auth.users.app_metadata.role`:

- `admin` — full platform access, reviews applications
- `kol` — content creator (approved via `kol_applications`)
- `merchant` — business (approved via `merchant_applications`, with `merchant_type ∈ {property, shop}`)

Route guards:

- **Pages**: `src/middleware.ts` guards `/kol/*`, `/merchant/*`, `/admin/*`. Missing user → `/login?next=…`. Wrong role → that user's home.
- **APIs**: Every route calls `requireApiRole(request, ['role', …])` (or `requireApiUser`) from `src/lib/server/api-auth.ts`. Accepts either a Bearer token or the Supabase SSR cookie. Returns 401/403 `{ error }` on failure.
- **Signup**: Supabase email signup → `/api/auth/confirm` → `/api/auth/complete-{kol,merchant}-signup` promotes the pending application to `pending_admin_review`. Admin approval flips `app_metadata.role` and creates the `merchant_profiles` row (no equivalent for KOL — approval just grants the role).

### KOL public-profile URL

The public KOL profile lives at `/kols/[username]` (plural `kols`, singular `kol` is the owner dashboard). The `[username]` segment is resolved against `user_metadata.kol_username` — **not** `user_metadata.username`, and not the email prefix. See `deriveUsername()` in `src/app/kols/[username]/page.tsx` for the authoritative fallback chain: `kol_username` → sanitized email prefix (`[^a-z0-9_]` stripped, lowercased). When linking to a KOL's public profile from anywhere in the app, read `kol_username` with this same fallback — using the generic `username` meta will silently link to a non-existent profile.

## Conventions

### Components
- Functional only; `'use client'` at top for client components, server components are plain `async function`.
- Default exports: `export default function ComponentName({ … }: Props)`.
- Props interface inline above the component. Shared domain types in `src/lib/types.ts`; feature-local types in sibling `_types.ts`.

### Data fetching
- Server component pages fetch data upfront and pass as props to `'use client'` children. No `useEffect` for initial loads.
- Parallel fetches use `Promise.all`.
- Use `getSupabaseAdminClient()` server-side (service role, bypasses RLS) and `getSupabaseBrowserClient()` in the browser.
- Client-side live refresh: `fetch('/api/…', { headers: { Authorization: \`Bearer ${token}\` } })`.

### API routes
- `export async function GET/POST/PATCH/DELETE(request: NextRequest, ctx?)`.
- First line: auth check. Errors: `NextResponse.json({ error }, { status })`. Log with `console.error('[api/route-name] step:', err.message)`.
- Validate body with `typeof body.x === 'string' ? body.x.trim() : ''` style — never trust shape.

### Styling
- **Before building any new UI** — component, page, section, or restyle — read `design.md` first. It defines the liquid-glass aesthetic (colour palette, typography, glass surfaces, motion, network motif, bilingual heading idiom) that the product is built around. `docs/DESIGN-SYSTEM.md` has the component-level tokens. Don't invent a new look; compose from the documented patterns.
- Tailwind utility classes only (no CSS modules). Merge with `cn()` from `@/lib/utils`.
- Landing, auth, signup, KOL-facing public pages, **and the entire `/kol/*` dashboard** use the **liquid-glass dark theme** from `design.md` (bg-black shell with `partnerlink-landing` font scope, `.liquid-glass` surfaces, `font-heading` italic display + `font-body` text). The KOL dashboard renders through `KOLDashboardLayout` + `SidebarDark`. Only `/merchant/*` and `/admin/*` dashboards remain on the lighter editorial theme set in `globals.css`. Don't mix tokens across the two.

### Errors
- API: correct HTTP status + `{ error }` body.
- Client forms: `useState<string | null>` for `submitError`, render inline.
- Always `if (error || !data)` after Supabase, `if (!res.ok)` after `fetch`.

## Key directories

- `src/app/` — App Router. Public (`/`, `/properties`, `/shops/[slug]`, `/kols/[username]`, `/r/[code]`), auth (`/login`, `/signup`, `/auth/*`, `/verify-email`, `/pending-approval`), dashboards (`/kol/*`, `/merchant/*`, `/admin/*`), APIs (`/api/*`).
- `src/components/` — `admin/`, `kol/`, `merchant/`, `landing/`, `layout/`, `login/`, `property/`, `shared/`, `ui/` (shadcn).
- `src/lib/` — `auth.ts`, `server/api-auth.ts`, `server/properties.ts`, `supabase/*`, `property-template.ts`, `kol-*.ts`, `merchant-application.ts`, `types.ts`, `constants.ts`, `utils.ts`.
- `src/data/` — remaining mock data for UI-only/unbuilt features (activity, mock KOLs/referrals for admin demo views).
- `supabase/migrations/` — 36 SQL migrations, single source of truth for schema. No generated TS types checked in.

## Mock vs real

Most flows are real Supabase. Known mocks (`src/data/` + `useMockData`, `mock-*.ts`): admin activity log, some admin demo tables, `mock-resume` helpers for the public KOL profile fallback. Treat `src/lib/types.ts` with caution — it still uses old `property`/`template_key` shapes from before the `properties → projects` rename; new code uses the project/type names.

## Working style

- Senior-engineer bar. Find root causes, no temporary patches, minimal diff.
- Plan mode only for 3+ step or architectural changes. Simple UI/styling edits — just do them.
- Don't take screenshots or start the dev server unless asked.
- When correcting a past mistake, append a short rule to `tasks/lessons.md`.
- This project uses git worktrees under `.claude/worktrees/<name>/`. Before editing, confirm the path prefix matches the active worktree (or the main repo) — don't cross-edit.
