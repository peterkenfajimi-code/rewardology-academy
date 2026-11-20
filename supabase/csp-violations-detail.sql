-- Academy project. Row-level CSP Report-Only store.
-- No IP addresses. 30-day retention. De-dup identical reports.
-- Existing public.csp_violation_summaries (host rollup) stays.

create table if not exists public.csp_violations (
  id bigint generated always as identity primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  hit_count integer not null default 1,
  directive text not null,
  blocked_uri text not null default '',
  document_uri text not null default '',
  user_agent text not null default '',
  unique (directive, blocked_uri, document_uri)
);

comment on table public.csp_violations is
  'De-duplicated CSP Report-Only hits. Service-role table; no client IPs. 30-day retention.';

create index if not exists idx_csp_violations_last_seen
  on public.csp_violations (last_seen desc);

alter table public.csp_violations enable row level security;

revoke all on table public.csp_violations from anon, authenticated;
grant select, insert, update, delete on table public.csp_violations to service_role;

create or replace function public.purge_csp_logs()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer := 0;
  s integer := 0;
begin
  delete from public.csp_violations
  where last_seen < clock_timestamp() - interval '30 days';
  get diagnostics n = row_count;
  delete from public.csp_violation_summaries
  where last_seen < clock_timestamp() - interval '30 days';
  get diagnostics s = row_count;
  return n + s;
end;
$$;

revoke all on function public.purge_csp_logs() from public;
grant execute on function public.purge_csp_logs() to service_role;

create or replace function public.record_csp_violation_row(
  p_directive text,
  p_blocked_uri text,
  p_document_uri text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d text := left(trim(coalesce(p_directive, '')), 200);
  b text := left(coalesce(p_blocked_uri, ''), 500);
  doc text := left(coalesce(p_document_uri, ''), 500);
  ua text := left(coalesce(p_user_agent, ''), 300);
begin
  if length(d) = 0 then
    return;
  end if;
  insert into public.csp_violations as v
    (directive, blocked_uri, document_uri, user_agent, hit_count, first_seen, last_seen)
  values (d, b, doc, ua, 1, clock_timestamp(), clock_timestamp())
  on conflict (directive, blocked_uri, document_uri) do update
    set hit_count = v.hit_count + 1,
        last_seen = clock_timestamp(),
        user_agent = excluded.user_agent;
  perform public.purge_csp_logs();
end;
$$;

revoke all on function public.record_csp_violation_row(text, text, text, text) from public;
grant execute on function public.record_csp_violation_row(text, text, text, text)
  to anon, authenticated, service_role;
