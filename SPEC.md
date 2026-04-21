# PartnerLink 夥伴 — Technical Spec

A reference for what's actually built. Derived from the codebase at the time of writing, not a roadmap.

---

## 1. Product

PartnerLink connects two sides of a Taiwan affiliate-marketing marketplace:

- **Merchants** — either `property` (建案, real-estate developer) or `shop` (商案, commercial business). Each merchant builds one or more branded **project pages** (module-driven mini-sites with their own `slug`).
- **KOLs** — creators who apply, get approved, then request (or accept) collaborations with merchants. Each accepted collaboration auto-mints a **referral link** with a short code. Public visits to `/r/[code]` are redirected to the merchant's project page and attributed via cookies.
- **Admins** — approve or deny KOL/merchant applications, view cross-platform stats.

Two collaboration economics live side-by-side:

- **commission** — default. Merchant pays a commission on deals the KOL's link drives. Deal value and confirmation are logged against the `referral_conversion`.
- **reciprocal** (互惠) — merchant ships products to the KOL; KOL creates sponsored content. Optional flat `sponsorship_bonus` in NTD. Shipment tracked in `mutual_benefit_shipments`.

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Next.js 16.1.6, React 19.2.3 | App Router, server components by default |
| Language | TypeScript (strict) | `@ts-nocheck` used only on the public landing page `src/app/page.tsx` |
| Styling | Tailwind CSS v4 + tw-animate-css | Utility-only; shadcn/ui primitives in `src/components/ui/` |
| Auth + DB | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | Postgres with RLS; email/password auth |
| AI | `openai` SDK, `@anthropic-ai/sdk` | Used for project copy extraction, audience insights, market trends |
| Charts | Recharts | Dashboards |
| Maps | Leaflet + react-leaflet | Project location module |
| Motion | Framer Motion | Landing + signup |
| Fonts | DM Serif Display, DM Sans, Noto Serif TC, Noto Sans TC, Instrument Serif, Barlow | Loaded via `next/font/google` |
| Chinese input | pinyin-pro | Auto-slug generation from Chinese project names |
| Toaster | sonner | Top-center, rich colours |
| Tests | Vitest 2 + `@vitest/coverage-v8` | `src/lib/__tests__/` |

Brand is PartnerLink everywhere — package name, metadata, and UI copy. The older `homekey` / `房客` naming has been fully retired.

---

## 3. Repo layout

