-- Daily quiz: one completion per user per calendar day (UTC).
create table if not exists public.daily_quiz_completions (
  user_id        uuid not null references auth.users (id) on delete cascade,
  quiz_date      date not null,
  question_id    text not null,
  selected_option text not null,
  correct        boolean not null,
  xp_earned      integer not null default 0,
  created_at     timestamptz not null default now(),
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
security definer
set search_path = public
as $$
begin
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

grant execute on function public.record_daily_quiz_completion(date, text, text, boolean, integer) to authenticated;
