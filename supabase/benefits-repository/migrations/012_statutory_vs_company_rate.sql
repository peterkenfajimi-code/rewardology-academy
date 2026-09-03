-- Migration 012 — statutory baseline vs company-disclosed contribution rates.
-- Text must stay in lockstep with lib/repository/statutory-vs-disclosure.ts
-- (STATUTORY_VS_DISCLOSURE_BULLETS / contributionPctRegistryDescription).

update benefit_field_registry
set description =
  '% of salary the employer contributes to the mandatory/primary pension scheme. country_modules statutory rates are context only. Never copy a statutory % onto a company row unless the source states that company''s rate as a number. The test: does the source state a company-specific rate, or only describe the mechanism without a number (e.g. "the Group and all its employees also contribute to NSSF")? If the source confirms participation but states no %, leave employer_contribution_pct / employee_contribution_pct empty. Do not fill them from the country baseline. A disclosed company rate that happens to equal the statutory minimum is still a valid company fact (cite the source). Matching the baseline is not leakage; inventing a number the source never stated is.'
where category = 'retirement' and field_key = 'employer_contribution_pct';

update benefit_field_registry
set description =
  '% of salary the employee contributes to the mandatory/primary pension scheme. country_modules statutory rates are context only. Never copy a statutory % onto a company row unless the source states that company''s rate as a number. The test: does the source state a company-specific rate, or only describe the mechanism without a number (e.g. "the Group and all its employees also contribute to NSSF")? If the source confirms participation but states no %, leave employer_contribution_pct / employee_contribution_pct empty. Do not fill them from the country baseline. A disclosed company rate that happens to equal the statutory minimum is still a valid company fact (cite the source). Matching the baseline is not leakage; inventing a number the source never stated is.'
where category = 'retirement' and field_key = 'employee_contribution_pct';
