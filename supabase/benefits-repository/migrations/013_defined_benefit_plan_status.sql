-- Migration 013 — company-sponsored DB plan status (active / closed_legacy / none).
-- GCB's closed 1985 scheme cannot live on defined_benefit_plan_exists: that field is
-- Yes/No and normalizeComplianceStatusValue collapses any narrative longer than 20
-- characters to "Yes", which reads as an active plan for current employees.

update benefit_field_registry
set
  description = 'Yes/No — whether a company-sponsored supplementary DB scheme exists, including closed/legacy schemes. Not the country statutory DB (e.g. SSNIT Tier 1). Put active vs closed_legacy vs none on defined_benefit_plan_status; never store the closed/discontinued story on this field.',
  display_template = '{company} has a company-sponsored defined benefit plan (including closed/legacy): {value}.'
where category = 'retirement' and field_key = 'defined_benefit_plan_exists';

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
(
  'retirement',
  'defined_benefit_plan_status',
  'Defined benefit plan status',
  'named_program',
  'high',
  'Status of the company-sponsored supplementary DB scheme: active, closed_legacy, or none. Use closed_legacy when the scheme is frozen, discontinued, or closed to current employees. Not SSNIT/statutory DB. Not a Yes/No field.',
  '{company} company-sponsored defined benefit plan status: {value}.'
)
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
