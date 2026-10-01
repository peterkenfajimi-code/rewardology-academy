-- Migration 023 — field_registry_patch_6: long_service_award
-- Tenure-milestone recognition (cash, gift, or both). Distinct from gratuity (exit), thirteenth_month_pay
-- (guaranteed annual), and annual_performance_bonus (performance-linked). Prompted by MTN Ghana's 2024 AR
-- disclosure (from 2016, five years' service) which had no field and was correctly left unrecorded.

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
('other_voluntary','long_service_award','Long service award','named_program','medium',
  'A recognition award (cash, gift, or both) for tenure milestones (e.g. 5/10/15/20 years) — distinct from gratuity_scheme_type (an exit/terminal benefit), thirteenth_month_pay (guaranteed annual, not tenure-linked), and annual_performance_bonus (performance-linked, not tenure-linked). Log the disclosed structure — which milestone(s) and what form the award takes — as the value.',
  '{company} recognizes long service with: {value}.')
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
