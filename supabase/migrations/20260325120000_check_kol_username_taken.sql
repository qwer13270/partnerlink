-- Returns true if a kol_username is already registered in auth.users metadata.
-- Called by the /api/kol/check-username route (service role only).
create or replace function public.check_kol_username_taken(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where raw_user_meta_data->>'kol_username' = p_username
  );
$$;

-- Revoke public execute; only the service role (via API route) should call this.
revoke execute on function public.check_kol_username_taken(text) from public, anon, authenticated;
grant execute on function public.check_kol_username_taken(text) to service_role;
