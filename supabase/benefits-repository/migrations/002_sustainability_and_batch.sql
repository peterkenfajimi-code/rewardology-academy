-- Add sustainability_report source type + batch run tracking + source URL dedup

alter table sources drop constraint if exists sources_source_type_check;
alter table sources add constraint sources_source_type_check check (source_type in
  ('annual_report','sustainability_report','careers_page','press_release','regulatory_filing',
   'linkedin','award_recognition','direct_confirmation'));

create table if not exists batch_runs (
  run_id uuid primary key default gen_random_uuid(),
  status text check (status in ('running','completed','failed','cancelled')) not null default 'running',
  config jsonb not null default '{}',
  progress jsonb not null default '{}',
  log text not null default '',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_batch_runs_started on batch_runs(started_at desc);

create unique index if not exists idx_sources_company_url
  on sources(company_id, source_url)
  where source_url is not null;
