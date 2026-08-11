import type { BenefitCategory, SourceType } from "@/lib/repository/types";

const LEGAL_CATEGORIES: BenefitCategory[] = ["retirement", "risk_insurance"];

const NEGATIVE_COMPLIANCE = [
  "non-compliant",
  "non compliant",
  "not compliant",
  "violation",
  "breach",
  "penalty",
  "fine",
  "failed",
  "deficiency",
];

export function requiresLegalReview(
  category: BenefitCategory,
  sourceType: SourceType,
  value: string | null | undefined,
  valueType: string | null | undefined
): boolean {
  if (!LEGAL_CATEGORIES.includes(category)) return false;
  if (sourceType !== "regulatory_filing") return false;
  if (valueType !== "compliance_status") return false;
  const v = (value ?? "").toLowerCase();
  return NEGATIVE_COMPLIANCE.some((term) => v.includes(term));
}
