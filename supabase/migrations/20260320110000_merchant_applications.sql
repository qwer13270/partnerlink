create table if not exists public.merchant_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null,
  company_name text not null default '',
  contact_name text not null default '',
  phone text not null default '',
  city text,
  project_count text,
  status text not null default 'pending_email_confirmation' check (
    status in ('pending_email_confirmation', 'pending_admin_review', 'approved', 'denied')
  ),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchant_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  application_id uuid not null unique references public.merchant_applications(id) on delete cascade,
  email text not null,
  company_name text not null default '',
  contact_name text not null default '',
  phone text not null default '',
  city text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_merchant_applications_status on public.merchant_applications(status);
create index if not exists idx_merchant_applications_submitted_at on public.merchant_applications(submitted_at desc);
create index if not exists idx_merchant_profiles_status on public.merchant_profiles(status);

drop trigger if exists trg_merchant_applications_set_updated_at on public.merchant_applications;
create trigger trg_merchant_applications_set_updated_at
before update on public.merchant_applications
for each row
execute function public.set_updated_at();

drop trigger if exists trg_merchant_profiles_set_updated_at on public.merchant_profiles;
create trigger trg_merchant_profiles_set_updated_at
before update on public.merchant_profiles
for each row
execute function public.set_updated_at();

alter table public.merchant_applications enable row level security;
alter table public.merchant_profiles enable row level security;

drop policy if exists "applicant_select_own_merchant_application" on public.merchant_applications;
create policy "applicant_select_own_merchant_application"
  on public.merchant_applications
  for select
  using (auth.uid() = user_id);

drop policy if exists "applicant_insert_own_merchant_application" on public.merchant_applications;
create policy "applicant_insert_own_merchant_application"
  on public.merchant_applications
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "applicant_update_own_pending_merchant_application" on public.merchant_applications;
create policy "applicant_update_own_pending_merchant_application"
  on public.merchant_applications
  for update
  using (
    auth.uid() = user_id
    and status in ('pending_email_confirmation', 'pending_admin_review')
  )
  with check (
    auth.uid() = user_id
    and status in ('pending_email_confirmation', 'pending_admin_review')
  );

drop policy if exists "admin_manage_merchant_applications" on public.merchant_applications;
create policy "admin_manage_merchant_applications"
  on public.merchant_applications
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "merchant_select_own_profile" on public.merchant_profiles;
create policy "merchant_select_own_profile"
  on public.merchant_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "admin_manage_merchant_profiles" on public.merchant_profiles;
create policy "admin_manage_merchant_profiles"
  on public.merchant_profiles
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
