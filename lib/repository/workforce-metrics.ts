/** Detect workforce/demographic statistics misrouted into benefit_entries fields. */

const DEMOGRAPHIC_PATTERNS = [
  /\bfemale\b.*\d+\s*%/i,
  /\bmale\b.*\d+\s*%/i,
  /\bwomen\b.*\d+\s*%/i,
  /\brepresentation\b.*\d+\s*%/i,
  /\bdiversity\b.*\d+\s*%/i,
  /\bboard\b.*\d+\s*%/i,
  /\bleadership\b.*\d+\s*%/i,
  /\bworkforce\b.*\d+\s*%/i,
  /\bdisability\b.*\d+/i,
  /\b\d+\s*%\s*\(\d{4}:/i,
];

const POLICY_EXISTENCE_FIELDS = new Set([
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

export type WorkforceMetricKey =
  | "female_workforce_pct"
  | "female_board_pct"
  | "female_senior_management_pct"
  | "female_leadership_pct"
  | "disability_employment_count";

export type ExtractedWorkforceEntry = {
  metric_key: WorkforceMetricKey | string;
  value: string;
  reporting_period?: string | null;
  confidence_score: "high" | "medium" | "low";
  notes?: string | null;
};

export function looksLikeWorkforceDemographic(value: string | null | undefined): boolean {
  const text = value?.trim() ?? "";
  if (!text) return false;
  return DEMOGRAPHIC_PATTERNS.some((re) => re.test(text));
}

/** Benefit field used as compliance Yes/No but value contains demographic stats instead. */
export function isMisroutedWorkforceInBenefitField(field: string, value: string | null | undefined): boolean {
  if (!POLICY_EXISTENCE_FIELDS.has(field)) return false;
  return looksLikeWorkforceDemographic(value);
}

export function inferWorkforceMetricsFromText(
  value: string,
  reportingPeriod?: string | null
): ExtractedWorkforceEntry[] {
  const metrics: ExtractedWorkforceEntry[] = [];
  const period = reportingPeriod ?? null;

  const femaleWorkforce = value.match(/female representation to (\d+)%/i);
  if (femaleWorkforce) {
    metrics.push({
      metric_key: "female_workforce_pct",
      value: femaleWorkforce[1],
      reporting_period: period,
      confidence_score: "high",
    });
  }

  const womenLeadership = value.match(/women in leadership to (\d+)%/i);
  if (womenLeadership) {
    metrics.push({
      metric_key: "female_leadership_pct",
      value: womenLeadership[1],
      reporting_period: period,
      confidence_score: "high",
    });
  }

  const femaleBoard = value.match(/female board.*?(\d+)%/i);
  if (femaleBoard) {
    metrics.push({
      metric_key: "female_board_pct",
      value: femaleBoard[1],
      reporting_period: period,
      confidence_score: "high",
    });
  }

  return metrics;
}
