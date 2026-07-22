-- User location analytics: approximate geo from IP/CDN headers on signed-in visits.
-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.user_locations (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  country_code  text,
  country_name  text,
  region        text,
  city          text,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create index if not exists user_locations_country_idx
  on public.user_locations (country_code);

create index if not exists user_locations_last_seen_idx
  on public.user_locations (last_seen_at desc);

alter table public.user_locations enable row level security;

drop policy if exists "ul_select_own" on public.user_locations;
create policy "ul_select_own"
  on public.user_locations for select
  using (auth.uid() = user_id);

drop policy if exists "ul_insert_own" on public.user_locations;
create policy "ul_insert_own"
  on public.user_locations for insert
  with check (auth.uid() = user_id);

drop policy if exists "ul_update_own" on public.user_locations;
create policy "ul_update_own"
  on public.user_locations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Upsert last-known location for the signed-in user.
create or replace function public.record_user_location(
  p_country_code text,
  p_country_name text,
  p_region       text,
  p_city         text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_locations (
    user_id, country_code, country_name, region, city, last_seen_at
  )
  values (
    auth.uid(),
    nullif(trim(p_country_code), ''),
    nullif(trim(p_country_name), ''),
    nullif(trim(p_region), ''),
    nullif(trim(p_city), ''),
    now()
  )
  on conflict (user_id) do update set
    country_code = coalesce(excluded.country_code, public.user_locations.country_code),
    country_name = coalesce(excluded.country_name, public.user_locations.country_name),
    region       = coalesce(excluded.region, public.user_locations.region),
    city         = coalesce(excluded.city, public.user_locations.city),
    last_seen_at = now();
end;
$$;

-- Admin email is injected at apply time from ADMIN_EMAIL env (__ADMIN_EMAIL__ placeholder).
create or replace function public.admin_user_location_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email constant text := '__ADMIN_EMAIL__';
  result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if (select email from auth.users where id = auth.uid()) is distinct from admin_email then
    raise exception 'Not authorized';
  end if;

  select json_build_object(
    'totalTracked',
      (select count(*)::int from public.user_locations where country_code is not null),
    'totalUsers',
      (select count(*)::int from public.profiles),
    'unknown',
      (
        select count(*)::int
        from public.profiles p
        left join public.user_locations ul on ul.user_id = p.id
        where ul.user_id is null or ul.country_code is null
      ),
    'countriesRepresented',
      (select count(distinct country_code)::int from public.user_locations where country_code is not null),
    'byCountry',
      coalesce(
        (
          select json_agg(row_to_json(t) order by t.users desc)
          from (
            select
              country_code as "countryCode",
              country_name as "countryName",
              count(*)::int as users
            from public.user_locations
            where country_code is not null
            group by country_code, country_name
            order by count(*) desc
            limit 20
          ) t
        ),
        '[]'::json
      ),
    'byRegion',
      coalesce(
        (
          select json_agg(row_to_json(t) order by t.users desc)
          from (
            select
              country_code as "countryCode",
              region,
              count(*)::int as users
            from public.user_locations
            where region is not null and country_code is not null
            group by country_code, region
            order by count(*) desc
            limit 15
          ) t
        ),
        '[]'::json
      ),
    'recent',
      coalesce(
        (
          select json_agg(row_to_json(t))
          from (
            select
              country_code as "countryCode",
              country_name as "countryName",
              region,
              city,
              last_seen_at as "lastSeenAt"
            from public.user_locations
            where country_code is not null
            order by last_seen_at desc
            limit 10
          ) t
        ),
        '[]'::json
      )
  ) into result;

  return result;
end;
$$;

grant execute on function public.record_user_location(text, text, text, text) to authenticated;
grant execute on function public.admin_user_location_stats() to authenticated;
