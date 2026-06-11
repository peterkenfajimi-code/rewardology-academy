-- Article read progress: one row per user per article (XP awarded once).
-- Run in the Supabase SQL editor (safe to re-run).

create table if not exists public.article_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  article_id  integer not null,
  slug        text not null,
  xp          integer not null,
  read_at     timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists article_progress_user_idx
  on public.article_progress (user_id);

alter table public.article_progress enable row level security;

drop policy if exists "ap_select_own" on public.article_progress;
create policy "ap_select_own"
  on public.article_progress for select using (auth.uid() = user_id);

drop policy if exists "ap_insert_own" on public.article_progress;
create policy "ap_insert_own"
  on public.article_progress for insert with check (auth.uid() = user_id);

create or replace function public.record_article_read(
  p_article_id integer,
  p_slug       text,
  p_xp         integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.article_progress (user_id, article_id, slug, xp)
  values (auth.uid(), p_article_id, p_slug, p_xp)
  on conflict (user_id, article_id) do nothing;

  return found;
end;
$$;

grant execute on function public.record_article_read(integer, text, integer) to authenticated;
