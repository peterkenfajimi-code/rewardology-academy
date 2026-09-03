/**
 * Canonical leak-vs-disclosure test for contribution rates.
 * Keep migration 006 / 012 field descriptions in lockstep with STATUTORY_VS_DISCLOSURE_BULLETS.
 *
 * Matching the country statutory minimum is not leakage.
 * Inventing a number the source never stated is.
 */
export const STATUTORY_VS_DISCLOSURE_BULLETS = [
  "country_modules statutory rates are context only. Never copy a statutory % onto a company row unless the source states that company's rate as a number.",
  'The test: does the source state a company-specific rate, or only describe the mechanism without a number (e.g. "the Group and all its employees also contribute to NSSF")?',
  "If the source confirms participation but states no %, leave employer_contribution_pct / employee_contribution_pct empty. Do not fill them from the country baseline.",
  "A disclosed company rate that happens to equal the statutory minimum is still a valid company fact (cite the source). Matching the baseline is not leakage; inventing a number the source never stated is.",
] as const;

export const STATUTORY_VS_DISCLOSURE_PROMPT_BLOCK = `
STATUTORY BASELINE VS COMPANY DISCLOSURE — critical:
${STATUTORY_VS_DISCLOSURE_BULLETS.map((line) => `- ${line}`).join("\n")}`;

/** Same four sentences, inline for field-registry descriptions. */
export const STATUTORY_VS_DISCLOSURE_REGISTRY_SUFFIX =
  STATUTORY_VS_DISCLOSURE_BULLETS.join(" ");

export function contributionPctRegistryDescription(who: "employer" | "employee"): string {
  return `% of salary the ${who} contributes to the mandatory/primary pension scheme. ${STATUTORY_VS_DISCLOSURE_REGISTRY_SUFFIX}`;
}
