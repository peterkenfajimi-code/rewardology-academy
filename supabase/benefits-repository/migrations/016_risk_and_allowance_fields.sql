-- Migration 016 — field_registry_patch_3: disability / funeral cover + allowance fields
-- risk_insurance only covered group life's multiple; disability and funeral/burial cover had no
-- canonical field. allowances only itemized housing and transport; leave allowance (cash, distinct
-- from leave day counts), meal, utility and thirteenth-month pay had no home.
-- Each field below is THE canonical name for its fact — do not create variants.

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
('risk_insurance','disability_cover_multiple','Permanent disability cover (multiple of salary)','quantified','high',
  'Numeric multiple of annual salary for permanent (total/partial) disability benefit, where a source states it as a number — e.g. 3 (meaning 3x salary). Often disclosed as a rider on the same group life policy rather than a separate one; log it here regardless of which policy document it sits in. THE canonical field for this fact — do not create variants.',
  'Permanent disability cover pays out at {value}x annual salary.'),

('risk_insurance','disability_cover_scope','Permanent disability cover (described, not quantified)','named_program','medium',
  'Use only when a source confirms disability cover exists but does not state a numeric multiple — e.g. "permanent and temporary disablement is covered under the group life policy." If a later source gives the actual multiple, that fact belongs in disability_cover_multiple, and this entry should be superseded per the normal reconciliation rule, not left standing alongside it.',
  'Disability cover is described as: {value}.'),

('risk_insurance','funeral_benefit_amount','Funeral/burial benefit (amount)','quantified','medium',
  'Numeric lump sum or salary-multiple/months-of-salary formula for a funeral or burial expenses benefit, where stated as a number. Distinct from group_life_coverage_multiple — a funeral grant is typically a separate, smaller, faster-paying benefit alongside (not instead of) group life.',
  'A funeral/burial benefit of {value} is provided.'),

('risk_insurance','funeral_benefit_scope','Funeral/burial benefit (who is covered)','named_program','medium',
  'Who the funeral/burial benefit extends to, where disclosed — e.g. "employee only," or "employee, spouse, and children," or (as some Kenyan disclosures state) extending to named in-laws or parents. Log existence-with-no-amount-disclosed here too (e.g. "confirmed to exist; amount not stated") rather than skipping the fact.',
  'The funeral/burial benefit covers: {value}.'),

('allowances','leave_allowance','Leave allowance (cash)','quantified','medium',
  'A cash payment made annually alongside leave, typically a % of annual basic salary — this is a monetary allowance, NOT the leave category''s day-count fields (annual_leave_days etc.). Do not conflate the two: a company can have generous leave days and no leave allowance, or vice versa.',
  'A leave allowance of {value} is paid annually.'),

('allowances','meal_allowance','Meal allowance','quantified','medium',
  'Amount or existence of a meal/lunch allowance or subsidy.',
  'A meal allowance is provided: {value}.'),

('allowances','utility_allowance','Utility allowance','quantified','medium',
  'Amount or existence of a utility allowance, common as a standard gross-pay component in Nigerian and Ghanaian salary structures.',
  'A utility allowance is provided: {value}.'),

('allowances','thirteenth_month_pay','Thirteenth-month / end-of-year pay','named_program','medium',
  'A guaranteed fixed end-of-year payment (commonly one month''s basic salary) distinct from performance-linked bonus, which belongs under equity_variable instead. Log scope/amount as disclosed, e.g. "one month''s basic salary, paid in December."',
  '{company} pays thirteenth-month/end-of-year pay: {value}.')
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
