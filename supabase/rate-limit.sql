-- Shared rate-limit / lockout counters for serverless (Netlify) instances.
-- Bucket ids are HMAC'd in the app so raw IPs are not stored.
-- Run in the Academy SQL Editor (safe to re-run). Explicit grants are required
-- for tables created after 30 October 2026.

create table if not exists public.rate_limit_buckets (
  id            text primary key,
  count         integer not null default 0,
  reset_at      timestamptz not null,
  failures      integer not null default 0,
  window_start  timestamptz,
  locked_until  timestamptz,
  updated_at    timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.consume_rate_limit(
  p_id text,
  p_limit integer,
  p_window_seconds integer
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.rate_limit_buckets%rowtype;
  now_ts timestamptz := clock_timestamp();
  window_iv interval;
begin
  if p_id is null or length(p_id) < 16 or length(p_id) > 128 then
    raise exception 'invalid bucket';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 10000 then
    raise exception 'invalid limit';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid window';
  end if;

  window_iv := make_interval(secs => p_window_seconds);

  insert into public.rate_limit_buckets (id, count, reset_at, updated_at)
  values (p_id, 1, now_ts + window_iv, now_ts)
  on conflict (id) do update
    set count = case
          when public.rate_limit_buckets.reset_at <= now_ts then 1
          else public.rate_limit_buckets.count + 1
        end,
        reset_at = case
          when public.rate_limit_buckets.reset_at <= now_ts then now_ts + window_iv
          else public.rate_limit_buckets.reset_at
        end,
        updated_at = now_ts
  returning * into rec;

  return json_build_object(
    'ok', rec.count <= p_limit,
    'remaining', greatest(0, p_limit - rec.count),
    'retryAfterSec', greatest(1, ceil(extract(epoch from (rec.reset_at - now_ts))))
  );
end;
$$;

create or replace function public.register_auth_failure(
  p_id text,
  p_max_failures integer,
  p_window_seconds integer,
  p_lock_seconds integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.rate_limit_buckets%rowtype;
  now_ts timestamptz := clock_timestamp();
begin
  if p_id is null or length(p_id) < 16 or length(p_id) > 128 then
    raise exception 'invalid bucket';
  end if;

  insert into public.rate_limit_buckets (
    id, count, reset_at, failures, window_start, locked_until, updated_at
  )
  values (p_id, 0, now_ts, 1, now_ts, null, now_ts)
  on conflict (id) do update
    set failures = case
          when public.rate_limit_buckets.window_start is null
            or now_ts - public.rate_limit_buckets.window_start > make_interval(secs => p_window_seconds)
            then 1
          else public.rate_limit_buckets.failures + 1
        end,
        window_start = case
          when public.rate_limit_buckets.window_start is null
            or now_ts - public.rate_limit_buckets.window_start > make_interval(secs => p_window_seconds)
            then now_ts
          else public.rate_limit_buckets.window_start
        end,
        locked_until = case
          when (
            case
              when public.rate_limit_buckets.window_start is null
                or now_ts - public.rate_limit_buckets.window_start > make_interval(secs => p_window_seconds)
                then 1
              else public.rate_limit_buckets.failures + 1
            end
          ) >= p_max_failures
            then now_ts + make_interval(secs => p_lock_seconds)
          else public.rate_limit_buckets.locked_until
        end,
        updated_at = now_ts
  returning * into rec;

  if rec.locked_until is not null and rec.locked_until > now_ts then
    return greatest(1, ceil(extract(epoch from (rec.locked_until - now_ts)))::integer);
  end if;
  return 0;
end;
$$;

create or replace function public.auth_lock_remaining(p_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  until_ts timestamptz;
  now_ts timestamptz := clock_timestamp();
begin
  if p_id is null or length(p_id) < 16 or length(p_id) > 128 then
    return 0;
  end if;
  select locked_until into until_ts from public.rate_limit_buckets where id = p_id;
  if until_ts is null or until_ts <= now_ts then
    return 0;
  end if;
  return greatest(1, ceil(extract(epoch from (until_ts - now_ts)))::integer);
end;
$$;

create or replace function public.clear_auth_failures(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_id is null or length(p_id) < 16 or length(p_id) > 128 then
    return;
  end if;
  update public.rate_limit_buckets
  set failures = 0, locked_until = null, window_start = null, updated_at = clock_timestamp()
  where id = p_id;
end;
$$;

revoke all on table public.rate_limit_buckets from anon, authenticated;
grant select, insert, update, delete on table public.rate_limit_buckets to service_role;

grant execute on function public.consume_rate_limit(text, integer, integer) to anon, authenticated;
grant execute on function public.register_auth_failure(text, integer, integer, integer) to anon, authenticated;
grant execute on function public.auth_lock_remaining(text) to anon, authenticated;
grant execute on function public.clear_auth_failures(text) to anon, authenticated;
