/**
 * Standing scope rule for listed groups (Zenith Bank, Standard Bank Group, and later Group rows).
 * The company row is the listed entity. Group figures stay labelled or stay out.
 */

export const GROUP_SCOPE_BULLETS = [
  "The company row is the listed entity (Bank, Company, or named issuer), not the consolidation Group.",
  "Where a table splits Bank/Company and Group, use the Bank/Company figure. Keep the Group figure out, or label it separately — never attach a Group number to the listed-entity row as if it were that entity's.",
  'Jurisdiction-labelled rates take their source label (e.g. "Nigeria operations"). Quote the source wording. Do not relabel them Bank or Group, and do not add a statutory comparison.',
  'Group-labelled narrative is allowed only if the benefit plausibly applies broadly: put "(Group)" in the value, cap confidence at medium, and never treat a Group number as the listed entity\'s number.',
  'If the text does not say which entity it covers, say "per the report" and flag it. Do not assume.',
] as const;

/** When the listed entity is itself a multi-country holding company, Bank-column preference inverts. */
export const LISTED_HOLDING_GROUP_SCOPE_BULLETS = [
  "If the listed entity is a Group holding company (KCB Group Plc, MTN Group Limited, Standard Bank Group Limited), the company row is that holding company — not an operating Bank subsidiary.",
  "On a holding-company row, use Group-column / Group-labelled figures and put (Group) in the value. Cap narrative at medium.",
  "Bank, Company, or single-country columns are subsidiaries or operations: keep them out, or label them with the source jurisdiction (e.g. Kenya operations). Never treat a Kenya-only or Bank-Kenya number as Group-wide.",
  "Do not apply the operating-bank Bank-column preference (Zenith, GCB, Stanbic Bank Ghana Ltd) to a holding-company listing.",
] as const;

export const GROUP_SCOPE_PROMPT_BLOCK = `
GROUP / LISTED-ENTITY SCOPE — critical:
${GROUP_SCOPE_BULLETS.map((line) => `- ${line}`).join("\n")}
LISTED HOLDING COMPANY (multi-country Group row):
${LISTED_HOLDING_GROUP_SCOPE_BULLETS.map((line) => `- ${line}`).join("\n")}`;
