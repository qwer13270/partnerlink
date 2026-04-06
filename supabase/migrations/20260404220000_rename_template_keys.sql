-- Rename template_key values from English slugs to Chinese labels
-- and update the check constraint accordingly

-- 1. Drop existing constraint
alter table public.properties
  drop constraint properties_template_key_check;

-- 2. Migrate existing rows
update public.properties
  set template_key = '建案'
  where template_key = 'tongchuang-wing';

update public.properties
  set template_key = '商案'
  where template_key = 'tongchuang-wing-commercial';

-- 3. Update default and add new constraint
alter table public.properties
  alter column template_key set default '建案',
  add constraint properties_template_key_check
    check (template_key in ('建案', '商案'));
