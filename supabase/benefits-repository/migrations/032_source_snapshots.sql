-- Migration 032 — limited source snapshots (6t).
-- Web-page sources (careers, LinkedIn): store a snapshot in a private bucket + SHA-256.
-- Annual reports: stored URL + SHA-256 is enough (no PDF in the bucket).
-- Private — RLS on, anon/authenticated revoked.

alter table public.sources add column if not exists content_sha256 text;
alter table public.sources add column if not exists snapshot_captured_at timestamptz;

comment on column public.sources.content_sha256 is
  'SHA-256 hex of the captured source bytes (HTML snapshot or local annual-report PDF). Null until hashed.';
comment on column public.sources.snapshot_captured_at is
  'When content_sha256 was computed. Web-page snapshots also live in the source-snapshots bucket, path in raw_snapshot_path.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'source-snapshots',
  'source-snapshots',
  false,
  1048576,
  array['text/html', 'text/plain', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Private bucket: no storage.objects policies for anon/authenticated.
-- service_role bypasses RLS and is the only writer (admin scripts).
