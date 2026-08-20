-- Enable Row Level Security (Supabase linter: rls_disabled_in_public)
-- Service role (admin API / batch scripts) bypasses RLS automatically.
-- Anon/authenticated clients may only read published catalogue data.

alter table country_modules enable row level security;
alter table companies enable row level security;
alter table sources enable row level security;
alter table benefit_entries enable row level security;
alter table verification_log enable row level security;
alter table batch_runs enable row level security;

drop policy if exists "Public read country_modules" on country_modules;
create policy "Public read country_modules"
  on country_modules for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read companies with published entries" on companies;
create policy "Public read companies with published entries"
  on companies for select
  to anon, authenticated
  using (
    exists (
      select 1
      from benefit_entries be
      where be.company_id = companies.company_id
        and be.publish_status = 'published'
    )
  );

drop policy if exists "Public read published benefit_entries" on benefit_entries;
create policy "Public read published benefit_entries"
  on benefit_entries for select
  to anon, authenticated
  using (publish_status = 'published');

drop policy if exists "Public read sources for published entries" on sources;
create policy "Public read sources for published entries"
  on sources for select
  to anon, authenticated
  using (
    exists (
      select 1
      from benefit_entries be
      where be.source_id = sources.source_id
        and be.publish_status = 'published'
    )
  );

-- verification_log and batch_runs: no public policies (deny anon/authenticated)
