-- kol_media_assets was created without a caption column,
-- but the resume media API inserts/reads caption.
alter table public.kol_media_assets
  add column if not exists caption text not null default '';
