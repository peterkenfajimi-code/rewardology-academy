-- ============================================================
-- Africa Benefits Repository — Canonical Field Registry
-- Extends schema.sql. Run this AFTER schema.sql.
--
-- Purpose: benefit_entries.field was free text, which let the AI
-- extraction invent a new field name every time a fact was phrased
-- slightly differently (GTCO's group life multiple was logged under
-- SIX different field names, breaking reconciliation entirely).
-- This registry closes that gap with a real foreign key, not just
-- a convention Cursor is expected to remember.
-- ============================================================

-- ---------- benefit_field_registry ----------

create table benefit_field_registry (
  category text not null,
  field_key text not null,
  field_label text not null,               -- human-readable, for UI display
  value_type text check (value_type in
    ('quantified','named_program','compliance_status','narrative')) not null,
  max_confidence text check (max_confidence in ('high','medium','low')) not null default 'high',
  -- ^ Narrative/marketing-style fields (CSR event descriptions, culture
  -- statements) are capped below 'high' regardless of source — an audited
  -- annual report can still contain unaudited prose. Confidence should
  -- reflect the CLAIM's verifiability, not just which document it sat in.
  description text,
  primary key (category, field_key)
);

-- ---------- retirement ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('retirement','employer_contribution_pct','Employer pension contribution %','quantified','high','% of salary employer contributes to mandatory/primary pension scheme'),
('retirement','employee_contribution_pct','Employee pension contribution %','quantified','high','% of salary employee contributes to mandatory/primary pension scheme'),
('retirement','pension_scheme_type','Pension scheme type','named_program','high','e.g. defined contribution, defined benefit, hybrid'),
('retirement','pension_administrator_type','Pension administrator','named_program','high','e.g. Pension Fund Administrator (PFA) for Nigeria, SSNIT for Ghana'),
('retirement','defined_benefit_plan_exists','Defined benefit plan exists','compliance_status','high','Yes/No — whether a supplementary DB scheme exists alongside the primary DC scheme'),
('retirement','gratuity_scheme_exists','Gratuity/terminal benefit scheme exists','compliance_status','high','Yes/No'),
('retirement','gratuity_scheme_type','Gratuity scheme structure','named_program','medium','How the gratuity/terminal benefit is calculated, where disclosed'),
('retirement','voluntary_contribution_program','Additional voluntary contribution program','named_program','high','e.g. AVC — Additional Voluntary Contribution'),
('retirement','additional_exit_benefit_scheme','Additional exit benefit scheme','named_program','medium','Named supplementary exit/severance benefit beyond statutory gratuity'),
('retirement','total_contribution_pct','Total combined contribution %','quantified','high','Employer + employee combined, only if source states this as one figure rather than the two parts separately');

-- ---------- health ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('health','hmo_provider','Named HMO/health insurance provider','named_program','high','Specific named provider'),
('health','hmo_scope','Health coverage scope','quantified','high','e.g. staff only / staff + N dependents'),
('health','medical_facilities_provision','On-site or company-funded medical facilities','named_program','medium','e.g. company clinic, medical facilities at company expense'),
('health','annual_medical_checkup','Mandatory/provided annual medical checkup','compliance_status','high','Yes/No, scope if stated'),
('health','employee_assistance_program','Employee Assistance Program (EAP)','named_program','medium','Psychological/emotional support program — log existence, not full description'),
('health','fitness_wellness_facility','Gym/fitness/wellness facility access','named_program','medium','On-site gym, fitness centre membership, wellness facility access'),
('health','wellness_program_narrative','Wellness program (narrative)','narrative','low','CSR-style wellness event/campaign descriptions (e.g. an awareness day) — NOT an ongoing quantified benefit. Cap at low/medium; do not let source type alone justify high confidence here.');

-- ---------- risk_insurance ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('risk_insurance','group_life_coverage_multiple','Group life insurance multiple','quantified','high','Numeric multiple of annual salary, e.g. 3 (meaning 3x salary). THE canonical field for this fact — do not create variants like "_minimum", "_amount", "_statutory_minimum".'),
('risk_insurance','group_life_meets_statutory_minimum','Group life meets/exceeds statutory minimum','compliance_status','high','Yes/No relative to country_modules statutory minimum — computed by comparing group_life_coverage_multiple against the country config, not extracted as free text'),
('risk_insurance','group_personal_accident_insurance','Group personal accident insurance','compliance_status','high','Yes/No, provider if named'),
('risk_insurance','workplace_injury_compliance','Workplace injury body compliance','compliance_status','high','Confirmation of contribution to NSITF/WIBA/COIDA or country equivalent — compliance status only, per Guide 4 scope limits'),
('risk_insurance','occupational_hazard_insurance','Occupational/other hazards insurance','named_program','medium','Any named hazard insurance beyond the statutory group life/workplace injury minimums');

-- ---------- leave ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('leave','annual_leave_days','Annual leave days','quantified','high','Numeric days'),
('leave','maternity_leave_duration','Maternity leave duration','quantified','high','Weeks/months'),
('leave','paternity_leave_duration','Paternity leave duration','quantified','high','Weeks/days'),
('leave','sick_leave_days','Sick leave days','quantified','medium','Numeric days, where disclosed'),
('leave','study_leave_policy','Study leave policy','named_program','medium','Existence and rough terms, where disclosed'),
('leave','leave_exceeds_statutory_minimum','Leave exceeds statutory minimum','compliance_status','high','Yes/No relative to country_modules statutory baseline');

