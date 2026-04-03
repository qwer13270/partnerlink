-- ── referral_links ────────────────────────────────────────────────────────
-- One unique referral link per KOL × project collaboration.
-- Auto-created when a collaboration request is accepted.
create table if not exists public.referral_links (
  id               uuid        primary key default gen_random_uuid(),
  collaboration_id uuid        not null unique references public.collaborations(id) on delete cascade,
  project_id       uuid        not null references public.properties(id) on delete cascade,
  kol_user_id      uuid        not null references auth.users(id) on delete cascade,
  short_code       text        not null unique,
  is_active        boolean     not null default true,
  created_at       timestamptz not null default now()
);

-- One active link per KOL per project
create unique index if not exists uq_referral_links_kol_project
  on public.referral_links (kol_user_id, project_id);

create index if not exists idx_referral_links_short_code
  on public.referral_links (short_code);

create index if not exists idx_referral_links_kol
  on public.referral_links (kol_user_id, created_at desc);

-- ── referral_clicks ───────────────────────────────────────────────────────
-- One row per visit to a referral link.
-- ip_hash is a SHA-256 of the visitor IP for privacy (never store raw IP).
-- session_id is a random value set in a cookie for deduplication.
create table if not exists public.referral_clicks (
  id               uuid        primary key default gen_random_uuid(),
  referral_link_id uuid        not null references public.referral_links(id) on delete cascade,
  visited_at       timestamptz not null default now(),
  ip_hash          text,
  user_agent       text,
  session_id       text
);

create index if not exists idx_referral_clicks_link
  on public.referral_clicks (referral_link_id, visited_at desc);

-- ── referral_conversions ──────────────────────────────────────────────────
-- One row per conversion event attributed to a referral link.
-- type 'inquiry'  = visitor submitted contact form (auto-logged)
-- type 'deal'     = merchant manually logs a closed deal with a value
create table if not exists public.referral_conversions (
  id               uuid           primary key default gen_random_uuid(),
  referral_link_id uuid           not null references public.referral_links(id) on delete cascade,
  conversion_type  text           not null check (conversion_type in ('inquiry', 'deal')),
  deal_value       numeric(12, 2),   -- only set for 'deal' type
  notes            text,
  converted_at     timestamptz    not null default now()
);

create index if not exists idx_referral_conversions_link
  on public.referral_conversions (referral_link_id, converted_at desc);

-- ── RLS ───────────────────────────────────────────────────────────────────
alter table public.referral_links       enable row level security;
alter table public.referral_clicks      enable row level security;
alter table public.referral_conversions enable row level security;

-- KOL can read their own referral links
drop policy if exists "kol_select_own_referral_links" on public.referral_links;
create policy "kol_select_own_referral_links"
  on public.referral_links for select
  using (auth.uid() = kol_user_id);

-- Public can read a link by short_code (needed for the /r/[code] redirect route)
-- We use a separate anon-accessible view instead of opening the whole table.
-- The /r/[code] route uses the service-role admin client so no anon policy needed.

-- KOL can read clicks on their own links
drop policy if exists "kol_select_own_clicks" on public.referral_clicks;
create policy "kol_select_own_clicks"
  on public.referral_clicks for select
  using (
    exists (
      select 1 from public.referral_links rl
      where rl.id = referral_link_id
        and rl.kol_user_id = auth.uid()
    )
  );

-- KOL can read conversions on their own links
drop policy if exists "kol_select_own_conversions" on public.referral_conversions;
create policy "kol_select_own_conversions"
  on public.referral_conversions for select
  using (
    exists (
      select 1 from public.referral_links rl
      where rl.id = referral_link_id
        and rl.kol_user_id = auth.uid()
    )
  );

-- Merchant can read conversions for their projects
drop policy if exists "merchant_select_project_conversions" on public.referral_conversions;
create policy "merchant_select_project_conversions"
  on public.referral_conversions for select
  using (
    exists (
      select 1
      from public.referral_links rl
      join public.properties p on p.id = rl.project_id
      where rl.id = referral_link_id
        and p.merchant_user_id = auth.uid()
    )
  );

-- Merchant can insert 'deal' conversions for their projects
drop policy if exists "merchant_insert_deal_conversion" on public.referral_conversions;
create policy "merchant_insert_deal_conversion"
  on public.referral_conversions for insert
  with check (
    conversion_type = 'deal'
    and exists (
      select 1
      from public.referral_links rl
      join public.properties p on p.id = rl.project_id
      where rl.id = referral_link_id
        and p.merchant_user_id = auth.uid()
    )
  );

-- Admin full access
drop policy if exists "admin_all_referral_links" on public.referral_links;
create policy "admin_all_referral_links"
  on public.referral_links for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_all_referral_clicks" on public.referral_clicks;
create policy "admin_all_referral_clicks"
  on public.referral_clicks for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_all_referral_conversions" on public.referral_conversions;
create policy "admin_all_referral_conversions"
  on public.referral_conversions for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
