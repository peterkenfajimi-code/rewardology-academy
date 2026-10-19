/**
 * Canonical test for training_spend_amount.
 * Keep migration 024 field description in lockstep with TRAINING_SPEND_BULLETS.
 *
 * A broken-out Company staff-cost Training line is a valid fact.
 * A rolled-up "training sits inside other operating expenses" line is not.
 */
export const TRAINING_SPEND_BULLETS = [
  "training_spend_amount is the company's own disclosed spend on staff training/development, at the same scope as other companies' figures.",
  "Accept only when all three hold: (1) a separate annual-report line, not an estimate from a larger total; (2) Company basis, not Group, and the entry says so; (3) staff training/development, not customer or dealer training.",
  "Reject when training sits inside a rolled-up cost line (e.g. other operating expenses) with no figure broken out.",
  "A P&L staff-cost Training line that meets the three tests is a valid company fact — it does not have to be labelled as an L&D programme budget.",
] as const;

export const TRAINING_SPEND_PROMPT_BLOCK = `
TRAINING SPEND — critical:
${TRAINING_SPEND_BULLETS.map((line) => `- ${line}`).join("\n")}`;

export const TRAINING_SPEND_REGISTRY_SUFFIX = TRAINING_SPEND_BULLETS.join(" ");

export const TRAINING_SPEND_AMOUNT_REGISTRY_DESCRIPTION = `Currency amount of the company's own disclosed staff training/development spend. ${TRAINING_SPEND_REGISTRY_SUFFIX}`;
