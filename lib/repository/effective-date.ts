/** Best-effort parse of fiscal_year_or_effective_date into a sortable date for staleness checks. */
export function parseEffectiveDate(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const raw = text.trim();

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;

  const fy = raw.match(/\bFY\s*(\d{4})\b/i) ?? raw.match(/\bfiscal\s+year\s+(\d{4})\b/i);
  if (fy) return `${fy[1]}-12-31`;

  const yearOnly = raw.match(/\b(20\d{2})\b/);
  if (yearOnly && !raw.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
    return `${yearOnly[1]}-12-31`;
  }

  const monthYear =
    raw.match(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i
    ) ??
    raw.match(
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})\b/i
    );
  if (monthYear) {
    const monthNames: Record<string, string> = {
      january: "01",
      jan: "01",
      february: "02",
      feb: "02",
      march: "03",
      mar: "03",
      april: "04",
      apr: "04",
      may: "05",
      june: "06",
      jun: "06",
      july: "07",
      jul: "07",
      august: "08",
      aug: "08",
      september: "09",
      sep: "09",
      october: "10",
      oct: "10",
      november: "11",
      nov: "11",
      december: "12",
      dec: "12",
    };
    const monthKey = monthYear[1].slice(0, 3).toLowerCase();
    const month =
      monthNames[monthYear[1].toLowerCase()] ??
      monthNames[Object.keys(monthNames).find((k) => k.startsWith(monthKey)) ?? ""] ??
      "12";
    return `${monthYear[2]}-${month}-28`;
  }

  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  return null;
}
