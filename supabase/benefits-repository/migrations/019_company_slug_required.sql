-- Migration 019 — companies.slug is always populated
-- No company insert path (admin API, batch runner, per-company scripts) sets slug, so rows only got
-- one from the one-off backfill script; GCB was created after it and stayed null. A trigger now fills
-- it on insert, mirroring lib/repository/company-slug.ts companySlug(): strip accents, lowercase,
-- runs of non-alphanumerics -> '-', trim '-', first 80 chars, then '-' + lowercase country code.

create extension if not exists unaccent with schema extensions;

create or replace function company_slug(p_name text, p_country text)
returns text
language sql
stable
as $$
  select left(btrim(regexp_replace(lower(extensions.unaccent(p_name)), '[^a-z0-9]+', '-', 'g'), '-'), 80)
    || '-' || lower(p_country);
$$;

create or replace function companies_default_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := company_slug(new.name, new.country);
  end if;
  return new;
end;
$$;

drop trigger if exists companies_default_slug on companies;
create trigger companies_default_slug
  before insert or update of slug, name, country on companies
  for each row execute function companies_default_slug();

-- Existing slugs are left alone even if the name has since changed: they are public URLs.
update companies
  set slug = company_slug(name, country)
  where slug is null or btrim(slug) = '';

alter table companies alter column slug set not null;
