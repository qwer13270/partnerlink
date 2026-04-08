-- Drop avg_views and engagement_rate columns from kol_applications
-- These fields are no longer collected or displayed in the platform.

alter table public.kol_applications
  drop column if exists avg_views,
  drop column if exists engagement_rate;
