alter table public.kol_applications
add column if not exists platform_accounts jsonb not null default '{}'::jsonb;
