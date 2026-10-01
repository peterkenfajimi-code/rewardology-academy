-- Migration 022 — lump-sum gratuity schemes belong on the gratuity fields, not the DB plan fields
-- GTCO's funded lump-sum gratuity scheme is accounted for as a defined benefit obligation under IAS 19
-- and was published on both defined_benefit_plan_exists and gratuity_scheme_exists — one plan, two
-- facts. The DB fields now mean pension-style schemes (a pension/annuity defined by salary and
-- service); a lump-sum gratuity goes on gratuity_scheme_exists / gratuity_scheme_type regardless of
-- its accounting treatment.

update benefit_field_registry
set description = 'Yes/No — whether a company-sponsored supplementary pension-style DB scheme exists (pays a pension defined by salary and service), including closed/legacy schemes. Not the country statutory DB (e.g. SSNIT Tier 1). Not a lump-sum gratuity scheme, even when the accounts treat it as a defined benefit obligation under IAS 19 — that goes on gratuity_scheme_exists / gratuity_scheme_type. Put active vs closed_legacy vs none on defined_benefit_plan_status; never store the closed/discontinued story on this field.'
where category = 'retirement' and field_key = 'defined_benefit_plan_exists';

update benefit_field_registry
set description = 'Status of the company-sponsored supplementary pension-style DB scheme: active, closed_legacy, or none. Use closed_legacy when the scheme is frozen, discontinued, or closed to current employees. Not SSNIT/statutory DB, and not a lump-sum gratuity scheme (use the gratuity fields). Not a Yes/No field.'
where category = 'retirement' and field_key = 'defined_benefit_plan_status';

update benefit_field_registry
set description = 'Yes/No — whether the company operates a gratuity / terminal lump-sum benefit scheme, including one the accounts treat as a defined benefit obligation under IAS 19 (do not also record it on defined_benefit_plan_exists). Put how it is calculated — eligibility, years-of-service formula, cap — on gratuity_scheme_type, not here.'
where category = 'retirement' and field_key = 'gratuity_scheme_exists';

update benefit_field_registry
set description = 'How the gratuity/terminal benefit is calculated, where disclosed — eligibility (e.g. years of service before joining), the formula, any cap, and whether it is funded or contributory.'
where category = 'retirement' and field_key = 'gratuity_scheme_type';
