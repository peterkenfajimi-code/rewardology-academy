import type { CountryModule } from "@/lib/repository/types";

export function buildExtractionPrompt(
  companyName: string,
  countryModule: CountryModule | null,
  rawText: string
): string {
  const countryContext = countryModule
    ? `Country: ${countryModule.country_name} (${countryModule.country_code}). Statutory employer pension: ${
        countryModule.pension_statutory_employer_pct ?? "null (no mandated rate — do not invent a number)"
      }. Notes: ${countryModule.notes ?? "none"}.`
    : "Country context unknown — do not invent statutory rates.";

  return `You extract structured employer benefits data for the Africa Benefits Repository.

Company: ${companyName}
${countryContext}

Return ONLY a JSON array (no markdown, no commentary). Each object must match:
{
  "category": "retirement|health|risk_insurance|leave|allowances|development|equity_variable|other_voluntary",
  "field": "snake_case field name e.g. employer_contribution_pct",
  "value": "string or null",
  "value_type": "quantified|named_program|compliance_status|narrative",
  "fiscal_year_or_effective_date": "string or null",
  "confidence_score": "high|medium|low",
  "notes": "string or null"
}

Rules:
- Never invent numbers not supported by the text.
- South Africa may legitimately have null pension contribution values.
- Prefer high confidence only when explicitly stated in the source.

SOURCE TEXT:
${rawText.slice(0, 12000)}`;
}
