-- Migration 031 — supplementary_retirement_fund
-- Employer-sponsored occupational / provident fund beyond the country statutory scheme.
-- Ghana Act 766 Tier 3 named membership belongs here, including when the source does not
-- say "voluntary". Do not use voluntary_contribution_program for that (optional extras only).
-- Record compulsory vs voluntary only if the source states it.

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
('retirement','supplementary_retirement_fund','Supplementary retirement fund','named_program','medium',
  'An employer-sponsored occupational or provident fund beyond the country statutory scheme (e.g. Ghana Act 766 Tier 3 named membership). Distinct from pension_scheme_type (overall structure), tier2_* rates (mandatory occupational %), and voluntary_contribution_program (optional employee-initiated extras only, e.g. AVC). Record compulsory vs voluntary only if the source states it. Do not invent rates.',
  '{company} offers a supplementary retirement fund: {value}.')
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
