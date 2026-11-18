-- Platform-wide admin analytics snapshot (bypasses RLS for the platform owner only).
-- Apply with: node scripts/apply-admin-platform-stats.mjs
-- Uses __ADMIN_EMAIL__ placeholder (replaced from ADMIN_EMAIL at apply time).

create or replace function public.admin_assert_platform_owner()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email constant text := '__ADMIN_EMAIL__';
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if (select email from auth.users where id = auth.uid()) is distinct from admin_email then
    raise exception 'Not authorized';
  end if;
end;
$$;

-- Raw rows for server-side aggregation in /api/setup/admin-stats (course catalog lives in app code).
create or replace function public.admin_stats_snapshot()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  perform public.admin_assert_platform_owner();

  select json_build_object(
    'profiles',
      coalesce(
        (select json_agg(row_to_json(t)) from (select id, created_at from public.profiles) t),
        '[]'::json
      ),
    'courseProgress',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select user_id, course_id, lesson_id, xp, updated_at from public.course_progress
        ) t),
        '[]'::json
      ),
    'quizProgress',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select user_id, quiz_id, best_xp, best_score, best_total, updated_at
          from public.quiz_centre_progress
        ) t),
        '[]'::json
      ),
    'dailyQuiz',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select user_id, xp_earned, created_at from public.daily_quiz_completions
        ) t),
        '[]'::json
      ),
    'articleProgress',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select user_id, xp from public.article_progress
        ) t),
        '[]'::json
      ),
    'dictionaryProgress',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select user_id, xp from public.dictionary_progress
        ) t),
        '[]'::json
      ),
    'comicsProgress',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select user_id, xp from public.comics_progress
        ) t),
        '[]'::json
      ),
    'testimonials',
      coalesce(
        (select json_agg(row_to_json(t)) from (
          select id, status from public.testimonials
        ) t),
        '[]'::json
      )
  ) into result;

  return result;
end;
$$;

-- Group locations by ISO code so "US" and "United States" do not split into two bars.
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
              max(country_name) as "countryName",
              count(*)::int as users
            from public.user_locations
            where country_code is not null
            group by country_code
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

grant execute on function public.admin_assert_platform_owner() to authenticated;
grant execute on function public.admin_stats_snapshot() to authenticated;