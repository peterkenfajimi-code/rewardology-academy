-- ──────────────────────────────────────────────────────────────
-- Quiz Centre progress: per-user, per-quiz best result + XP.
-- Powers cross-device XP sync for the /quizzes Quiz Centre.
-- Run in the Supabase SQL editor (safe to re-run).
-- ──────────────────────────────────────────────────────────────

create table if not exists public.quiz_centre_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  quiz_id     integer not null,
  best_score  integer not null,
  best_total  integer not null,
  best_xp     integer not null,
  attempts    integer not null default 1,
  updated_at  timestamptz not null default now(),
  unique (user_id, quiz_id)
);

create index if not exists quiz_centre_progress_user_idx
  on public.quiz_centre_progress (user_id);

-- ── Row Level Security ──
alter table public.quiz_centre_progress enable row level security;

drop policy if exists "qcp_select_own" on public.quiz_centre_progress;
create policy "qcp_select_own"
  on public.quiz_centre_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "qcp_insert_own" on public.quiz_centre_progress;
create policy "qcp_insert_own"
  on public.quiz_centre_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "qcp_update_own" on public.quiz_centre_progress;
create policy "qcp_update_own"
  on public.quiz_centre_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "qcp_delete_own" on public.quiz_centre_progress;
create policy "qcp_delete_own"
  on public.quiz_centre_progress
  for delete
  using (auth.uid() = user_id);

-- ── Upsert helper: records an attempt, keeping the best XP result ──
-- Increments attempt count every call; only raises the stored best
-- score/total/xp when the new attempt beats the previous best XP.
create or replace function public.record_quiz_centre_attempt(
  p_quiz_id integer,
  p_score   integer,
  p_total   integer,
  p_xp      integer
)
returns void
language plpgsql
security invoker
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.quiz_centre_progress
    (user_id, quiz_id, best_score, best_total, best_xp, attempts, updated_at)
  values
    (auth.uid(), p_quiz_id, p_score, p_total, p_xp, 1, now())
  on conflict (user_id, quiz_id) do update
  set
    attempts   = public.quiz_centre_progress.attempts + 1,
    best_xp    = greatest(public.quiz_centre_progress.best_xp, excluded.best_xp),
    best_score = case
                   when excluded.best_xp > public.quiz_centre_progress.best_xp
                     then excluded.best_score
                   else public.quiz_centre_progress.best_score
                 end,
    best_total = case
                   when excluded.best_xp > public.quiz_centre_progress.best_xp
                     then excluded.best_total
                   else public.quiz_centre_progress.best_total
                 end,
    updated_at = now();
end;
$$;
