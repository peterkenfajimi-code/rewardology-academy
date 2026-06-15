-- Dictionary term progress: one row per user per term (5 XP awarded once).
-- Run in the Supabase SQL editor (safe to re-run).

create table if not exists public.dictionary_progress (
  user_id   uuid not null references auth.users (id) on delete cascade,
  term      text not null,
  xp        integer not null default 5,
  read_at   timestamptz not null default now(),
  primary key (user_id, term)
);

create index if not exists dictionary_progress_user_idx
  on public.dictionary_progress (user_id);

alter table public.dictionary_progress enable row level security;

drop policy if exists "dp_select_own" on public.dictionary_progress;
create policy "dp_select_own"
  on public.dictionary_progress for select using (auth.uid() = user_id);

drop policy if exists "dp_insert_own" on public.dictionary_progress;
create policy "dp_insert_own"
  on public.dictionary_progress for insert with check (auth.uid() = user_id);

create or replace function public.record_dictionary_term(
  p_term text,
  p_xp   integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.dictionary_progress (user_id, term, xp)
  values (auth.uid(), p_term, p_xp)
  on conflict (user_id, term) do nothing;

  return found;
end;
$$;

grant execute on function public.record_dictionary_term(text, integer) to authenticated;
