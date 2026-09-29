-- Explicit Data API grants for existing tables (Supabase change 2026-10-30).
-- Live tables already have auto-grants; this is additive and safe to re-run.
-- New tables created after Oct 30 still need grants in the same migration.
-- Do not grant anon/authenticated write — public catalogue is RLS SELECT-only.

grant select on table public.country_modules to anon, authenticated;
grant select, insert, update, delete on table public.country_modules to service_role;

grant select on table public.companies to anon, authenticated;
grant select, insert, update, delete on table public.companies to service_role;

grant select on table public.sources to anon, authenticated;
grant select, insert, update, delete on table public.sources to service_role;

grant select on table public.benefit_entries to anon, authenticated;
grant select, insert, update, delete on table public.benefit_entries to service_role;

grant select on table public.benefit_field_registry to anon, authenticated;
grant select, insert, update, delete on table public.benefit_field_registry to service_role;

grant select on table public.workforce_composition_entries to anon, authenticated;
grant select, insert, update, delete on table public.workforce_composition_entries to service_role;

grant select, insert, update, delete on table public.verification_log to service_role;
grant select, insert, update, delete on table public.batch_runs to service_role;
