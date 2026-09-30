import { cache } from "react";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import {
  buildCompanyIndex,
  loadPublicBenefitEntries,
  type PublicBenefitEntry,
} from "@/lib/repository/load-public-entries";
import { MARKET_OPTIONS } from "@/lib/repository/market-labels";

export type RepositoryCoverage = {
  companies: number;
  /** Market labels with at least one publicly visible company, in MARKET_OPTIONS order. */
  countries: string[];
};

export function computeCoverage(entries: PublicBenefitEntry[]): RepositoryCoverage {
  const companies = buildCompanyIndex(entries);
  const codes = new Set(companies.map((c) => c.country));
  return {
    companies: companies.length,
    countries: MARKET_OPTIONS.filter((m) => codes.has(m.code)).map((m) => m.label),
  };
}

/** Single source for every public coverage figure (hero, metadata, methodology footer). */
export const loadRepositoryCoverage = cache(async (): Promise<RepositoryCoverage | null> => {
  if (!isRepositorySupabaseConfigured()) return null;
  try {
    const { entries } = await loadPublicBenefitEntries();
    return computeCoverage(entries);
  } catch {
    return null;
  }
});
