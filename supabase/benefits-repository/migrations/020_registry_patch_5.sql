-- Migration 020 — field_registry_patch_5: no field is capped at 'low'
-- max_confidence is a ceiling, and Low findings are held rather than published, so a 'low' ceiling
-- means the field can never publish. Both fields' descriptions say "cap at low/medium"; medium was
-- the intended ceiling. Vague findings are still clamped to Low per entry and still don't publish.

update benefit_field_registry set max_confidence = 'medium'
  where category = 'health' and field_key = 'wellness_program_narrative';

update benefit_field_registry set max_confidence = 'medium'
  where category = 'allowances' and field_key = 'lifestyle_benefit';
