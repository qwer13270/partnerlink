create table if not exists public.property_modules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  module_type text not null check (
    module_type in (
      'hero',
      'intro_identity',
      'intro_specs',
      'features',
      'progress',
      'location',
      'contact',
      'footer',
      'image_section'
    )
  ),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_property_modules_singletons
  on public.property_modules(property_id, module_type)
  where module_type <> 'image_section';

create index if not exists idx_property_modules_property_sort
  on public.property_modules(property_id, sort_order);

drop trigger if exists trg_property_modules_set_updated_at on public.property_modules;
create trigger trg_property_modules_set_updated_at
before update on public.property_modules
for each row
execute function public.set_updated_at();

alter table public.property_modules enable row level security;

drop policy if exists "merchant_select_property_modules" on public.property_modules;
create policy "merchant_select_property_modules"
  on public.property_modules
  for select
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_modules.property_id
        and (
          properties.merchant_user_id = auth.uid()
          or properties.publish_status = 'published'
        )
    )
  );

drop policy if exists "merchant_insert_property_modules" on public.property_modules;
create policy "merchant_insert_property_modules"
  on public.property_modules
  for insert
  with check (
    exists (
      select 1
      from public.properties
      where properties.id = property_modules.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "merchant_update_property_modules" on public.property_modules;
create policy "merchant_update_property_modules"
  on public.property_modules
  for update
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_modules.property_id
        and properties.merchant_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.properties
      where properties.id = property_modules.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "merchant_delete_property_modules" on public.property_modules;
create policy "merchant_delete_property_modules"
  on public.property_modules
  for delete
  using (
    exists (
      select 1
      from public.properties
      where properties.id = property_modules.property_id
        and properties.merchant_user_id = auth.uid()
    )
  );

drop policy if exists "admin_manage_property_modules" on public.property_modules;
create policy "admin_manage_property_modules"
  on public.property_modules
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.property_modules (property_id, module_type, sort_order, is_visible, settings_json)
select
  properties.id,
  modules.module_type,
  modules.sort_order,
  true,
  '{}'::jsonb
from public.properties
cross join (
  values
    ('hero', 0),
    ('intro_identity', 1),
    ('intro_specs', 2),
    ('features', 3),
    ('progress', 4),
    ('location', 5),
    ('contact', 6),
    ('footer', 7)
) as modules(module_type, sort_order)
where not exists (
  select 1 from public.property_modules where property_modules.property_id = properties.id
);
