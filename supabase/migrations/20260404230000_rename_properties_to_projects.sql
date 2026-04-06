-- Rename properties table → projects, template_key column → type
-- Foreign keys in child tables (property_images, property_content_items,
-- property_modules, property_inquiries) continue to work — Postgres tracks
-- FK references by OID, not by parent table name.

-- 1. Rename the table
alter table public.properties rename to projects;

-- 2. Rename the type column (was template_key)
alter table public.projects rename column template_key to type;

-- 3. Rename the check constraint to match the new table name
alter table public.projects
  rename constraint properties_template_key_check to projects_type_check;

-- 4. Rename the primary key constraint
alter table public.projects
  rename constraint properties_pkey to projects_pkey;

-- 5. Rename the slug unique constraint if it exists
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'projects' and constraint_name = 'properties_slug_key'
  ) then
    alter table public.projects rename constraint properties_slug_key to projects_slug_key;
  end if;
end $$;

-- 6. Update the archived_at index name (cosmetic, optional — indexes keep working)
-- NOTE: Postgres does not support ALTER INDEX RENAME inside a transaction on some
-- versions; skip renaming indexes for safety. They still function correctly.
