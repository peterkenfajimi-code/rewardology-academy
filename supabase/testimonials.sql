-- Learner testimonials: collected after course / quiz / comic completion.
-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  source_type   text not null check (source_type in ('course', 'quiz', 'comic')),
  source_id     text not null,
  source_label  text not null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  quote         text,
  display_name  text not null,
  role_title    text,
  location      text,
  consent       boolean not null default false,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique (user_id, source_type, source_id)
);

create index if not exists testimonials_status_idx
  on public.testimonials (status, created_at desc);

create index if not exists testimonials_user_idx
  on public.testimonials (user_id);

alter table public.testimonials enable row level security;

drop policy if exists "testimonials_select_approved" on public.testimonials;
create policy "testimonials_select_approved"
  on public.testimonials for select
  using (status = 'approved');

drop policy if exists "testimonials_select_own" on public.testimonials;
create policy "testimonials_select_own"
  on public.testimonials for select
  using (auth.uid() = user_id);

drop policy if exists "testimonials_insert_own" on public.testimonials;
create policy "testimonials_insert_own"
  on public.testimonials for insert
  with check (auth.uid() = user_id);

-- Admin moderation (platform owner email — update if needed)
create or replace function public.list_pending_testimonials()
returns setof public.testimonials
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email constant text := 'peterkenfajimi@gmail.com';
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if (select email from auth.users where id = auth.uid()) is distinct from admin_email then
    raise exception 'Not authorized';
  end if;
  return query
    select * from public.testimonials
    where status = 'pending'
    order by created_at desc;
end;
$$;

create or replace function public.moderate_testimonial(
  p_id     uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email constant text := 'peterkenfajimi@gmail.com';
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if (select email from auth.users where id = auth.uid()) is distinct from admin_email then
    raise exception 'Not authorized';
  end if;
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid status';
  end if;
  update public.testimonials
  set status = p_status, reviewed_at = now()
  where id = p_id;
end;
$$;

grant execute on function public.list_pending_testimonials() to authenticated;
grant execute on function public.moderate_testimonial(uuid, text) to authenticated;
