-- RLS for Session 2 tables (field registry + workforce composition)

alter table benefit_field_registry enable row level security;
alter table workforce_composition_entries enable row level security;

drop policy if exists "Public read benefit_field_registry" on benefit_field_registry;
create policy "Public read benefit_field_registry"
  on benefit_field_registry for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read published workforce_composition" on workforce_composition_entries;
create policy "Public read published workforce_composition"
  on workforce_composition_entries for select
  to anon, authenticated
  using (publish_status = 'published');