```
src/
  app/
    layout.tsx                     Root layout: fonts, ConditionalHeader/Footer, Toaster
    page.tsx                       Landing (liquid-glass dark, @ts-nocheck)
    about/                         Static about
    pricing/                       Static pricing
    login/                         Client login form
    signup/                        3-step signup wizard (role → type/profile → credentials)
    verify-email/                  "Check your inbox" post-signup screen
    pending-approval/              KOL application awaiting admin review
    merchant-pending-approval/     Merchant application awaiting admin review
    auth/
      callback/                    Supabase redirect handler (session exchange)
      confirm/ (api route)         Email confirmation endpoint
      confirmed/                   Success screen after email confirmation
      error/                       Parses Supabase auth error codes
      forgot-password/             Request reset email
      reset-password/              Set new password
    properties/                    Public list + `[slug]` project detail (property/建案)
    shops/[slug]/                  Public shop detail (商案)
    kols/[username]/               Public KOL profile (+ `/frame` iframe variant)
    r/[code]/                      Referral short-link redirect (server route handler)
    join/kol/  join/merchant/      Marketing landing pages for each side
    kol/                           KOL dashboard (middleware-protected)
      home/                        Stats, recent collabs, CTA
      marketplace/                 Browse open projects to request collaboration
      projects/                    Accepted collaborations list + [id] detail
      applications/                KOL's outgoing collaboration requests
      inbox/                       Incoming requests from merchants
      profile/                     Public profile editor (distinct from resume)
      resume/                      Resume view; /edit is the authoring surface
    merchant/                      Merchant dashboard
      home/                        Overview
      projects/                    Project CRUD; `[id]/{edit,preview,frame,analytics,customers,products,mutual-benefit,kols,audience,customer-insights}`
      projects/archived/[id]/      Archived (soft-deleted) project view
      leads/                       Inquiries across all projects
      kols/                        Active collaborations
      kol-browse/                  Browse approved KOLs to invite
      mutual-benefit/              All reciprocal collabs (shipment tracking)
    admin/                         Admin panel
      page.tsx                     Overview redirect
      dashboard/                   Platform-wide stats
      kol-applications/            Pending / approved / denied review queue
      merchant-applications/       Same for merchants
      kols/ merchants/ projects/ referrals/ settings/
    api/                           See §7
  components/
    admin/ kol/ merchant/          Role-specific dashboard layouts + cards
    landing/                       HeroNetworkBG, CtaNetworkBG, StatsBG, Preloader, FeatureSteps, FeaturesChess, FaqSection, BlurText, Motion, TrustedBy, use-reveal-on-scroll
    layout/                        ConditionalHeader/Footer (hide on auth/dashboard), Header, Footer, Sidebar, ProfilePhotoModal
    login/                         LoginContent
    property/                      HeroSection, FloorPlans, NearbyAmenities, PropertyMap, PhotoGallery, HighlightsBar, ConstructionTimeline, BookTourCTA, DefaultPropertyPage, ShangAnPage
    shared/                        NotificationBell
    ui/                            shadcn primitives: avatar, badge, button, card, dialog, dropdown-menu, input, select, separator, sheet, skeleton, sonner, table, tabs, textarea
    Logo.tsx
  lib/
    auth.ts                        AppRole union + helpers (getRoleFromUser, resolveRoleHomePath)
    server/
      api-auth.ts                  requireApiUser / requireApiRole (Bearer or cookie)
      properties.ts                Project list + detail loaders for merchant dashboards
    supabase/
      admin.ts                     Service-role client + token verifier client (singletons)
      client.ts                    Browser client
      env.ts                       URL/key readers (throws when missing)
    property-template.ts           Default module sets for 建案 (`property`) and 商案 (`shop`); slugifyPropertyName (pinyin); PROPERTY_THEMES (dark-gold, ivory, graphite, vermillion, …)
    kol-application.ts             Request-body normalization for KOL applications
    merchant-application.ts        Ditto for merchants; `MERCHANT_TYPES = ['property','shop']`
    kol-stats.ts                   KOL KPI math (tested)
    kol-themes.ts                  Theme presets for public KOL profile
    district-slugs.ts              Taiwan district → slug map
    strings.ts                     Signup copy constants + `interpolate`
    constants.ts                   Route map, currency units, status colour tokens (legacy — partly unused)
    types.ts                       Legacy domain types — predates the `properties → projects` rename; use with care
    utils.ts                       `cn()` tailwind-merge helper
  data/                            Mock data for UI-only / unbuilt features
  hooks/                           useLocale, useMerchantType, useMockData
  middleware.ts                    Role-based route guard on /kol, /merchant, /admin

supabase/migrations/               36 SQL files, chronological — authoritative schema
docs/DESIGN-SYSTEM.md              Component-level design tokens
design.md                          Landing-page aesthetic manifesto
tasks/lessons.md                   Rules captured from past corrections
```

---

## 4. Auth and onboarding

### 4.1 Role resolution

`getRoleFromUser(user)` reads `user.app_metadata.role`. It returns `'kol' | 'merchant' | 'admin'` or `null`. `signup_role` in `user_metadata` is the user's declared intent at signup (pre-approval); `app_metadata.role` is the granted role (admin-controlled).

### 4.2 Middleware

`src/middleware.ts` runs on `/kol/:path*`, `/merchant/:path*`, `/admin/:path*`. It:

1. Uses `@supabase/ssr` to read the user from cookies.
2. No user → `/login?next=<pathname>`.
3. Role mismatch → `resolveRoleHomePath(actualRole)`.

