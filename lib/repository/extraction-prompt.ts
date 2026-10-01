import { STATUTORY_VS_DISCLOSURE_PROMPT_BLOCK } from "@/lib/repository/statutory-vs-disclosure";
import type { CountryModule } from "@/lib/repository/types";
import type { FieldRegistryRow } from "@/lib/repository/field-registry";
import { formatRegistryForPrompt } from "@/lib/repository/field-registry";

export function buildExtractionInstructions(
  companyName: string,
  countryModule: CountryModule | null,
  registryRows: FieldRegistryRow[] = []
): string {
  const countryContext = countryModule
    ? `Country: ${countryModule.country_name} (${countryModule.country_code}). Statutory employer pension: ${
        countryModule.pension_statutory_employer_pct ?? "null (no mandated rate — do not invent a number)"
      }. Pension scheme type (country baseline): ${countryModule.pension_scheme_type ?? "unknown"}. Notes: ${countryModule.notes ?? "none"}.`
    : "Country context unknown — do not invent statutory rates.";

  const kenyaTierNote =
    countryModule?.country_code === "KE"
      ? `
KENYA MULTI-TIER PENSION — critical:
- NSSF Tier 1 is capped (not a flat % of full salary). Do NOT collapse NSSF into one flat employer/employee percentage unless the source states a single uncapped rate.
- Use pension_scheme_type for scheme structure (e.g. mixed, defined contribution, occupational scheme) — not force-fit to a single-tier DC label when NSSF + private/Occupational Retirement Benefit Scheme (ORBS) coexist.
- If the source mentions a contracted-out or company occupational scheme alongside NSSF, capture Tier 2 rates via tier2_employer_contribution_pct / tier2_employee_contribution_pct when disclosed — do not merge tiers into one contribution %.
- employer_contribution_pct / employee_contribution_pct should reflect Tier 1 NSSF rates only when the source states them explicitly per tier; note caps in notes when disclosed.
- voluntary_contribution_program is only for optional employee-initiated extra contributions, not mandatory occupational tier rates.`
      : "";

  const ghanaTierNote =
    countryModule?.country_code === "GH"
      ? `
GHANA THREE-TIER SSNIT PENSION — critical:
- Tier 1: SSNIT — employer-funded defined benefit (baseline statutory). Tier 2: mandatory occupational/DC scheme. Tier 3: voluntary provident fund / additional contributions.
- Do NOT collapse all tiers into one flat employer/employee percentage or a single "defined contribution" label.
- Use pension_scheme_type for overall structure (expect mixed, not single-tier DC). Use pension_administrator_type for SSNIT vs corporate trustee/PFA roles per tier.
- Tier 1 primary rates: employer_contribution_pct / employee_contribution_pct (only when the source states Tier 1 / SSNIT rates explicitly).
- Tier 2 mandatory occupational rates: tier2_employer_contribution_pct / tier2_employee_contribution_pct — NOT voluntary_contribution_program (that field is for optional employee-initiated extra contributions only, e.g. AVC).
- Tier 3 voluntary extras: voluntary_contribution_program only when the source describes optional additional employee contributions.
- Post-retirement medical care for former employees: post_retirement_medical_care — NOT health.hmo_scope (active-employee coverage) or additional_exit_benefit_scheme (exit/severance payout).
- defined_benefit_plan_exists is Yes/No only for a company-sponsored supplementary pension-style DB scheme (pays a pension defined by salary and service) — NOT SSNIT Tier 1 (country statutory DB), and NOT a lump-sum gratuity even when IAS 19 treats it as a defined benefit obligation (that goes on gratuity_scheme_exists / gratuity_scheme_type). If the company pension-style scheme is closed, frozen, or discontinued, still Yes, and set defined_benefit_plan_status to closed_legacy. Values for defined_benefit_plan_status: active | closed_legacy | none. Never put the closed/discontinued story on defined_benefit_plan_exists.`
      : "";

  const registryBlock =
    registryRows.length > 0
      ? `

CLOSED FIELD VOCABULARY — you MUST classify each extracted fact using exactly one field_key from this registry:
${formatRegistryForPrompt(registryRows)}

If nothing in this list fits a genuine employee benefit fact in the source text, return it with field: "unmapped", your best category guess, the raw value text, and explain in notes what kind of fact it is. Do NOT invent new field names.`
      : "";

  return `You extract structured employer benefits data for the Africa Benefits Repository.

Company: ${companyName}
${countryContext}${STATUTORY_VS_DISCLOSURE_PROMPT_BLOCK}${kenyaTierNote}${ghanaTierNote}${registryBlock}

Return ONLY a JSON object (no markdown, no commentary) with two arrays:

{
  "benefits": [
    {
      "category": "retirement|health|risk_insurance|leave|allowances|development|equity_variable|other_voluntary",
      "field": "exact field_key from the registry above, or unmapped",
      "value": "string or null",
      "value_type": "quantified|named_program|compliance_status|narrative",
      "fiscal_year_or_effective_date": "string or null",
      "confidence_score": "high|medium|low",
      "notes": "string or null"
    }
  ],
  "workforce_composition": [
    {
      "metric_key": "female_workforce_pct|female_board_pct|female_senior_management_pct|female_leadership_pct|disability_employment_count",
      "value": "string (the number or short phrase only, e.g. 45 for 45%)",
      "reporting_period": "string or null (e.g. FY2024, 2024)",
      "confidence_score": "high|medium|low",
      "notes": "string or null"
    }
  ]
}

WORKFORCE vs BENEFITS — critical routing rules:
- benefit_entries is ONLY for benefits an individual employee receives (pension %, insurance, leave days, allowances, etc.).
- workforce_composition is for population/demographic statistics about the workforce as a whole.
- Quantified gender %, leadership/board representation %, disability employment counts, diversity targets → ALWAYS go in workforce_composition, NEVER in benefits — even when the source frames them inside a "policy" or "non-discrimination" paragraph.
- compliance_status fields (non_discrimination_policy, esop_exists, gratuity_scheme_exists, annual_medical_checkup, etc.) must be Yes or No only — never narrative paragraphs or policy text.
- If a paragraph mixes policy existence with demographic stats, split them: Yes/No in benefits.non_discrimination_policy, each statistic as its own workforce_composition row.

Other rules:
- Never invent numbers not supported by the text.
- South Africa may legitimately have null pension contribution values.
- Prefer high confidence only when explicitly stated in the source.
- Respect each field's max confidence from the registry — narrative/wellness content must not be high even in audited reports.
- Do NOT extract pension subsidiary business metrics (AUM, revenue, growth), micro-pension products, RSA transfer programmes, defined-contribution balance-sheet liabilities, personnel expense totals, share-based payment liabilities, or COVID donation amounts.
- Accounting-policy text is not a benefit disclosure. IAS 19 definitions ("short-term benefits consist of salaries, bonuses and non-monetary benefits such as medical aid"), recognition rules ("termination benefits are recognised when the Group is demonstrably committed…"), and accrual notes (accrued annual leave liability) describe cost categories or timing — extract only what the company asserts it actually provides.
- A lump-sum gratuity or terminal-benefit scheme belongs on gratuity_scheme_exists / gratuity_scheme_type even when the accounts call it a defined benefit obligation under IAS 19. defined_benefit_plan_exists / defined_benefit_plan_status are only for pension-style DB schemes that pay a pension defined by salary and service. Never record the same scheme on both.
- Committee terms of reference ("the committee reviews pension and medical schemes / learning and development") describe oversight duties, not benefits employees receive.
- Focus employee-facing benefits on schemes, coverage, programmes, contribution rates.
- For group life insurance salary multiples, always use field_key group_life_coverage_multiple — never create variants.
- If no workforce statistics appear in the source, return "workforce_composition": [].

Return ONLY the JSON object.`;
}

export function buildExtractionPrompt(
  companyName: string,
  countryModule: CountryModule | null,
  rawText: string,
  registryRows: FieldRegistryRow[] = []
): string {
  return `${buildExtractionInstructions(companyName, countryModule, registryRows)}

SOURCE TEXT:
${rawText.slice(0, 12000)}`;
}
