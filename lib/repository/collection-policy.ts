import type { ExtractedEntry } from "@/lib/repository/types";
import {
  inferWorkforceMetricsFromText,
  isMisroutedWorkforceInBenefitField,
  type ExtractedWorkforceEntry,
} from "@/lib/repository/workforce-metrics";

/** Do not collect or publish — pension subsidiary P&L, old COVID, balance-sheet liabilities, etc. */
export const EXCLUDED_BENEFIT_FIELDS = new Set<string>([
  "pension_fund_administration_business",
  "pension_fund_aum",
  "pension_fund_revenue",
  "pension_aum_growth",
  "pension_business_profitability_growth",
  "micro_pension_program",
  "retirement_account_transfer_program",
  "liability_for_defined_contribution_obligations",
  "pension_fund_management_business",
  "pension_subsidiary_operation",
  "personnel_expenses",
  "personnel_expense",
  "cash_settled_share_based_payment_liability",
  "share_based_payment_liability",
  "covid19_donation_amount_ngn",
]);

export const SOURCE_RECENCY_YEARS = 3;

/**
 * named_program fields describing scheme structure or existence (not time-sensitive amounts).
 * These bypass the hard 3-year exclusion and rely on the 24-month staleness badge instead.
 */
export const STRUCTURAL_NAMED_PROGRAM_FIELDS = new Set<string>([
  "pension_scheme_type",
  "pension_administrator_type",
  "gratuity_scheme_type",
]);

/** compliance_status and selected structural named_program fields — staleness badge only, no hard cutoff. */
export function isStructuralExistenceEntry(entry: {
  field?: string;
  value_type?: string | null;
}): boolean {
  if (entry.value_type === "compliance_status") return true;
  if (
    entry.value_type === "named_program" &&
    entry.field &&
    STRUCTURAL_NAMED_PROGRAM_FIELDS.has(entry.field)
  ) {
    return true;
  }
  return false;
}

export function isExcludedBenefitField(field: string): boolean {
  return EXCLUDED_BENEFIT_FIELDS.has(field.trim());
}

export function filterExtractedEntries(entries: ExtractedEntry[]): ExtractedEntry[] {
  return entries.filter((e) => !isExcludedBenefitField(e.field));
}

export function sanitizeBenefitEntriesForSave(entries: ExtractedEntry[]): {
  benefits: ExtractedEntry[];
  reroutedWorkforce: ExtractedWorkforceEntry[];
} {
  const benefits: ExtractedEntry[] = [];
  const reroutedWorkforce: ExtractedWorkforceEntry[] = [];

  for (const entry of filterExtractedEntries(entries)) {
    if (isMisroutedWorkforceInBenefitField(entry.field, entry.value)) {
      reroutedWorkforce.push(
        ...inferWorkforceMetricsFromText(
          entry.value ?? "",
          entry.fiscal_year_or_effective_date ?? null
        )
      );
      continue;
    }
    benefits.push(entry);
  }

  return { benefits, reroutedWorkforce };
}

export function sourcePublicationYear(source: {
  publication_date?: string | null;
  source_url?: string | null;
  source_title?: string | null;
}): number | null {
  if (source.publication_date) {
    const y = Number.parseInt(source.publication_date.slice(0, 4), 10);
    if (!Number.isNaN(y)) return y;
  }
  const haystack = `${source.source_url ?? ""} ${source.source_title ?? ""}`;
  const years = [...haystack.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  return years.length ? Math.max(...years) : null;
}

export function recencyCutoffDate(referenceDate = new Date()): Date {
  const cutoff = new Date(referenceDate);
  cutoff.setFullYear(cutoff.getFullYear() - SOURCE_RECENCY_YEARS);
  return cutoff;
}

export function recencyCutoffYear(referenceDate = new Date()): number {
  return recencyCutoffDate(referenceDate).getFullYear();
}

/** HTML / undated sources (careers, NGX profile) pass; dated PDFs must fall within the window. */
export function isSourceWithinRecencyWindow(
  source: {
    publication_date?: string | null;
    source_url?: string | null;
    source_title?: string | null;
  },
  referenceDate = new Date()
): boolean {
  if (source.publication_date) {
    const pub = new Date(source.publication_date);
    if (!Number.isNaN(pub.getTime()) && pub >= recencyCutoffDate(referenceDate)) {
      return true;
    }
    if (!Number.isNaN(pub.getTime()) && pub < recencyCutoffDate(referenceDate)) {
      return false;
    }
  }

  const year = sourcePublicationYear(source);
  if (year === null) return true;

  return year >= recencyCutoffYear(referenceDate);
}

export function isEntryWithinRecencyWindow(
  entry: {
    fiscal_year_or_effective_date?: string | null;
    field?: string;
    value_type?: string | null;
  },
  source: {
    publication_date?: string | null;
    source_url?: string | null;
    source_title?: string | null;
  },
  referenceDate = new Date()
): boolean {
  if (isStructuralExistenceEntry(entry)) return true;

  if (entry.fiscal_year_or_effective_date) {
    const y = Number.parseInt(entry.fiscal_year_or_effective_date.slice(0, 4), 10);
    if (!Number.isNaN(y) && y < recencyCutoffYear(referenceDate)) return false;
  }
  return isSourceWithinRecencyWindow(source, referenceDate);
}