Login is at `/login` (supports `next` param); public marketing pages are unprotected.

### 4.3 Signup wizard (`src/app/signup/page.tsx`)

3 steps:
1. Role (`kol` / `merchant`).
2. KOL: basic profile form. Merchant: 建案 / 商案 choice.
3. KOL: platform-accounts form (IG/TikTok/YouTube/Xiaohongshu/FB/X handles). Merchant: company/contact/phone/city/projectCount form.

On submit:
- `supabase.auth.signUp` with `emailRedirectTo=/api/auth/confirm` and `data: { signup_role, full_name, kol_username }`.
- Calls `/api/{kol,merchant}/application/preconfirm` to create a `pending_email_confirmation` row.
- If a session exists (email-confirmation disabled), calls `/api/auth/complete-{kol,merchant}-signup` immediately to flip status to `pending_admin_review`; otherwise redirects to `/verify-email`.
- Merchants already auto-approved by admin jump straight to `/merchant/home`; otherwise go to `/merchant-pending-approval`.

### 4.4 Admin approval

Admin routes at `/admin/kol-applications/[id]/(approve|deny)` and `/admin/merchant-applications/[id]/(approve|deny)`:

- Approve: updates application `status=approved`, sets `app_metadata.role`, and (merchants only) inserts a `merchant_profiles` row. RLS is permissive to `admin` role on every relevant table.
- Deny: sets `status=denied` and optional `rejection_reason`.

---

## 5. Database schema (high-level)

36 migrations in `supabase/migrations/`. Every table has RLS enabled and follows a uniform pattern: owner can select/modify their own rows, admin can do anything, participants can see shared rows.

### 5.1 Applications and profiles

- **`kol_applications`** — one per user. Status: `pending_email_confirmation | pending_admin_review | approved | denied`. Columns: `full_name, platforms text[], platform_accounts jsonb, follower_range, content_type, bio, city, photos text[], videos jsonb, profile_photo_path, collab_fee int, rejection_reason`. Plus media assets (`kol_media_assets` with `caption`) stored in the `kol-media` private Storage bucket.
- **`merchant_applications`** — same status enum. Columns: `company_name, contact_name, phone, city, project_count, merchant_type ∈ {property, shop}, rejection_reason`.
- **`merchant_profiles`** — created on approval. 1:1 with `merchant_applications`. `status ∈ {active, suspended}`.

### 5.2 Projects

- **`projects`** (renamed from `properties` in migration `20260404230000`) — owned by `merchant_user_id`. `type ∈ {property, shop}` (was `template_key`, originally `建案/商案`, migration `20260407100000` renamed values to English). `publish_status ∈ {draft, published}`, plus `slug` (unique), `name`, `subtitle`, `district_label`, `map_{lat,lng,zoom}`, contact copy, soft-delete via `is_archived` + `archived_at`.
- **`property_images`** — per `section_key`, stored in the public `property-media` bucket. Unique `(property_id, section_key)`.
- **`property_content_items`** — generic key/value content grouped by `group_key` (features, timeline, FAQ, team…). Has `state ∈ {completed, current, upcoming}` for timeline entries.
- **`property_modules`** — the layout builder. Each row is one module on one project, with `sort_order`, `is_visible`, and a `settings_json` blob. Module types:
  - 建案 (`property`): `hero`, `intro_identity`, `intro_specs`, `features`, `progress`, `location`, `contact`, `footer`, `image_section`, `floor_plan`, `surroundings`, `team`, `indoor_commons`, `color_theme`.
  - 商案 (`shop`): `shop_hero`, `shop_products`, `shop_about`, `shop_features`, `shop_gallery`, `shop_faq`, `shop_contact`, `shop_footer`.
  - `image_section` is the only repeatable type (enforced by partial unique index).

### 5.3 Collaboration graph

