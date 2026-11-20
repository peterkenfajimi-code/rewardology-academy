-- Rollback for migration 035. Restores GRANTs captured before the revoke.
-- Exported 2026-11-19T08:42:46.600Z

grant delete, insert, references, select, trigger, truncate, update on table public.country_modules to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.country_modules to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.country_modules to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.companies to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.companies to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.companies to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.sources to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.sources to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.sources to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.benefit_entries to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.benefit_entries to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.benefit_entries to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.benefit_field_registry to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.benefit_field_registry to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.benefit_field_registry to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.workforce_composition_entries to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.workforce_composition_entries to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.workforce_composition_entries to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.verification_log to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.verification_log to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.verification_log to service_role;

grant delete, insert, references, select, trigger, truncate, update on table public.batch_runs to anon;
grant delete, insert, references, select, trigger, truncate, update on table public.batch_runs to authenticated;
grant delete, insert, references, select, trigger, truncate, update on table public.batch_runs to service_role;
