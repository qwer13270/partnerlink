-- KOL application review workflow tables

create extension if not exists pgcrypto;

create table if not exists public.kol_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  platforms text[] not null default '{}',
  follower_range text,
  content_type text,
  bio text not null default '',
  city text,
  avg_views text,
  engagement_rate text,
  photos text[] not null default '{}',
  videos jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kol_media_assets (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.kol_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  storage_bucket text not null default 'kol-media',
  storage_path text not null unique,
  mime_type text,
  file_size_bytes bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_kol_applications_status on public.kol_applications(status);
create index if not exists idx_kol_applications_submitted_at on public.kol_applications(submitted_at desc);
create index if not exists idx_kol_media_assets_application_id on public.kol_media_assets(application_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_kol_applications_set_updated_at on public.kol_applications;
create trigger trg_kol_applications_set_updated_at
before update on public.kol_applications
for each row
execute function public.set_updated_at();

alter table public.kol_applications enable row level security;
alter table public.kol_media_assets enable row level security;

-- Applicant can manage their own pending application.
drop policy if exists "applicant_select_own_kol_application" on public.kol_applications;
create policy "applicant_select_own_kol_application"
  on public.kol_applications
  for select
  using (auth.uid() = user_id);

drop policy if exists "applicant_insert_own_kol_application" on public.kol_applications;
create policy "applicant_insert_own_kol_application"
  on public.kol_applications
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "applicant_update_own_pending_kol_application" on public.kol_applications;
create policy "applicant_update_own_pending_kol_application"
  on public.kol_applications
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- Admin can read and update all applications.
drop policy if exists "admin_manage_kol_applications" on public.kol_applications;
create policy "admin_manage_kol_applications"
  on public.kol_applications
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Applicant and admin media visibility.
drop policy if exists "applicant_select_own_kol_media_assets" on public.kol_media_assets;
create policy "applicant_select_own_kol_media_assets"
  on public.kol_media_assets
  for select
  using (auth.uid() = user_id);

drop policy if exists "applicant_insert_own_kol_media_assets" on public.kol_media_assets;
create policy "applicant_insert_own_kol_media_assets"
  on public.kol_media_assets
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "applicant_delete_own_kol_media_assets" on public.kol_media_assets;
create policy "applicant_delete_own_kol_media_assets"
  on public.kol_media_assets
  for delete
  using (auth.uid() = user_id);

drop policy if exists "admin_manage_kol_media_assets" on public.kol_media_assets;
create policy "admin_manage_kol_media_assets"
  on public.kol_media_assets
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
