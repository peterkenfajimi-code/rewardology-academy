-- Migration 017 — company logos, stored once at review time.
-- The public site reads logos from our own Storage bucket, never from a third-party logo API at
-- pageview time (Clearbit's free logo API shut down 8 Dec 2025 and broke every site hot-linking it).

alter table companies add column if not exists website_domain text;
alter table companies add column if not exists logo_storage_path text;

comment on column companies.website_domain is
  'Bare domain (e.g. gtcoplc.com) used to suggest a logo in the admin tool.';
comment on column companies.logo_storage_path is
  'Object path in the company-logos Storage bucket; null = initials placeholder on the public site.';

-- Public read via the bucket's public URL; writes only via the service role (admin API routes).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
