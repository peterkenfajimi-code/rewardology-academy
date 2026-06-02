-- ──────────────────────────────────────────────────────────────
-- Course progress: per-user, per-lesson earned XP (best result).
-- Powers cross-device XP sync for the /courses Course Centre.
-- Run in the Supabase SQL editor (safe to re-run).
-- ──────────────────────────────────────────────────────────────

create table if not exists public.course_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  course_id   integer not null,
  lesson_id   text not null,
  xp          integer not null,
  updated_at  timestamptz not null default now(),
  unique (user_id, course_id, lesson_id)
);

create index if not exists course_progress_user_idx
  on public.course_progress (user_id);

-- ── Row Level Security ──
alter table public.course_progress enable row level security;

drop policy if exists "cp_select_own" on public.course_progress;
create policy "cp_select_own"
  on public.course_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "cp_insert_own" on public.course_progress;
create policy "cp_insert_own"
  on public.course_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "cp_update_own" on public.course_progress;
create policy "cp_update_own"
  on public.course_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cp_delete_own" on public.course_progress;
create policy "cp_delete_own"
  on public.course_progress
  for delete
  using (auth.uid() = user_id);

-- ── Upsert helper: records lesson XP, keeping the best result ──
-- A lesson's XP only ever rises (a retake can improve a module quiz score
-- but never reduce previously earned XP).
create or replace function public.record_course_lesson(
  p_course_id integer,
  p_lesson_id text,
  p_xp        integer
)
returns void
language plpgsql
security invoker
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.course_progress
    (user_id, course_id, lesson_id, xp, updated_at)
  values
    (auth.uid(), p_course_id, p_lesson_id, p_xp, now())
  on conflict (user_id, course_id, lesson_id) do update
  set
    xp         = greatest(public.course_progress.xp, excluded.xp),
    updated_at = now();
end;
$$;
