-- URL-safe company slug for public profile routes (/benefits-repository/[slug])
alter table companies add column if not exists slug text;

create unique index if not exists idx_companies_slug on companies(slug) where slug is not null;