- **`collaboration_requests`** — pending invitations. `sender_role ∈ {merchant, kol}`, `status ∈ {pending, accepted, declined, cancelled}`. `collaboration_type ∈ {commission, reciprocal}`, optional `sponsorship_bonus`. Partial unique index on `(project_id, merchant_user_id, kol_user_id) where status = 'pending'`. A DB trigger blocks a new request if an active `collaborations` row already exists for the same triple.
- **`collaborations`** — active partnerships. 1:1 with the accepting request. `status ∈ {active, ended}`. Partial unique on active.
- **`accept_collaboration_request(p_request_id uuid)`** — `security definer` RPC. Locks the request row, verifies the caller is the recipient (based on `sender_role`), atomically flips status and inserts the `collaborations` row. Granted to `authenticated` only.
- **`mutual_benefit_items`** — product offerings attached to a 互惠 request (item_name, quantity, estimated_value NTD, notes).
- **`mutual_benefit_shipments`** — 1:1 with a `collaborations` row. `carrier ∈ {t-cat, hct, pelican, post, e-can}`, `tracking_number`, `shipped_at`, `received_at`. The KOL sets `received_at` to confirm receipt (which in product-speak triggers the 業配獎金 bonus).

### 5.4 Referrals

- **`referral_links`** — one per accepted collaboration. Unique `short_code` used by `/r/[code]`. One active link per `(kol_user_id, project_id)`.
- **`referral_clicks`** — each visit. `ip_hash` is SHA-256 (raw IP never stored). `session_id` comes from the `hk_sid` cookie (2-year) for dedup.
- **`referral_conversions`** — `conversion_type ∈ {inquiry, deal}`. Conversions carry contact fields (`name, phone, email, message`) and, for deals, `deal_value numeric(12,2)` + `deal_confirmed_at`. After migration `20260412000000`, status is consolidated into a single `status ∈ {inquiring, visited, not_interested, dealt}` column with `previous_status` for undo.

### 5.5 Inquiries and notifications

- **`property_inquiries`** — visitor contact-form submissions on project pages. Same consolidated `status` lifecycle as `referral_conversions`. Merchants can promote an inquiry to a deal (`deal_value`, `deal_confirmed_at`, `kol_credit_user_id` when attribution is known).
- **`notifications`** — one row per event (`new_inquiry | visited | deal`). Written by server routes, read by the `NotificationBell` bell icon. Contains `title`, `href`, `created_at`.

### 5.6 Storage buckets

- `property-media` — public. Project imagery.
- `kol-media` — private. Application photos, videos, profile photos. Signed URLs issued server-side.

---

## 6. Referral attribution flow

1. `/r/[code]` (server route handler, `src/app/r/[code]/route.ts`):
   - Service-role lookup of `referral_links` by `short_code`.
   - Looks up the `projects.slug` to build the destination URL (`/properties/<slug>`).
   - Mints `hk_sid` (2-year) if missing; records a `referral_clicks` row fire-and-forget.
   - Sets `hk_ref=<code>` (30-day attribution window, httpOnly, SameSite=Lax).
   - 302 to the destination.
2. `/api/inquiries` (public, admin-client write) — on form submit, the server reads `hk_ref` to decide whether the inquiry is a referral conversion (`referral_conversions` with `conversion_type='inquiry'`) or a plain `property_inquiries`.
3. Merchant confirms the deal via `/api/merchant/projects/[id]/customers/confirm-deal` — sets `deal_value`, `deal_confirmed_at`, status `'dealt'`, and notifies the credited KOL.

---

## 7. API surface

All routes in `src/app/api/**/route.ts`. Every route starts with `requireApiRole` / `requireApiUser`.

### 7.1 Auth / accounts

| Route | Verb | Role | Purpose |
|---|---|---|---|
| `/api/auth/confirm` | GET | public | Supabase email-verification callback; exchanges code for session |
| `/api/auth/complete-kol-signup` | POST | authenticated | Flip KOL application to `pending_admin_review` (or detect already approved/denied) |
| `/api/auth/complete-merchant-signup` | POST | authenticated | Same for merchants |
| `/api/auth/assign-role` | POST | internal | Admin-side role write (service role only) |
| `/api/auth/sync-role` | POST | authenticated | Re-read role from latest approval state |
| `/api/auth/forgot-password` | POST | public | Send reset email |
| `/api/account/profile-photo` | POST | authenticated | Upload avatar to the right bucket based on role |

