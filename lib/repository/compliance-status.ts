import type { ValueType } from "@/lib/repository/types";

const COMPLIANCE_YES_NO_FIELDS = new Set([
  "non_discrimination_policy",
  "defined_benefit_plan_exists",
  "esop_exists",
  "gratuity_scheme_exists",
  "annual_medical_checkup",
  "group_personal_accident_insurance",
  "group_life_meets_statutory_minimum",
  "workplace_injury_compliance",
  "leave_exceeds_statutory_minimum",
]);

/** Normalize compliance_status fields to Yes/No when AI returns narrative. */
export function normalizeComplianceStatusValue(
  field: string,
  value: string | null | undefined,
  valueType: ValueType
): string | null {
  if (!value?.trim()) return value ?? null;
  if (valueType !== "compliance_status" && !COMPLIANCE_YES_NO_FIELDS.has(field)) {
    return value;
  }
  if (!COMPLIANCE_YES_NO_FIELDS.has(field)) return value;

  const text = value.trim();
  const lower = text.toLowerCase();
  if (/^(yes|no)\.?$/i.test(text)) return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/\.$/, "");

  const negative =
    /\b(no|not|without|does not|doesn't|do not|none)\b/i.test(lower) &&
    !/\b(non-discrimination|non discrimination|policy)\b/i.test(lower);
  if (negative && text.length < 40) return "No";

  if (
    /\b(yes|exists|in place|maintains|states|has a|have a|policy|committed|provided)\b/i.test(lower) ||
    text.length > 20
  ) {
    return "Yes";
  }

  return value;
}
