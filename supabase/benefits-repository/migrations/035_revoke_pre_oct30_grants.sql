-- Migration 035 — revoke leftover pre-30-Oct ALL grants; re-grant the minimum.
-- Rollback: supabase/benefits-repository/grants-backup-2026-11-19/rollback-035.sql
--
-- Anon/authenticated: SELECT only on tables the public pages read
--   (benefit_entries, companies, sources, workforce_composition_entries,
--    benefit_field_registry), protected by existing RLS.
-- Service_role: full DML on every public-schema table.
-- Internal tables (verification_log, batch_runs, unmapped_findings,
-- company_review_schedule, country_modules) are not readable by anon.
-- country_modules is admin/batch only (not queried by public pages).

revoke all on table public.verification_log from anon, authenticated;
grant select, insert, update, delete on table public.verification_log to service_role;

revoke all on table public.batch_runs from anon, authenticated;
grant select, insert, update, delete on table public.batch_runs to service_role;

revoke all on table public.unmapped_findings from anon, authenticated;
grant select, insert, update, delete on table public.unmapped_findings to service_role;

revoke all on table public.company_review_schedule from anon, authenticated;
grant select, insert, update, delete on table public.company_review_schedule to service_role;

revoke all on table public.country_modules from anon, authenticated;
grant select, insert, update, delete on table public.country_modules to service_role;

revoke all on table public.companies from anon, authenticated;
grant select on table public.companies to anon, authenticated;
grant select, insert, update, delete on table public.companies to service_role;

revoke all on table public.sources from anon, authenticated;
grant select on table public.sources to anon, authenticated;
grant select, insert, update, delete on table public.sources to service_role;

revoke all on table public.benefit_entries from anon, authenticated;
grant select on table public.benefit_entries to anon, authenticated;
grant select, insert, update, delete on table public.benefit_entries to service_role;

revoke all on table public.benefit_field_registry from anon, authenticated;
grant select on table public.benefit_field_registry to anon, authenticated;
grant select, insert, update, delete on table public.benefit_field_registry to service_role;

revoke all on table public.workforce_composition_entries from anon, authenticated;
grant select on table public.workforce_composition_entries to anon, authenticated;
grant select, insert, update, delete on table public.workforce_composition_entries to service_role;

revoke all on function public.repository_last_reviewed() from public;
grant execute on function public.repository_last_reviewed() to anon, authenticated, service_role;
