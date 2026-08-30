-- Migration 011 — tier-aware secondary pension fields + post-retirement medical care
-- Revealed by GCB Ghana three-tier extraction (Aug 2026): mandatory Tier 2 rates and
-- post-retirement medical care do not fit employer_contribution_pct, voluntary_contribution_program,
-- hmo_scope, or additional_exit_benefit_scheme.

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
(
  'retirement',
  'tier2_employer_contribution_pct',
  'Tier 2 employer pension contribution %',
  'quantified',
  'high',
  '% of salary employer contributes to mandatory Tier 2 / occupational / secondary pension scheme (distinct from primary statutory Tier 1)',
  '{company} contributes {value}% of salary to the mandatory Tier 2 occupational pension scheme.'
),
(
  'retirement',
  'tier2_employee_contribution_pct',
  'Tier 2 employee pension contribution %',
  'quantified',
  'high',
  '% of salary employee contributes to mandatory Tier 2 / occupational / secondary pension scheme (distinct from primary statutory Tier 1)',
  'Employees contribute {value}% of salary to the mandatory Tier 2 occupational pension scheme.'
),
(
  'retirement',
  'post_retirement_medical_care',
  'Post-retirement medical care',
  'compliance_status',
  'high',
  'Yes/No — whether the employer provides ongoing medical care or health coverage for retired former employees (not active-employee HMO scope)',
  '{company} provides post-retirement medical care for former employees: {value}.'
)
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
