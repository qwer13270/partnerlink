-- ── property_inquiries ────────────────────────────────────────────────────────
-- Stores visitor inquiry / tour-booking form submissions.
-- property_id is nullable so inquiries from non-DB (mock) pages don't fail.
create table if not exists public.property_inquiries (
  id           uuid        primary key default gen_random_uuid(),
  property_id  uuid        references public.properties(id) on delete set null,
  name         text        not null,
  phone        text,
  email        text,
  message      text,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_property_inquiries_property
  on public.property_inquiries (property_id, submitted_at desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.property_inquiries enable row level security;

-- Merchant can read inquiries for their own properties
drop policy if exists "merchant_select_own_inquiries" on public.property_inquiries;
create policy "merchant_select_own_inquiries"
  on public.property_inquiries for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.merchant_user_id = auth.uid()
    )
  );

-- Admin full access
drop policy if exists "admin_all_inquiries" on public.property_inquiries;
create policy "admin_all_inquiries"
  on public.property_inquiries for all
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- No public insert policy — inserts go through the service-role admin client
-- in the /api/inquiries route handler (no RLS bypass needed)
