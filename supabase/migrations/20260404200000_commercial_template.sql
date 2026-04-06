-- Allow 商案 (commercial) template in addition to the existing 建案 template
alter table public.properties
  drop constraint properties_template_key_check,
  add constraint properties_template_key_check
    check (template_key in ('建案', '商案'));
