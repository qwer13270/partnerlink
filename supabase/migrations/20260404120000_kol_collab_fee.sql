-- Add collab_fee (NTD) to kol_applications
-- Nullable — KOL sets their own fee; NULL means not yet specified.

alter table public.kol_applications
  add column if not exists collab_fee integer check (collab_fee >= 0);
