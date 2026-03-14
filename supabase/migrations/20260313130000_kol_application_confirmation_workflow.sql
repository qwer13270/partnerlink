drop trigger if exists trg_sync_kol_application_from_auth_user on auth.users;
drop function if exists public.sync_kol_application_from_auth_user();

alter table public.kol_applications
  drop constraint if exists kol_applications_status_check;

alter table public.kol_applications
  add constraint kol_applications_status_check
  check (status in ('pending_email_confirmation', 'pending_admin_review', 'approved', 'denied'));

alter table public.kol_applications
  add column if not exists rejection_reason text;

update public.kol_applications
set status = 'pending_admin_review'
where status = 'pending';

drop policy if exists "applicant_update_own_pending_kol_application" on public.kol_applications;
create policy "applicant_update_own_pending_kol_application"
  on public.kol_applications
  for update
  using (auth.uid() = user_id and status in ('pending_email_confirmation', 'pending_admin_review'))
  with check (auth.uid() = user_id and status in ('pending_email_confirmation', 'pending_admin_review'));
