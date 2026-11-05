-- Migration 029 — logo provenance on the company record.
-- Source URL, licence tag and retrieval date so a later objection can be answered
-- from the row itself. Null when there is no stored logo (initials placeholder).

alter table public.companies add column if not exists logo_source_url text;
alter table public.companies add column if not exists logo_licence text;
alter table public.companies add column if not exists logo_retrieved_at date;

comment on column public.companies.logo_source_url is
  'URL the stored logo was retrieved from (Commons file page or company-site asset). Null when there is no stored logo.';
comment on column public.companies.logo_licence is
  'Short licence tag, e.g. Commons PD-textlogo / company site / unclear. Distinct from trademark — a PD-textlogo can still be a registered mark.';
comment on column public.companies.logo_retrieved_at is
  'Calendar date the file was fetched into company-logos. Not the Commons upload date.';
