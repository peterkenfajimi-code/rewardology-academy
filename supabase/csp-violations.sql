-- CSP Report-Only violation summaries for the Academy site.
-- Created after 30 Oct 2026: explicit grants required. Table is private;
-- browsers record via a security-definer RPC (anon execute, no table access).

create table if not exists public.csp_violation_summaries (
  directive text not null,
  blocked_host text not null default '',
  hit_count integer not null default 0,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (directive, blocked_host)
);

comment on table public.csp_violation_summaries is
  'Aggregated CSP Report-Only hits (directive + blocked host). Not a public catalogue.';

alter table public.csp_violation_summaries enable row level security;

revoke all on table public.csp_violation_summaries from anon, authenticated;
grant select, insert, update, delete on table public.csp_violation_summaries to service_role;

create or replace function public.record_csp_violation(p_directive text, p_blocked_host text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d text := left(coalesce(p_directive, ''), 120);
  h text := left(coalesce(p_blocked_host, ''), 200);
begin
  if length(trim(d)) = 0 then
    return;
  end if;
  insert into public.csp_violation_summaries as s (directive, blocked_host, hit_count, first_seen, last_seen)
  values (d, h, 1, clock_timestamp(), clock_timestamp())
  on conflict (directive, blocked_host) do update
    set hit_count = s.hit_count + 1,
        last_seen = clock_timestamp();
end;
$$;

revoke all on function public.record_csp_violation(text, text) from public;
grant execute on function public.record_csp_violation(text, text) to anon, authenticated, service_role;
