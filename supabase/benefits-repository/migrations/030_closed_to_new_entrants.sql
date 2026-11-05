-- Migration 030 — defined_benefit_plan_status: closed_to_new_entrants
-- Closed to new members but still accruing is not closed_legacy (frozen / not accruing)
-- and not active (open). KCB Group Pension Fund closed 1 June 2006 with current service
-- cost still accruing (Ksh 78m). Do not collapse that onto closed_legacy.

update benefit_field_registry
set description = 'Yes/No — whether a company-sponsored supplementary pension-style DB scheme exists (pays a pension defined by salary and service), including closed/legacy and closed-to-new-entrants schemes. Not the country statutory DB (e.g. SSNIT Tier 1). Not a lump-sum gratuity scheme, even when the accounts treat it as a defined benefit obligation under IAS 19 — that goes on gratuity_scheme_exists / gratuity_scheme_type. Put active vs closed_legacy vs closed_to_new_entrants vs none on defined_benefit_plan_status; never store the closed/discontinued story on this field.'
where category = 'retirement' and field_key = 'defined_benefit_plan_exists';

update benefit_field_registry
set description = 'Status of the company-sponsored supplementary pension-style DB scheme: active, closed_legacy, closed_to_new_entrants, or none. Use closed_legacy when the scheme is frozen, discontinued, or not accruing for current employees. Use closed_to_new_entrants when the scheme is closed to new members but still accruing for remaining in-service members. Not SSNIT/statutory DB, and not a lump-sum gratuity scheme (use the gratuity fields). Not a Yes/No field.'
where category = 'retirement' and field_key = 'defined_benefit_plan_status';
