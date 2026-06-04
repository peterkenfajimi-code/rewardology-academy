-- ══════════════════════════════════════════════════════════════
-- Rewardology Academy — full Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → paste → Run
-- Safe to re-run.
-- ══════════════════════════════════════════════════════════════

-- ── 1. Profiles (auth users) ─────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.touch_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- ── 2. Quiz Centre progress ────────────────────────────────────

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

alter table public.quiz_centre_progress enable row level security;

drop policy if exists "qcp_select_own" on public.quiz_centre_progress;
create policy "qcp_select_own"
  on public.quiz_centre_progress for select using (auth.uid() = user_id);

drop policy if exists "qcp_insert_own" on public.quiz_centre_progress;
create policy "qcp_insert_own"
  on public.quiz_centre_progress for insert with check (auth.uid() = user_id);

drop policy if exists "qcp_update_own" on public.quiz_centre_progress;
create policy "qcp_update_own"
  on public.quiz_centre_progress for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "qcp_delete_own" on public.quiz_centre_progress;
create policy "qcp_delete_own"
  on public.quiz_centre_progress for delete using (auth.uid() = user_id);

create or replace function public.record_quiz_centre_attempt(
  p_quiz_id integer,
  p_score   integer,
  p_total   integer,
  p_xp      integer
)
returns void language plpgsql security invoker as $$
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

-- ── 3. Course Centre progress ──────────────────────────────────

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

alter table public.course_progress enable row level security;

drop policy if exists "cp_select_own" on public.course_progress;
create policy "cp_select_own"
  on public.course_progress for select using (auth.uid() = user_id);

drop policy if exists "cp_insert_own" on public.course_progress;
create policy "cp_insert_own"
  on public.course_progress for insert with check (auth.uid() = user_id);

drop policy if exists "cp_update_own" on public.course_progress;
create policy "cp_update_own"
  on public.course_progress for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cp_delete_own" on public.course_progress;
create policy "cp_delete_own"
  on public.course_progress for delete using (auth.uid() = user_id);

create or replace function public.record_course_lesson(
  p_course_id integer,
  p_lesson_id text,
  p_xp        integer
)
returns void language plpgsql security invoker as $$
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

-- ── Daily quiz (homepage) ─────────────────────────────────────
create table if not exists public.daily_quiz_completions (
  user_id         uuid not null references auth.users (id) on delete cascade,
  quiz_date       date not null,
  question_id     text not null,
  selected_option text not null,
  correct         boolean not null,
  xp_earned       integer not null default 0,
  created_at      timestamptz not null default now(),
  primary key (user_id, quiz_date)
);

create index if not exists daily_quiz_completions_user_idx
  on public.daily_quiz_completions (user_id);

alter table public.daily_quiz_completions enable row level security;

drop policy if exists "dqc_select_own" on public.daily_quiz_completions;
create policy "dqc_select_own"
  on public.daily_quiz_completions for select using (auth.uid() = user_id);

drop policy if exists "dqc_insert_own" on public.daily_quiz_completions;
create policy "dqc_insert_own"
  on public.daily_quiz_completions for insert with check (auth.uid() = user_id);

drop policy if exists "dqc_update_own" on public.daily_quiz_completions;
create policy "dqc_update_own"
  on public.daily_quiz_completions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.record_daily_quiz_completion(
  p_quiz_date date,
  p_question_id text,
  p_selected_option text,
  p_correct boolean,
  p_xp_earned integer
)
returns void
language plpgsql
security invoker
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.daily_quiz_completions (
    user_id, quiz_date, question_id, selected_option, correct, xp_earned
  )
  values (
    auth.uid(), p_quiz_date, p_question_id, p_selected_option, p_correct, p_xp_earned
  )
  on conflict (user_id, quiz_date) do update set
    question_id = excluded.question_id,
    selected_option = excluded.selected_option,
    correct = excluded.correct,
    xp_earned = excluded.xp_earned,
    created_at = now();
end;
$$;
