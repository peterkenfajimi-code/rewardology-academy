-- Comics issue progress: one row per user per issue (25 XP awarded once).
-- Run in the Supabase SQL editor (safe to re-run).

create table if not exists public.comics_progress (
  user_id       uuid not null references auth.users (id) on delete cascade,
  slug          text not null,
  issue_number  integer not null,
  xp            integer not null default 25,
  read_at       timestamptz not null default now(),
  primary key (user_id, slug)
);

create index if not exists comics_progress_user_idx
  on public.comics_progress (user_id);

alter table public.comics_progress enable row level security;

drop policy if exists "cp_select_own" on public.comics_progress;
create policy "cp_select_own"
  on public.comics_progress for select using (auth.uid() = user_id);

drop policy if exists "cp_insert_own" on public.comics_progress;
create policy "cp_insert_own"
  on public.comics_progress for insert with check (auth.uid() = user_id);

create or replace function public.record_comic_issue(
  p_slug          text,
  p_issue_number  integer,
  p_xp            integer default 25
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.comics_progress (user_id, slug, issue_number, xp)
  values (auth.uid(), p_slug, p_issue_number, p_xp)
  on conflict (user_id, slug) do nothing;

  return found;
end;
$$;

grant execute on function public.record_comic_issue(text, integer, integer) to authenticated;