### 7.2 KOL-facing

| Route | Verb | Purpose |
|---|---|---|
| `/api/kol/application` | POST | Upsert KOL application |
| `/api/kol/application/preconfirm` | POST | First-time insert pre-email-confirm |
| `/api/kol/application/status` | GET | Poll current status |
| `/api/kol/check-username` | POST | Call `check_kol_username_taken` RPC |
| `/api/kol/profile` | GET/PATCH | Public profile data |
| `/api/kol/projects` | GET | Accepted collaborations as the KOL sees them |
| `/api/kol/resume/profile` | PATCH | Resume body fields |
| `/api/kol/resume/media` | POST/DELETE | Portfolio media (to `kol-media` bucket) |
| `/api/kol/mutual-benefit` | GET | KOL's 互惠 collaborations |

### 7.3 Merchant-facing

| Route | Verb | Purpose |
|---|---|---|
| `/api/merchant/application/preconfirm` | POST | First-time insert pre-email-confirm |
| `/api/merchant/application/status` | GET | Status poll |
| `/api/merchant/profile` | GET/PATCH | Merchant profile |
| `/api/merchant/kols` | GET | All approved KOLs (directory) |
| `/api/merchant/projects` | GET/POST | List / create projects — POST validates `type` against merchant's `merchant_type`, seeds default modules, pinyin-slugifies name |
| `/api/merchant/projects/slug-check` | POST | Ensure slug uniqueness |
| `/api/merchant/projects/archived` | GET | Archived projects |
| `/api/merchant/projects/[id]` | GET/PATCH/DELETE | Single project; DELETE = archive |
| `/api/merchant/projects/ai-extract` | POST | OpenAI: extract structured copy from URL or pasted text (uses Jina reader for URLs) |
| `/api/merchant/projects/[id]/ai-audience` | POST | AI-generated audience profile |
| `/api/merchant/projects/[id]/market-trends` | GET | AI market-trend report |
| `/api/merchant/projects/[id]/images` | POST | Upload image to `property-media` |
| `/api/merchant/projects/[id]/images/reorder` | POST | Batch reorder |
| `/api/merchant/projects/[id]/images/[imageId]` | DELETE | Remove image |
| `/api/merchant/projects/[id]/customers/confirm-deal` | POST | Promote inquiry/conversion to `dealt` |
| `/api/merchant/projects/[id]/customers/mark-visited` | POST | Set status=`visited` |
| `/api/merchant/projects/[id]/customers/mark-not-interested` | POST | Set status=`not_interested` (stores `previous_status` for undo) |
| `/api/merchant/mutual-benefit` | GET | All merchant 互惠 collaborations |

### 7.4 Shared / cross-role

| Route | Verb | Purpose |
|---|---|---|
| `/api/collaboration-requests` | GET/POST | List own requests; create a new request (merchant → KOL or KOL → merchant) |
| `/api/collaboration-requests/[id]/accept` | POST | Wraps `accept_collaboration_request` RPC; also mints the `referral_link` |
| `/api/collaboration-requests/[id]/decline` | POST | Recipient declines |
| `/api/collaboration-requests/[id]/cancel` | POST | Sender cancels |
| `/api/mutual-benefit/[id]/ship` | POST | Merchant logs carrier + tracking; sets `shipped_at` |
| `/api/mutual-benefit/[id]/receive` | POST | KOL confirms receipt; sets `received_at` |
| `/api/inquiries` | POST | Public project-page form submit; attributes via `hk_ref` cookie |
| `/api/notifications` | GET/PATCH | Current user's notification feed + mark-read |

### 7.5 Admin

