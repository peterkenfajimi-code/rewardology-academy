export const REPOSITORY_CORRECTION_EMAIL = "hello@rewardologyacademy.com";

export const SUPERSEDED_FINDINGS_SENTENCE =
  "Superseded findings are kept on record, not deleted, and are available on request through the correction process.";

export function repositoryCorrectionSubject(companyName?: string): string {
  return companyName
    ? `Africa Benefits Repository correction — ${companyName}`
    : "Africa Benefits Repository correction";
}

export function repositoryCorrectionMailto(companyName?: string): string {
  return `mailto:${REPOSITORY_CORRECTION_EMAIL}?subject=${encodeURIComponent(
    repositoryCorrectionSubject(companyName)
  )}`;
}
