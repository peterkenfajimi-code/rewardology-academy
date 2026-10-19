-- Migration 024 — training_spend_amount: Company staff training line, not a programme-budget label.
-- Text must stay in lockstep with lib/repository/training-spend.ts
-- (TRAINING_SPEND_BULLETS / TRAINING_SPEND_AMOUNT_REGISTRY_DESCRIPTION).
-- Safaricom FY2024/FY2025 rejected because training sat inside other operating expenses with no
-- figure broken out. MTN Ghana FY2024 note 2.8 is the opposite: a separate Company Training line.

update benefit_field_registry
set description =
  'Currency amount of the company''s own disclosed staff training/development spend. training_spend_amount is the company''s own disclosed spend on staff training/development, at the same scope as other companies'' figures. Accept only when all three hold: (1) a separate annual-report line, not an estimate from a larger total; (2) Company basis, not Group, and the entry says so; (3) staff training/development, not customer or dealer training. Reject when training sits inside a rolled-up cost line (e.g. other operating expenses) with no figure broken out. A P&L staff-cost Training line that meets the three tests is a valid company fact — it does not have to be labelled as an L&D programme budget.'
where category = 'development' and field_key = 'training_spend_amount';