-- ---------- allowances ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('allowances','housing_allowance','Housing allowance','quantified','medium','Amount or existence'),
('allowances','transport_allowance','Transport allowance','quantified','medium','Amount or existence'),
('allowances','pensionable_allowances','Which allowances are pensionable','named_program','medium','e.g. basic, housing, transport included in pension base'),
('allowances','salary_review_frequency','Salary review frequency/status','named_program','medium','e.g. annual review conducted for all staff'),
('allowances','compensation_philosophy_statement','Compensation philosophy (narrative)','narrative','medium','General statement of pay philosophy — narrative only, cannot exceed medium confidence regardless of source');

-- ---------- development ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('development','training_spend_amount','Training/L&D spend (absolute)','quantified','high','Currency amount, where disclosed'),
('development','training_spend_pct_payroll','Training/L&D spend (% of payroll)','quantified','high','Percentage figure'),
('development','employees_trained_count','Number of employees trained','quantified','high','Headcount figure for a stated period'),
('development','tuition_reimbursement','Tuition/certification reimbursement','named_program','medium','Existence and scope, where disclosed'),
('development','executive_education_partnership','Executive education partnerships','named_program','medium','Named partner institutions, where disclosed'),
('development','health_safety_training','Health & safety training program','named_program','medium','First aid, fire safety, occupational safety training — log as a program, not a benefit narrative');

-- ---------- equity_variable ----------
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('equity_variable','esop_exists','Employee Share Ownership Plan exists','compliance_status','high','Yes/No'),
('equity_variable','share_based_payment_scheme','Share-based payment scheme structure','named_program','high','e.g. cash-settled, SARs, stock options — as disclosed in audited notes'),
('equity_variable','long_term_incentive_plan','Long-term incentive plan (LTIP)','named_program','medium','Existence and structure, where disclosed');

-- ---------- other_voluntary ----------
-- NOTE: workforce composition / ESG demographic statistics (gender %,
-- board representation targets, disability employment counts) do NOT
-- belong in this category or in benefit_entries at all — see the
-- workforce_composition_entries table below. other_voluntary is for
-- benefits an individual employee actually receives.
insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description) values
('other_voluntary','flexible_hybrid_work_policy','Flexible/hybrid work policy','named_program','medium','Existence and terms, where disclosed'),
('other_voluntary','creche_childcare_facility','Creche/childcare facility','named_program','medium','On-site or company-provided childcare'),
('other_voluntary','non_discrimination_policy','Non-discrimination employment policy','compliance_status','medium','Existence of stated policy — log as compliance_status (exists/doesn''t), not the full policy text'),
('other_voluntary','termination_benefits_policy','Termination benefits policy','named_program','medium','How termination benefits are recognized/structured, per disclosed accounting policy');


-- ============================================================
-- Enforce the closed vocabulary at the database level
-- ============================================================

alter table benefit_entries
  add constraint fk_benefit_field
  foreign key (category, field)
  references benefit_field_registry(category, field_key);

-- From this point forward, an insert with an unrecognized field name
-- will FAIL rather than silently creating a new de facto field. If the
-- AI extraction tool needs a field that doesn't exist yet, that's a
-- deliberate registry addition (one INSERT into benefit_field_registry),
-- not something that should ever happen implicitly through an entry insert.


-- ============================================================
-- Confidence ceiling enforcement (application-level, documented here)
-- ============================================================
-- schema.sql's benefit_entries.confidence_score has no database-level
-- check against max_confidence, since a hard DB constraint here would
-- need a trigger (workable, but adds complexity for a solo-founder build
-- at this stage). Recommended for Cursor to implement in application
-- logic instead: on insert/update, look up
-- benefit_field_registry.max_confidence for the entry's (category, field)
-- and clamp confidence_score to that ceiling if the AI/human-submitted
-- value exceeds it. This is what would have caught the GTCO
-- "Zero Male Suicide" wellness entry and the "Building a Sustainable
-- Enterprise" mis-extraction being logged as high confidence.


-- ============================================================
-- workforce_composition_entries — separate table for ESG/demographic
-- statistics that are NOT individual employee benefits
-- ============================================================
-- These describe the workforce as a population (gender %, board
-- representation targets, disability employment counts), not something
-- an individual employee receives. Keeping them out of benefit_entries
-- keeps "% of companies offering X benefit" queries accurate — mixing
-- demographic stats in would silently skew that kind of benchmarking.

create table workforce_composition_entries (
  entry_id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(company_id) not null,
  source_id uuid references sources(source_id) not null,
  metric_key text not null,                     -- e.g. 'female_workforce_pct', 'female_board_pct',
                                                  -- 'female_senior_management_pct', 'disability_employment_count'
  value text not null,
  reporting_period text,                          -- e.g. '2023', 'FY2024'
  confidence_score text check (confidence_score in ('high','medium','low')) not null,
  publish_status text check (publish_status in
    ('published','pending_verification','superseded','rejected')) not null default 'pending_verification',
  date_collected date not null default current_date,
  notes text
);

create index idx_workforce_company on workforce_composition_entries(company_id);
