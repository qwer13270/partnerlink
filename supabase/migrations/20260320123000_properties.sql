create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  merchant_profile_id uuid not null references public.merchant_profiles(id) on delete cascade,
  merchant_user_id uuid not null references auth.users(id) on delete cascade,
  template_key text not null default 'tongchuang-wing' check (template_key in ('tongchuang-wing')),
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published')),
  name text not null default '',
  subtitle text,
  district_label text,
  completion_badge text,
  overview_title text,
  overview_body text,
  features_title text,
  progress_title text,
  progress_completion_text text,
  location_title text,
  contact_title text,
  contact_body text,
  sales_phone text,
  footer_disclaimer text,
  map_lat numeric,
  map_lng numeric,
  map_zoom integer,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  section_key text not null,
  storage_bucket text not null default 'property-media',
  storage_path text not null unique,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (property_id, section_key)
);

create table if not exists public.property_content_items (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  group_key text not null,
  item_key text,
  title text,
  body text,
  meta text,
  accent text,
  state text check (state in ('completed', 'current', 'upcoming')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_properties_merchant_user on public.properties(merchant_user_id, updated_at desc);
create index if not exists idx_properties_publish_status on public.properties(publish_status, updated_at desc);
create index if not exists idx_property_images_property_id on public.property_images(property_id);
create index if not exists idx_property_content_items_property_group on public.property_content_items(property_id, group_key, sort_order);

drop trigger if exists trg_properties_set_updated_at on public.properties;
create trigger trg_properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_content_items enable row level security;

drop policy if exists "merchant_select_own_properties" on public.properties;
create policy "merchant_select_own_properties"
  on public.properties
  for select
  using (
    auth.uid() = merchant_user_id
    or publish_status = 'published'
  );

drop policy if exists "merchant_insert_own_properties" on public.properties;
create policy "merchant_insert_own_properties"
  on public.properties
  for insert
  with check (auth.uid() = merchant_user_id);

drop policy if exists "merchant_update_own_properties" on public.properties;
create policy "merchant_update_own_properties"
  on public.properties
  for update
  using (auth.uid() = merchant_user_id)
  with check (auth.uid() = merchant_user_id);

drop policy if exists "admin_manage_properties" on public.properties;
create policy "admin_manage_properties"
  on public.properties
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "merchant_select_property_images" on public.property_images;
create policy "merchant_select_property_images"
  on public.property_images
  for select
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_images.property_id
        and (
          properties.merchant_user_id = auth.uid()
          or properties.publish_status = 'published'
        )
    )
  );

drop policy if exists "merchant_insert_property_images" on public.property_images;
create policy "merchant_insert_property_images"
  on public.property_images
  for insert
  with check (
    exists (
      select 1
      from public.properties
      where properties.id = property_images.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "merchant_update_property_images" on public.property_images;
create policy "merchant_update_property_images"
  on public.property_images
  for update
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_images.property_id
        and properties.merchant_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.properties
      where properties.id = property_images.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "merchant_delete_property_images" on public.property_images;
create policy "merchant_delete_property_images"
  on public.property_images
  for delete
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_images.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "admin_manage_property_images" on public.property_images;
create policy "admin_manage_property_images"
  on public.property_images
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "merchant_select_property_content_items" on public.property_content_items;
create policy "merchant_select_property_content_items"
  on public.property_content_items
  for select
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_content_items.property_id
        and (
          properties.merchant_user_id = auth.uid()
          or properties.publish_status = 'published'
        )
    )
  );

drop policy if exists "merchant_insert_property_content_items" on public.property_content_items;
create policy "merchant_insert_property_content_items"
  on public.property_content_items
  for insert
  with check (
    exists (
      select 1
      from public.properties
      where properties.id = property_content_items.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "merchant_update_property_content_items" on public.property_content_items;
create policy "merchant_update_property_content_items"
  on public.property_content_items
  for update
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_content_items.property_id
        and properties.merchant_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.properties
      where properties.id = property_content_items.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "merchant_delete_property_content_items" on public.property_content_items;
create policy "merchant_delete_property_content_items"
  on public.property_content_items
  for delete
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_content_items.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "admin_manage_property_content_items" on public.property_content_items;
create policy "admin_manage_property_content_items"
  on public.property_content_items
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
select 'property-media', 'property-media', true
where not exists (
  select 1 from storage.buckets where id = 'property-media'
);
