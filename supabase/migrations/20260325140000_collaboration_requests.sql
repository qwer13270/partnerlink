-- ── collaboration_requests ────────────────────────────────────────────────
create table if not exists public.collaboration_requests (
  id                 uuid        primary key default gen_random_uuid(),
  project_id         uuid        not null references public.properties(id) on delete cascade,
  merchant_user_id   uuid        not null references auth.users(id) on delete cascade,
  kol_user_id        uuid        not null references auth.users(id) on delete cascade,
  sender_role        text        not null check (sender_role in ('merchant', 'kol')),
  status             text        not null default 'pending'
                                 check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  message            text,
  created_at         timestamptz not null default now(),
  responded_at       timestamptz,
  cancelled_at       timestamptz,
  updated_at         timestamptz not null default now()
);

-- Only one pending request per merchant+kol+project at a time
create unique index if not exists
  uq_collab_requests_pending
  on public.collaboration_requests (project_id, merchant_user_id, kol_user_id)
  where (status = 'pending');

create index if not exists idx_collab_req_merchant
  on public.collaboration_requests (merchant_user_id, status, created_at desc);

create index if not exists idx_collab_req_kol
  on public.collaboration_requests (kol_user_id, status, created_at desc);

create index if not exists idx_collab_req_project
  on public.collaboration_requests (project_id, status, created_at desc);

-- ── collaborations ────────────────────────────────────────────────────────
create table if not exists public.collaborations (
  id                 uuid        primary key default gen_random_uuid(),
  project_id         uuid        not null references public.properties(id) on delete cascade,
  merchant_user_id   uuid        not null references auth.users(id) on delete cascade,
  kol_user_id        uuid        not null references auth.users(id) on delete cascade,
  request_id         uuid        not null unique references public.collaboration_requests(id),
  status             text        not null default 'active'
                                 check (status in ('active', 'ended')),
  created_at         timestamptz not null default now(),
  ended_at           timestamptz,
  updated_at         timestamptz not null default now()
);

-- Only one active collaboration per merchant+kol+project
create unique index if not exists
  uq_collaborations_active
  on public.collaborations (project_id, merchant_user_id, kol_user_id)
  where (status = 'active');

create index if not exists idx_collaborations_merchant
  on public.collaborations (merchant_user_id, status, created_at desc);

create index if not exists idx_collaborations_kol
  on public.collaborations (kol_user_id, status, created_at desc);

create index if not exists idx_collaborations_project
  on public.collaborations (project_id, status, created_at desc);

-- ── updated_at triggers ───────────────────────────────────────────────────
drop trigger if exists trg_collab_requests_updated_at on public.collaboration_requests;
create trigger trg_collab_requests_updated_at
  before update on public.collaboration_requests
  for each row execute function public.set_updated_at();

drop trigger if exists trg_collaborations_updated_at on public.collaborations;
create trigger trg_collaborations_updated_at
  before update on public.collaborations
  for each row execute function public.set_updated_at();

-- ── Cross-table guard: block new request when active collaboration exists ─
create or replace function public.check_no_active_collaboration()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.collaborations
    where project_id        = new.project_id
      and merchant_user_id  = new.merchant_user_id
      and kol_user_id       = new.kol_user_id
      and status            = 'active'
  ) then
    raise exception 'active_collaboration_exists'
      using hint = 'An active collaboration already exists for this merchant, KOL, and project.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_no_active_collaboration on public.collaboration_requests;
create trigger trg_check_no_active_collaboration
  before insert on public.collaboration_requests
  for each row execute function public.check_no_active_collaboration();

-- ── accept_collaboration_request RPC ─────────────────────────────────────
-- Atomically transitions a pending request to accepted and creates the
-- collaboration row. Verifies the caller is the recipient.
create or replace function public.accept_collaboration_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req   public.collaboration_requests%rowtype;
  v_me    uuid := auth.uid();
begin
  -- Lock the row for the duration of this transaction
  select * into v_req
  from public.collaboration_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'request_not_found'
      using hint = 'No collaboration request with that ID.';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'request_not_pending'
      using hint = 'Only pending requests can be accepted.';
  end if;

  -- Caller must be the recipient (not the sender)
  if v_req.sender_role = 'merchant' and v_me <> v_req.kol_user_id then
    raise exception 'not_recipient'
      using hint = 'Only the KOL recipient can accept a merchant-sent request.';
  end if;

  if v_req.sender_role = 'kol' and v_me <> v_req.merchant_user_id then
    raise exception 'not_recipient'
      using hint = 'Only the merchant recipient can accept a KOL-sent request.';
  end if;

  -- Transition the request
  update public.collaboration_requests
  set status       = 'accepted',
      responded_at = now(),
      updated_at   = now()
  where id = p_request_id;

  -- Create the collaboration row
  insert into public.collaborations (project_id, merchant_user_id, kol_user_id, request_id)
  values (v_req.project_id, v_req.merchant_user_id, v_req.kol_user_id, p_request_id);
end;
$$;

-- Only authenticated users can call this; the function enforces recipient check
revoke execute on function public.accept_collaboration_request(uuid) from public, anon;
grant  execute on function public.accept_collaboration_request(uuid) to authenticated;

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.collaboration_requests enable row level security;
alter table public.collaborations          enable row level security;

-- collaboration_requests: participants can read their own rows
drop policy if exists "participants_select_collab_requests" on public.collaboration_requests;
create policy "participants_select_collab_requests"
  on public.collaboration_requests for select
  using (auth.uid() = merchant_user_id or auth.uid() = kol_user_id);

-- collaboration_requests: merchant inserts with sender_role = 'merchant'
drop policy if exists "merchant_insert_collab_request" on public.collaboration_requests;
create policy "merchant_insert_collab_request"
  on public.collaboration_requests for insert
  with check (
    auth.uid() = merchant_user_id
    and sender_role = 'merchant'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'merchant'
  );

-- collaboration_requests: KOL inserts with sender_role = 'kol'
drop policy if exists "kol_insert_collab_request" on public.collaboration_requests;
create policy "kol_insert_collab_request"
  on public.collaboration_requests for insert
  with check (
    auth.uid() = kol_user_id
    and sender_role = 'kol'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'kol'
  );

-- collaborations: participants can read their own rows
drop policy if exists "participants_select_collaborations" on public.collaborations;
create policy "participants_select_collaborations"
  on public.collaborations for select
  using (auth.uid() = merchant_user_id or auth.uid() = kol_user_id);

-- Admin full access
drop policy if exists "admin_all_collab_requests" on public.collaboration_requests;
create policy "admin_all_collab_requests"
  on public.collaboration_requests for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_all_collaborations" on public.collaborations;
create policy "admin_all_collaborations"
  on public.collaborations for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
