-- ============================================================
-- Africa Benefits Repository — Field Display Templates
-- Extends field_registry.sql. Run this AFTER field_registry.sql.
--
-- Purpose: cards were rendering raw field_key/value pairs
-- (e.g. "risk_insurance · group_life_coverage_multiple: 3") instead
-- of readable prose. This adds a sentence template per field so the
-- frontend renders natural language, with the underlying structured
-- data untouched for querying/benchmarking purposes.
--
-- Usage in the frontend: fetch display_template alongside the entry,
-- then interpolate {company} -> companies.name and {value} -> the
-- entry's value before rendering. Do NOT display field_key or raw
-- category names to end users anywhere in the public-facing UI —
-- those remain internal/query-layer concepts only.
-- ============================================================

alter table benefit_field_registry add column display_template text;

-- ---------- retirement ----------
update benefit_field_registry set display_template =
  '{company} contributes {value}% of salary to the employee pension scheme.'
  where category='retirement' and field_key='employer_contribution_pct';
update benefit_field_registry set display_template =
  'Employees contribute {value}% of salary to the pension scheme.'
  where category='retirement' and field_key='employee_contribution_pct';
update benefit_field_registry set display_template =
  '{company} operates a {value} pension scheme.'
  where category='retirement' and field_key='pension_scheme_type';
update benefit_field_registry set display_template =
  'Pension contributions are administered through {value}.'
  where category='retirement' and field_key='pension_administrator_type';
update benefit_field_registry set display_template =
  '{company} maintains a defined benefit plan alongside its primary pension scheme: {value}.'
  where category='retirement' and field_key='defined_benefit_plan_exists';
update benefit_field_registry set display_template =
  '{company} provides a gratuity/terminal benefit scheme: {value}.'
  where category='retirement' and field_key='gratuity_scheme_exists';
update benefit_field_registry set display_template =
  'The gratuity scheme is structured as follows: {value}.'
  where category='retirement' and field_key='gratuity_scheme_type';
update benefit_field_registry set display_template =
  'Employees can make additional voluntary pension contributions through {value}.'
  where category='retirement' and field_key='voluntary_contribution_program';
update benefit_field_registry set display_template =
  '{company} offers an additional exit benefit scheme: {value}.'
  where category='retirement' and field_key='additional_exit_benefit_scheme';
update benefit_field_registry set display_template =
  'Total combined pension contribution (employer + employee) is {value}% of salary.'
  where category='retirement' and field_key='total_contribution_pct';

-- ---------- health ----------
update benefit_field_registry set display_template =
  'Health coverage is provided through {value}.'
  where category='health' and field_key='hmo_provider';
update benefit_field_registry set display_template =
  'Health coverage extends to {value}.'
  where category='health' and field_key='hmo_scope';
update benefit_field_registry set display_template =
  '{company} provides the following medical facilities for staff: {value}.'
  where category='health' and field_key='medical_facilities_provision';
update benefit_field_registry set display_template =
  'An annual medical check-up is provided: {value}.'
  where category='health' and field_key='annual_medical_checkup';
update benefit_field_registry set display_template =
  '{company} offers an Employee Assistance Program: {value}.'
  where category='health' and field_key='employee_assistance_program';
update benefit_field_registry set display_template =
  'Staff have access to the following fitness/wellness facility: {value}.'
  where category='health' and field_key='fitness_wellness_facility';
update benefit_field_registry set display_template =
  '{company} has run the following wellness initiative (reported, not independently verified as ongoing): {value}.'
  where category='health' and field_key='wellness_program_narrative';

-- ---------- risk_insurance ----------
update benefit_field_registry set display_template =
  'Group life insurance covers employees at {value}x their annual salary.'
  where category='risk_insurance' and field_key='group_life_coverage_multiple';
update benefit_field_registry set display_template =
  'Group life coverage relative to the statutory minimum: {value}.'
  where category='risk_insurance' and field_key='group_life_meets_statutory_minimum';
update benefit_field_registry set display_template =
  'Group personal accident insurance is provided: {value}.'
  where category='risk_insurance' and field_key='group_personal_accident_insurance';
update benefit_field_registry set display_template =
  'Workplace injury compensation compliance status: {value}.'
  where category='risk_insurance' and field_key='workplace_injury_compliance';
