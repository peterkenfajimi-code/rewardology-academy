-- Migration 018 — field_registry_patch_4
-- 1. meal_allowance / utility_allowance: 'quantified' -> 'named_program'. Their descriptions allow
--    "amount or existence", so an existence-only finding would have been held as value_type_mismatch.
--    No entries exist for either field. housing_allowance / transport_allowance have the same mismatch
--    and live data — deliberately not touched here (needs a separate audit first).
-- 2. New fields: group_life_cover_scope, cellphone_allowance, lifestyle_benefit, annual_performance_bonus.
--    annual_performance_bonus sits under equity_variable (performance-linked, variable), not allowances
--    alongside the guaranteed thirteenth_month_pay.

update benefit_field_registry set value_type = 'named_program'
  where category = 'allowances' and field_key in ('meal_allowance', 'utility_allowance');

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
('risk_insurance','group_life_cover_scope','Group life cover (described, not quantified)','named_program','medium',
  'Use only when a source confirms group life insurance exists but does not state a numeric multiple of salary. If a later source gives the actual multiple, that fact belongs in group_life_coverage_multiple, and this entry should be superseded per the normal reconciliation rule, not left standing alongside it.',
  'Group life cover is described as: {value}.'),

('allowances','cellphone_allowance','Cellphone/data allowance','named_program','medium',
  'Amount or existence of a phone, cellphone, or data/airtime allowance.',
  'A cellphone/data allowance is provided: {value}.'),

('allowances','lifestyle_benefit','Lifestyle benefit','named_program','low',
  'A discretionary lifestyle or wellness stipend/benefit that does not fit a more specific field — check fitness_wellness_facility (health), tuition_reimbursement (development), and flexible_hybrid_work_policy (other_voluntary) first, and use this field only when none of those fit. Capped at low/medium: "lifestyle benefit" is frequently marketing language rather than a specific, checkable program — do not let source type alone justify higher confidence here.',
  '{company} offers the following lifestyle benefit: {value}.'),

('equity_variable','annual_performance_bonus','Annual performance bonus','named_program','medium',
  'Existence and structure of an annual, performance-linked bonus scheme — distinct from thirteenth_month_pay (allowances; guaranteed, not performance-linked) and long_term_incentive_plan (multi-year vesting). Rarely disclosed as one clean company-wide number, so named_program rather than quantified; log the disclosed structure/eligibility as the value.',
  '{company} operates an annual performance bonus scheme: {value}.')
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
