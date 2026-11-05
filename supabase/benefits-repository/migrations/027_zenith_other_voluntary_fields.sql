-- Migration 027 — field_registry_patch_7: Zenith Bank FY2025 unmapped benefits
-- Compassionate cash, wedding cash gift, and professional-body subscription had no close field
-- (not funeral cover, not lifestyle_benefit, not tuition_reimbursement). Named_program / medium.

insert into benefit_field_registry (category, field_key, field_label, value_type, max_confidence, description, display_template) values
('other_voluntary','compassionate_cash_support','Compassionate cash support','named_program','medium',
  'A discretionary cash payment on bereavement, hardship, or similar compassionate grounds. Distinct from funeral_benefit_amount/scope (a funeral or burial grant) and from leave_allowance (annual leave cash). Log existence and who is covered as disclosed.',
  '{company} provides compassionate cash support: {value}.'),

('other_voluntary','wedding_cash_gift','Wedding cash gift','named_program','medium',
  'A cash gift paid to employees on marriage. Distinct from compassionate_cash_support and from lifestyle_benefit (use lifestyle_benefit only when no closer field exists).',
  '{company} provides a wedding cash gift: {value}.'),

('other_voluntary','professional_subscription_payment','Professional qualification subscription','named_program','medium',
  'Employer payment of annual professional-body or qualification subscriptions. Distinct from tuition_reimbursement (course or certification fees) and from training_spend_amount (aggregate L&D spend).',
  '{company} pays professional qualification subscriptions: {value}.')
on conflict (category, field_key) do update set
  field_label = excluded.field_label,
  value_type = excluded.value_type,
  max_confidence = excluded.max_confidence,
  description = excluded.description,
  display_template = excluded.display_template;
