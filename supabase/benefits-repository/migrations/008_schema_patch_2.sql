-- Schema Patch 2 (Session 2) — run after field_registry + display_templates.
-- secondary_disclosure_venues omitted: migration 003 already adds secondary_disclosure_exchanges.

create unique index if not exists uq_one_published_fact
  on benefit_entries (company_id, category, field)
  where publish_status = 'published';

alter table benefit_entries add column if not exists effective_date date;
alter table benefit_entries add column if not exists confidence_was_clamped boolean not null default false;

create index if not exists idx_entries_effective_date on benefit_entries(effective_date);
