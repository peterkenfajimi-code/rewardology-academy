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
      }. Notes: ${countryModule.notes ?? "none"}.`
    : "Country context unknown — do not invent statutory rates.";

  const registryBlock =
    registryRows.length > 0
      ? `

CLOSED FIELD VOCABULARY — you MUST classify each extracted fact using exactly one field_key from this registry:
${formatRegistryForPrompt(registryRows)}

If nothing in this list fits a genuine employee benefit fact in the source text, return it with field: "unmapped", your best category guess, the raw value text, and explain in notes what kind of fact it is. Do NOT invent new field names.`
      : "";

  return `You extract structured employer benefits data for the Africa Benefits Repository.

Company: ${companyName}
${countryContext}${registryBlock}

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
