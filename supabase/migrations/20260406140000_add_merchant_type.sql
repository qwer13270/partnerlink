-- Add merchant_type to merchant_applications
alter table public.merchant_applications
  add column if not exists merchant_type text check (merchant_type in ('建案', '商案'));

-- Add merchant_type to merchant_profiles
alter table public.merchant_profiles
  add column if not exists merchant_type text check (merchant_type in ('建案', '商案'));
