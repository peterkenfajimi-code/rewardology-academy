-- Migration 021 — unmapped_findings: extraction results that fit no registry field
-- Previously dropped at save time (unmapped_skipped / registry_rejected), so registry gaps were only
-- found by re-reading sources by hand. Kept for reviewer visibility; never public.

create table if not exists unmapped_findings (
  finding_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(company_id) on delete cascade,
  source_id uuid references sources(source_id) on delete set null,
  raw_excerpt text,
  suggested_category text,
  suggested_field text,
  ai_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

comment on column unmapped_findings.raw_excerpt is 'The value text the model extracted for the unmapped fact.';
comment on column unmapped_findings.suggested_field is 'Null when the model returned field "unmapped"; otherwise the non-registry field key it invented.';

create index if not exists idx_unmapped_findings_unreviewed
  on unmapped_findings(created_at)
  where reviewed_at is null;

alter table unmapped_findings enable row level security;

revoke all on table public.unmapped_findings from anon, authenticated;
grant select, insert, update, delete on table public.unmapped_findings to service_role;
