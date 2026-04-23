create table if not exists public.kol_reminder_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_stage smallint not null check (reminder_stage in (3, 7, 14)),
  sent_at timestamptz not null default now(),
  primary key (user_id, reminder_stage)
);

alter table public.kol_reminder_log enable row level security;

-- Service role bypasses RLS; no policies needed for end users.
