-- Migration 025 — housing_allowance / transport_allowance: quantified -> named_program
-- Same mismatch meal_allowance / utility_allowance had in 018: descriptions allow "amount or
-- existence", so an existence-only finding would be held as value_type_mismatch.
-- Audit (Oct 2026, before GCB 2025 AR collection): zero benefit_entries on either field, so no
-- published fact depends on quantified stat-card rendering. Retype is safe.

update benefit_field_registry set value_type = 'named_program'
  where category = 'allowances' and field_key in ('housing_allowance', 'transport_allowance');
