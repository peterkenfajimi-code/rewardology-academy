-- Migration 026 — private re-verification tracker + public last-reviewed date.
-- Created after 30 Oct 2026: explicit grants required. No anon/authenticated
-- access to the schedule table (admin/service_role only).

create table if not exists public.company_review_schedule (
  company_id uuid primary key references public.companies(company_id) on delete cascade,
  fiscal_year_end text not null,
  report_usually_published_month text not null,
  last_fy_extracted text,
  next_due date,
  notes text,
  updated_at timestamptz not null default now()
);

comment on table public.company_review_schedule is
  'When the next annual report is expected. Private — not part of the public catalogue.';

alter table public.company_review_schedule enable row level security;

revoke all on table public.company_review_schedule from anon, authenticated;
grant select, insert, update, delete on table public.company_review_schedule to service_role;

create or replace function public.repository_last_reviewed()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select max(timestamp) from public.verification_log),
    (select max(last_reviewed_at) from public.companies)
  );
$$;

revoke all on function public.repository_last_reviewed() from public;
grant execute on function public.repository_last_reviewed() to anon, authenticated, service_role;

insert into public.company_review_schedule (
  company_id, fiscal_year_end, report_usually_published_month, last_fy_extracted, next_due, notes
)
select c.company_id, v.fiscal_year_end, v.report_usually_published_month, v.last_fy_extracted, v.next_due::date, v.notes
from (
  values
    ('NGX', 'GTCO', '31 December', 'March', 'FY2024', '2027-03-01',
     'Full AR typically with Q1 AGM pack. 2025 HY investor deck already stored.'),
    ('NSE', 'SCOM', '31 March', 'June', 'FY2026', '2027-06-01',
     'Integrated report after March year-end. Guide 2 careers page is CloudFront 403.'),
    ('GSE', 'GCB', '31 December', 'March', 'FY2025', '2027-03-01',
     '2025 AR Guide 1 closed (6r). Health/Risk/Leave still Guide-1-only.'),
    ('GSE', 'MTNGH', '31 December', 'March', 'FY2024', '2027-03-01',
     'Scancom PLC only — not MTN Group. Next full AR is FY2025.'),
    ('JSE', 'MTN', '31 December', 'March', 'FY2025', '2027-03-01',
     'Multi-country Group row. Two published facts only after internal-brochure reject.'),
    ('NGX', 'ZENITHBANK', '31 December', 'March', 'FY2025', '2027-03-01',
     'Listed entity is the Bank. Group-scope rule 6u. HTML flipbook is not a source.'),
    ('FMDQ', 'MTNN', '31 December', 'March', 'FY2025', '2027-03-01',
     'Listed entity is MTN Nigeria Communications Plc. In this AR "the Group" is MTN Nigeria + subsidiaries, not JSE MTN Group Limited. Women 43.4% / 36.6% held (1,910 base undefined).')
) as v(listing_exchange, exchange_ticker, fiscal_year_end, report_usually_published_month, last_fy_extracted, next_due, notes)
join public.companies c
  on c.listing_exchange = v.listing_exchange
 and c.exchange_ticker = v.exchange_ticker
on conflict (company_id) do update
  set fiscal_year_end = excluded.fiscal_year_end,
      report_usually_published_month = excluded.report_usually_published_month,
      last_fy_extracted = excluded.last_fy_extracted,
      next_due = excluded.next_due,
      notes = excluded.notes,
      updated_at = now();
