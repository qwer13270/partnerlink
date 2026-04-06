-- ── 互惠 (Reciprocal) Collaboration System ────────────────────────────────────
-- Adds collaboration_type to existing tables and creates new tables for
-- mutual benefit items and shipment tracking.

-- 1. Extend collaboration_requests
alter table public.collaboration_requests
  add column collaboration_type text not null default 'commission'
    check (collaboration_type in ('commission', 'reciprocal')),
  add column sponsorship_bonus integer; -- flat NTD bonus, null = none

-- 2. Extend collaborations
alter table public.collaborations
  add column collaboration_type text not null default 'commission'
    check (collaboration_type in ('commission', 'reciprocal')),
  add column sponsorship_bonus integer;

-- 3. Items offered by merchant per collaboration_request
create table public.mutual_benefit_items (
  id                       uuid primary key default gen_random_uuid(),
  collaboration_request_id uuid not null references public.collaboration_requests(id) on delete cascade,
  item_name                text not null,
  quantity                 integer not null default 1 check (quantity > 0),
  estimated_value          integer not null default 0, -- NTD market value
  notes                    text,
  created_at               timestamptz not null default now()
);

alter table public.mutual_benefit_items enable row level security;

drop policy if exists "parties_select_items" on public.mutual_benefit_items;
create policy "parties_select_items" on public.mutual_benefit_items
  for select
  using (exists (
    select 1 from public.collaboration_requests cr
    where cr.id = mutual_benefit_items.collaboration_request_id
      and (cr.merchant_user_id = auth.uid() or cr.kol_user_id = auth.uid())
  ));

drop policy if exists "merchant_insert_items" on public.mutual_benefit_items;
create policy "merchant_insert_items" on public.mutual_benefit_items
  for insert
  with check (exists (
    select 1 from public.collaboration_requests cr
    where cr.id = mutual_benefit_items.collaboration_request_id
      and cr.merchant_user_id = auth.uid()
  ));

drop policy if exists "admin_manage_items" on public.mutual_benefit_items;
create policy "admin_manage_items" on public.mutual_benefit_items
  for all
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index idx_mutual_benefit_items_request
  on public.mutual_benefit_items(collaboration_request_id);

-- 4. Shipment tracking per accepted 互惠 collaboration (1:1)
create table public.mutual_benefit_shipments (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null unique references public.collaborations(id) on delete cascade,
  carrier          text check (carrier in ('t-cat', 'hct', 'pelican', 'post', 'e-can')),
  tracking_number  text,
  shipped_at       timestamptz,
  received_at      timestamptz, -- set when KOL confirms receipt; triggers 業配獎金
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.mutual_benefit_shipments enable row level security;

drop policy if exists "parties_select_shipment" on public.mutual_benefit_shipments;
create policy "parties_select_shipment" on public.mutual_benefit_shipments
  for select
  using (exists (
    select 1 from public.collaborations c
    where c.id = mutual_benefit_shipments.collaboration_id
      and (c.merchant_user_id = auth.uid() or c.kol_user_id = auth.uid())
  ));

-- Merchant can insert/update shipment (enter tracking info)
drop policy if exists "merchant_manage_shipment" on public.mutual_benefit_shipments;
create policy "merchant_manage_shipment" on public.mutual_benefit_shipments
  for all
  using (exists (
    select 1 from public.collaborations c
    where c.id = mutual_benefit_shipments.collaboration_id
      and c.merchant_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.collaborations c
    where c.id = mutual_benefit_shipments.collaboration_id
      and c.merchant_user_id = auth.uid()
  ));

-- KOL can update shipment to confirm receipt (received_at)
drop policy if exists "kol_confirm_receipt" on public.mutual_benefit_shipments;
create policy "kol_confirm_receipt" on public.mutual_benefit_shipments
  for update
  using (exists (
    select 1 from public.collaborations c
    where c.id = mutual_benefit_shipments.collaboration_id
      and c.kol_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.collaborations c
    where c.id = mutual_benefit_shipments.collaboration_id
      and c.kol_user_id = auth.uid()
  ));

drop policy if exists "admin_manage_shipments" on public.mutual_benefit_shipments;
create policy "admin_manage_shipments" on public.mutual_benefit_shipments
  for all
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop trigger if exists trg_mutual_benefit_shipments_set_updated_at on public.mutual_benefit_shipments;
create trigger trg_mutual_benefit_shipments_set_updated_at
  before update on public.mutual_benefit_shipments
  for each row execute function public.set_updated_at();
