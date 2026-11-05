-- Migration 028 — hmo_scope: quantified -> named_program
-- Same mismatch housing/transport had in 025 and meal/utility in 018: the field is used for
-- who is covered (staff / staff + family / contract staff), not a dependent count.
-- Audit (Nov 2026, before publishing Zenith HMO): the only published hmo_scope row is GTCO
-- "Medical facilities provided to employees and immediate families at company expense"
-- (stored as narrative). No published row holds a numeric value, so retype does not
-- change a live stat-card number. Do not add hmo_cover_scope — one canonical field per fact.

update benefit_field_registry
set
  value_type = 'named_program',
  description = 'Who health coverage extends to, as disclosed — e.g. staff only, staff and immediate family, employees including contract staff. Existence-without-a-dependent-count belongs here. Do not invent a dependent count. Distinct from hmo_provider (named insurer) and medical_facilities_provision (clinics/hospitals).'
where category = 'health' and field_key = 'hmo_scope';