update benefit_field_registry set display_template =
  '{company} provides occupational hazard insurance: {value}.'
  where category='risk_insurance' and field_key='occupational_hazard_insurance';

-- ---------- leave ----------
update benefit_field_registry set display_template =
  'Employees receive {value} days of annual leave.'
  where category='leave' and field_key='annual_leave_days';
update benefit_field_registry set display_template =
  'Maternity leave is {value}.'
  where category='leave' and field_key='maternity_leave_duration';
update benefit_field_registry set display_template =
  'Paternity leave is {value}.'
  where category='leave' and field_key='paternity_leave_duration';
update benefit_field_registry set display_template =
  'Sick leave entitlement is {value} days.'
  where category='leave' and field_key='sick_leave_days';
update benefit_field_registry set display_template =
  '{company} offers study leave: {value}.'
  where category='leave' and field_key='study_leave_policy';
update benefit_field_registry set display_template =
  'Leave entitlement relative to the statutory minimum: {value}.'
  where category='leave' and field_key='leave_exceeds_statutory_minimum';

-- ---------- allowances ----------
update benefit_field_registry set display_template =
  'A housing allowance is provided: {value}.'
  where category='allowances' and field_key='housing_allowance';
update benefit_field_registry set display_template =
  'A transport allowance is provided: {value}.'
  where category='allowances' and field_key='transport_allowance';
update benefit_field_registry set display_template =
  'The following allowances are pensionable: {value}.'
  where category='allowances' and field_key='pensionable_allowances';
update benefit_field_registry set display_template =
  'Salary review status: {value}.'
  where category='allowances' and field_key='salary_review_frequency';
update benefit_field_registry set display_template =
  '{company} describes its compensation philosophy as: "{value}"'
  where category='allowances' and field_key='compensation_philosophy_statement';

-- ---------- development ----------
update benefit_field_registry set display_template =
  '{company} reported training/development spend of {value}.'
  where category='development' and field_key='training_spend_amount';
update benefit_field_registry set display_template =
  'Training/development spend represents {value}% of payroll.'
  where category='development' and field_key='training_spend_pct_payroll';
update benefit_field_registry set display_template =
  '{value} employees were trained in the reported period.'
  where category='development' and field_key='employees_trained_count';
update benefit_field_registry set display_template =
  '{company} offers tuition/certification reimbursement: {value}.'
  where category='development' and field_key='tuition_reimbursement';
update benefit_field_registry set display_template =
  '{company} partners with the following institutions for executive education: {value}.'
  where category='development' and field_key='executive_education_partnership';
update benefit_field_registry set display_template =
  '{company} provides the following health & safety training: {value}.'
  where category='development' and field_key='health_safety_training';

-- ---------- equity_variable ----------
update benefit_field_registry set display_template =
  '{company} operates an Employee Share Ownership Plan: {value}.'
  where category='equity_variable' and field_key='esop_exists';
update benefit_field_registry set display_template =
  'Share-based compensation is structured as: {value}.'
  where category='equity_variable' and field_key='share_based_payment_scheme';
update benefit_field_registry set display_template =
  '{company} offers a long-term incentive plan: {value}.'
  where category='equity_variable' and field_key='long_term_incentive_plan';

-- ---------- other_voluntary ----------
update benefit_field_registry set display_template =
  '{company} offers a flexible/hybrid work policy: {value}.'
  where category='other_voluntary' and field_key='flexible_hybrid_work_policy';
update benefit_field_registry set display_template =
  '{company} provides a creche/childcare facility: {value}.'
  where category='other_voluntary' and field_key='creche_childcare_facility';
update benefit_field_registry set display_template =
  '{company} states it has a non-discrimination employment policy: {value}.'
  where category='other_voluntary' and field_key='non_discrimination_policy';
update benefit_field_registry set display_template =
  'Termination benefits are recognized as follows: {value}.'
  where category='other_voluntary' and field_key='termination_benefits_policy';

-- ---------- enforce that every registry row has a template ----------
-- Run this check after the updates above — it should return zero rows.
-- If it returns any, a field was added to field_registry.sql without a
-- matching template here, which would leave that field falling back to
-- a raw field_key/value display in the UI.

-- select category, field_key from benefit_field_registry where display_template is null;

alter table benefit_field_registry alter column display_template set not null;
