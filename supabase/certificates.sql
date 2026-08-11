-- Verifiable certificates for courses and quizzes (public verify page + LinkedIn).
-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.issued_certificates (
  id                text primary key,
  user_id           uuid not null references auth.users (id) on delete cascade,
  cert_type         text not null check (cert_type in ('course', 'quiz_centre', 'quiz')),
  source_id         text not null,
  recipient_name    text not null,
  credential_name   text not null,
  credential_detail text,
  score_pct         integer check (score_pct is null or (score_pct >= 0 and score_pct <= 100)),
  xp_earned         integer check (xp_earned is null or xp_earned >= 0),
  issued_at         timestamptz not null default now(),
  unique (user_id, cert_type, source_id)
);

create index if not exists issued_certificates_user_idx
  on public.issued_certificates (user_id);

alter table public.issued_certificates enable row level security;

drop policy if exists "ic_select_own" on public.issued_certificates;
create policy "ic_select_own"
  on public.issued_certificates for select
  using (auth.uid() = user_id);

drop policy if exists "ic_insert_own" on public.issued_certificates;
create policy "ic_insert_own"
  on public.issued_certificates for insert
  with check (auth.uid() = user_id);

drop policy if exists "ic_update_own" on public.issued_certificates;
create policy "ic_update_own"
  on public.issued_certificates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Issue or refresh a certificate; returns stable public ID.
create or replace function public.issue_certificate(
  p_cert_type         text,
  p_source_id         text,
  p_recipient_name    text,
  p_credential_name   text,
  p_credential_detail text default null,
  p_score_pct         integer default null,
  p_xp_earned         integer default null,
  p_issued_at         timestamptz default null
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_cert_type not in ('course', 'quiz_centre', 'quiz') then
    raise exception 'Invalid certificate type';
  end if;
  if coalesce(trim(p_recipient_name), '') = '' then
    raise exception 'Recipient name required';
  end if;
  if coalesce(trim(p_credential_name), '') = '' then
    raise exception 'Credential name required';
  end if;

  select id into v_id
  from public.issued_certificates
  where user_id = auth.uid()
    and cert_type = p_cert_type
    and source_id = p_source_id;

  if v_id is null then
    loop
      v_id := 'RA-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
      exit when not exists (select 1 from public.issued_certificates where id = v_id);
    end loop;

    insert into public.issued_certificates (
      id, user_id, cert_type, source_id, recipient_name,
      credential_name, credential_detail, score_pct, xp_earned, issued_at
    )
    values (
      v_id, auth.uid(), p_cert_type, p_source_id, trim(p_recipient_name),
      trim(p_credential_name), nullif(trim(p_credential_detail), ''),
      p_score_pct, p_xp_earned, coalesce(p_issued_at, now())
    );
  else
    update public.issued_certificates set
      recipient_name    = trim(p_recipient_name),
      credential_name   = trim(p_credential_name),
      credential_detail   = nullif(trim(p_credential_detail), ''),
      score_pct         = coalesce(p_score_pct, score_pct),
      xp_earned         = coalesce(p_xp_earned, xp_earned),
      issued_at         = coalesce(p_issued_at, issued_at)
    where id = v_id;
  end if;

  return v_id;
end;
$$;

-- Public verification (no auth) — returns only shareable fields.
create or replace function public.get_public_certificate(p_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if coalesce(trim(p_id), '') = '' then
    return null;
  end if;

  select json_build_object(
    'id', c.id,
    'certType', c.cert_type,
    'sourceId', c.source_id,
    'recipientName', c.recipient_name,
    'credentialName', c.credential_name,
    'credentialDetail', c.credential_detail,
    'scorePct', c.score_pct,
    'xpEarned', c.xp_earned,
    'issuedAt', c.issued_at,
    'verified', true
  )
  into result
  from public.issued_certificates c
  where c.id = upper(trim(p_id));

  return result;
end;
$$;

grant execute on function public.issue_certificate(text, text, text, text, text, integer, integer, timestamptz) to authenticated;
grant execute on function public.get_public_certificate(text) to anon, authenticated;
