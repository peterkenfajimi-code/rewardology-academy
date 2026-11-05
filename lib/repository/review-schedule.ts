/** When a newer annual report than last_fy_extracted is expected to be out. */

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export function parseFiscalYear(value: string | null | undefined): number | null {
  const raw = (value ?? "").trim();
  const m = raw.match(/(?:FY)?(20\d{2})/i);
  if (!m) return null;
  return Number(m[1]);
}

function monthIndex(label: string | null | undefined): number | null {
  const key = (label ?? "").trim().toLowerCase();
  if (!key) return null;
  const last = key.split(/\s+/).pop() ?? key;
  return MONTHS[last] ?? null;
}

/**
 * Calendar date the FY report is usually published.
 * If the report month is after the FYE month (Safaricom: March FYE, June report),
 * it falls in the same calendar year as the FYE. Otherwise it falls in the next
 * year (December FYE, March report → March of FY+1).
 */
export function reportAvailableOn(
  fyYear: number,
  fiscalYearEnd: string,
  reportUsuallyPublishedMonth: string
): Date | null {
  const fyeMonth = monthIndex(fiscalYearEnd);
  const reportMonth = monthIndex(reportUsuallyPublishedMonth);
  if (fyeMonth == null || reportMonth == null) return null;
  const year = reportMonth > fyeMonth ? fyYear : fyYear + 1;
  return new Date(Date.UTC(year, reportMonth, 1));
}

export function latestAvailableFiscalYear(
  fiscalYearEnd: string,
  reportUsuallyPublishedMonth: string,
  asOf = new Date()
): number | null {
  const asOfUtc = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  const start = asOf.getUTCFullYear() + 1;
  for (let fy = start; fy >= start - 6; fy -= 1) {
    const available = reportAvailableOn(fy, fiscalYearEnd, reportUsuallyPublishedMonth);
    if (available && available.getTime() <= asOfUtc) return fy;
  }
  return null;
}

/** True when a newer annual report than last_fy_extracted is already expected to be out. */
export function isExtractionOverdue(input: {
  last_fy_extracted?: string | null;
  fiscal_year_end: string;
  report_usually_published_month: string;
  asOf?: Date;
}): boolean {
  const last = parseFiscalYear(input.last_fy_extracted);
  const latest = latestAvailableFiscalYear(
    input.fiscal_year_end,
    input.report_usually_published_month,
    input.asOf ?? new Date()
  );
  if (last == null || latest == null) return false;
  return last < latest;
}
