-- Storage bucket for KOL application media uploads

insert into storage.buckets (id, name, public)
select 'kol-media', 'kol-media', false
where not exists (
  select 1 from storage.buckets where id = 'kol-media'
);