| Route | Verb | Purpose |
|---|---|---|
| `/api/admin/overview` | GET | Platform stats |
| `/api/admin/kol-applications` | GET | Paginated queue |
| `/api/admin/kol-applications/[id]/approve` | POST | Grant `role=kol` |
| `/api/admin/kol-applications/[id]/deny` | POST | Deny with optional reason |
| `/api/admin/merchant-applications*` | — | Same pattern for merchants; approve also creates `merchant_profiles` |
| `/api/admin/kols` | GET | All KOLs |
| `/api/admin/merchants` | GET | All merchants |
| `/api/admin/projects` | GET | All projects across merchants |

---

## 8. Project page builder

Merchants build their mini-site from `src/app/merchant/projects/[id]/edit/` — a client-side editor (`_ui.tsx` + `_use-editor.ts`) that renders one panel per module type from `_panels/*`. State lives in React; saves go through per-module PATCHes. Module picker (`_module-picker.tsx`) gates selection by the project's `type` (`property` vs `shop`). `_ai-import.tsx` wires the OpenAI extract endpoint.

Public rendering:
- 建案: `src/app/properties/[slug]/page.tsx` → composes the module list with the `property/*` section components (`HeroSection`, `FloorPlans`, `NearbyAmenities`, …). A `ShangAnPage` / `DefaultPropertyPage` bifurcation picks the template.
- 商案: `src/app/shops/[slug]/page.tsx` → `shop_*` modules.
- Preview + frame variants at `/merchant/projects/[id]/preview` and `/merchant/projects/[id]/frame` (used for embedding inside the editor canvas).

Colour themes are defined in `property-template.ts` (`dark-gold`, `ivory`, `graphite`, `vermillion`, plus more). Themes are applied by injecting CSS custom properties (`--p-bg`, `--p-accent`, …).

---

## 9. Design language

Two distinct themes coexist:

- **Liquid-glass dark** — landing page, signup, login, KOL resume. Dark canvas (`#000`) with `.liquid-glass` / `.liquid-glass-strong` utility surfaces, animated SVG "network" backdrops (`HeroNetworkBG`, `CtaNetworkBG`, `StatsBG`), italic serif headings (Instrument Serif), mixed EN-italic / ZH-roman in the same sentence. Full manifesto in `design.md`.
- **Editorial light** — dashboard surfaces (KOL / merchant / admin). Cream background (`--background: #faf9f6`) with shadcn primitives.

Keep them separate; don't mix tokens.

---

## 10. Testing

- `npm run test` runs Vitest once; `npm run test:watch` for dev.
- `src/lib/__tests__/kol-stats.test.ts` is the current suite — covers the KPI math in `kol-stats.ts`.
- No Playwright / component tests.

---

## 11. Env vars

Read through `src/lib/supabase/env.ts`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the ssr/anon key)
- `SUPABASE_ADMIN_KEY` (service-role)

Also required at runtime:

- `OPENAI_API_KEY` — for `/api/merchant/projects/ai-extract` and audience/trend routes
- `ANTHROPIC_API_KEY` — for Anthropic-backed AI routes

Missing values cause `env.ts` getters to throw on the first server-side call.

---

## 12. Known rough edges

- `src/lib/types.ts` predates the `properties → projects` rename and uses the older `PropertyStatus / KolTier / Referral / Activity` shape — it doesn't match the current DB. New code should model directly from DB queries, not from this file.
- `src/data/mock-*.ts` is still referenced in a few admin views (activity log, some referral tables) and by `useMockData`. Treat as scaffolding, not product.
- `src/lib/constants.ts` contains legacy `ROUTES`, `DEMO_ROLES`, and status colour maps from an earlier version — parts are unused.
- Landing page (`src/app/page.tsx`) is `@ts-nocheck` because of the `motion.*` prop surface.
- Migration `20260407100000_rename_type_values_to_english.sql` changed `type`/`merchant_type` from `'建案'/'商案'` to `'property'/'shop'`. Any older check constraint or seed referring to the Chinese values has been superseded.
