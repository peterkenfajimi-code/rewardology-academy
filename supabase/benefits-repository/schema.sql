-- ============================================================
-- Africa Benefits Repository — Supabase Schema
-- Run this in the NEW, SEPARATE Supabase project (not the
-- Academy's live database). See CURSOR_BUILD_INSTRUCTIONS.md
-- ============================================================

create table if not exists country_modules (
  country_code text primary key,
  country_name text not null,
  currency_code text not null,
  pension_regulator text,
  pension_regulator_url text,
  pension_scheme_body text,
  pension_statutory_employer_pct numeric,
  pension_statutory_employee_pct numeric,
  pension_scheme_law_name text,
  pension_scheme_type text check (pension_scheme_type in
    ('defined_contribution','defined_benefit','none_mandatory','mixed')),
  workplace_injury_body text,
  listed_company_exchange text,
  listed_company_regulator text,
  labour_law_name text,
  primary_job_boards text[],
  notes text,
  last_verified_date date not null
);

insert into country_modules (
  country_code, country_name, currency_code,
  pension_regulator, pension_scheme_body,
  pension_statutory_employer_pct, pension_statutory_employee_pct,
  pension_scheme_law_name, pension_scheme_type,
  workplace_injury_body, listed_company_exchange, listed_company_regulator,
  labour_law_name, primary_job_boards, notes, last_verified_date
) values
('NG','Nigeria','NGN','PenCom', null,
  10, 8, 'Pension Reform Act 2014', 'defined_contribution',
  'NSITF','NGX','SEC Nigeria','Labour Act',
  array['Jobberman','MyJobMag','LinkedIn'],
  'Reference instantiation for the schema. Group life statutory minimum: 3x annual salary.',
  current_date),
('GH','Ghana','GHS','National Pensions Regulatory Authority (NPRA)','SSNIT (Tier 1)',
  5, null, 'National Pensions Act 2008 (Act 766), amended 2014 (Act 883)', 'mixed',
  'Workmen''s Compensation (Labour Dept)','Ghana Stock Exchange (GSE)','SEC Ghana','Labour Act 2003 (Act 651)',
  array['LinkedIn'],
  'Three-tier system: Tier 1 SSNIT (DB, employer-funded), Tier 2 mandatory DC (5% employer-managed), Tier 3 voluntary.',
  current_date),
('KE','Kenya','KES','Retirement Benefits Authority (RBA)','NSSF (Tier 1)',
  6, 6, 'NSSF Act 2013', 'mixed',
  'Work Injury Benefits Act (WIBA) body','Nairobi Securities Exchange (NSE)','Capital Markets Authority (CMA)','Employment Act 2007',
  array['LinkedIn'],
  'Two-tier NSSF, contribution capped, contractible-out to private schemes via RBA approval.',
  current_date),
('ZA','South Africa','ZAR','Financial Sector Conduct Authority (FSCA)','No mandatory state scheme',
  null, null, 'Pension Funds Act', 'none_mandatory',
  'Compensation for Occupational Injuries and Diseases Act (COIDA) body','Johannesburg Stock Exchange (JSE)','FSCA','Basic Conditions of Employment Act',
  array['LinkedIn'],
  'STRUCTURAL OUTLIER: no statutory mandatory pension contribution.',
  current_date),
('EG','Egypt','EGP','National Organization for Social Insurance (NOSI)', null,
  18.75, 11, 'Social Insurance Law No. 148 of 2019', 'defined_benefit',
  'Covered under NOSI unified scheme','Egyptian Exchange (EGX)','Financial Regulatory Authority (FRA)','Labour Law No. 12/2003',
  array['LinkedIn'],
  'Single consolidated scheme covering pension, sickness, disability, death, injury, and unemployment together.',
  current_date),
('RW','Rwanda','RWF','National Bank of Rwanda (private schemes)','Rwanda Social Security Board (RSSB)',
  8, 5, 'Law regulating labour in Rwanda; RSSB-administered', 'defined_benefit',
  'RSSB occupational hazards branch','Rwanda Stock Exchange (RSE)','Capital Market Authority Rwanda', null,
  array['LinkedIn'],
  'MID-TRANSITION: rate doubled in 2025, scheduled to rise to 20% by 2030.',
  current_date)
on conflict (country_code) do nothing;

create table if not exists companies (
  company_id uuid primary key default gen_random_uuid(),
  name text not null,
  country text references country_modules(country_code) not null,
  industry text,
  sub_industry text,
  company_size_band text check (company_size_band in ('1-50','51-500','501-5000','5000+')),
  listed_status text check (listed_status in ('listed','private','multinational_subsidiary')),
  exchange_ticker text,
  created_at timestamptz default now(),
  last_reviewed_at timestamptz
);

create table if not exists sources (
  source_id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(company_id) not null,
  source_type text check (source_type in
    ('annual_report','sustainability_report','careers_page','press_release','regulatory_filing',
     'linkedin','award_recognition','direct_confirmation')) not null,
  source_url text,
  source_title text,
  publication_date date,
  date_accessed date not null default current_date,
  country text references country_modules(country_code),
  raw_snapshot_path text,
  created_at timestamptz default now()
);

create table if not exists benefit_entries (
  entry_id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(company_id) not null,
  source_id uuid references sources(source_id) not null,
  category text check (category in
    ('retirement','health','risk_insurance','leave','allowances',
     'development','equity_variable','other_voluntary')) not null,
  field text not null,
  value text,
  value_type text check (value_type in
    ('quantified','named_program','compliance_status','narrative')),
  fiscal_year_or_effective_date text,
  confidence_score text check (confidence_score in ('high','medium','low')) not null,
  source_trust_weight int,
  publish_status text check (publish_status in
    ('published','pending_verification','superseded','rejected')) not null default 'pending_verification',
  superseded_by_entry_id uuid references benefit_entries(entry_id),
  verified_by text,
  date_collected date not null default current_date,
  notes text
);

create table if not exists verification_log (
  log_id uuid primary key default gen_random_uuid(),
  entry_id uuid references benefit_entries(entry_id) not null,
  action text check (action in
    ('extracted','cross_checked','corrected','upgraded_confidence',
     'downgraded_confidence','flagged_legal_review','superseded','reconciled')) not null,
  actor text,
  timestamp timestamptz default now(),
  detail text
);

create index if not exists idx_companies_country on companies(country);
create index if not exists idx_companies_industry on companies(industry);
create index if not exists idx_companies_size on companies(company_size_band);
create index if not exists idx_entries_company on benefit_entries(company_id);
create index if not exists idx_entries_status on benefit_entries(publish_status);
create index if not exists idx_entries_category on benefit_entries(category);
create index if not exists idx_sources_company on sources(company_id);
create index if not exists idx_sources_type on sources(source_type);

create table if not exists batch_runs (
  run_id uuid primary key default gen_random_uuid(),
  status text check (status in ('running','completed','failed','cancelled')) not null default 'running',
  config jsonb not null default '{}',
  progress jsonb not null default '{}',
  log text not null default '',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_batch_runs_started on batch_runs(started_at desc);

create unique index if not exists idx_sources_company_url
  on sources(company_id, source_url)
  where source_url is not null;
