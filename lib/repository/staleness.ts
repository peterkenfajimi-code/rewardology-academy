/** Months after effective_date before an entry is flagged as potentially outdated. */
export const STALENESS_MONTHS = 24;

export function isEntryStale(effectiveDate: string | null | undefined, now = new Date()): boolean {
  if (!effectiveDate) return false;
  const parsed = new Date(effectiveDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const threshold = new Date(now);
  threshold.setMonth(threshold.getMonth() - STALENESS_MONTHS);
  return parsed < threshold;
}

export function formatEffectiveDateBadge(effectiveDate: string): string {
  const parsed = new Date(effectiveDate);
  if (Number.isNaN(parsed.getTime())) return effectiveDate;
  return parsed.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
