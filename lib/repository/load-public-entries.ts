import {
  isEntryWithinRecencyWindow,
  isExcludedBenefitField,
} from "@/lib/repository/collection-policy";
import { resolveCompanySlug } from "@/lib/repository/company-slug";
import { computeConfidenceMix } from "@/lib/repository/confidence-mix";
import { indexRegistry, loadFieldRegistry, renderDisplayText } from "@/lib/repository/field-registry";
import { createRepositoryReadClient } from "@/lib/supabase/repository/admin";

type CompanyJoin = {
  name: string;
  country?: string;
  industry?: string | null;
  company_id?: string;
  slug?: string | null;
};

type SourceJoin = {
  publication_date?: string | null;
  source_url?: string | null;
  source_title?: string | null;
  source_type?: string;
};

function joinedOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export type PublicBenefitEntry = {
  entry_id: string;
  category: string;
  field: string;
  field_label: string | null;
  display_text: string;
  value: string | null;
  value_type: string | null;
  confidence_score: string;
  confidence_was_clamped?: boolean;
  effective_date: string | null;
  fiscal_year_or_effective_date: string | null;
  company_id: string;
  companies: {
    company_id: string;
    name: string;
    country: string;
    industry: string | null;
    slug: string;
  };
  sources: {
    source_type: string;
    source_title: string | null;
    source_url: string | null;
    publication_date: string | null;
  };
};

export type CompanyIndexRow = {
  company_id: string;
  name: string;
  country: string;
  industry: string | null;
  slug: string;
  field_count: number;
  confidence_mix: ReturnType<typeof computeConfidenceMix>;
  categories: string[];
};

export type PublicRepositoryStats = {
  published_visible: number;
  published_total: number;
  excluded_by_recency: number;
  company_count: number;
};

export async function loadPublicBenefitEntries(): Promise<{
  configured: boolean;
  entries: PublicBenefitEntry[];
  stats: PublicRepositoryStats;
}> {
  const supabase = createRepositoryReadClient();
  if (!supabase) {
    return {
      configured: false,
      entries: [],
      stats: { published_visible: 0, published_total: 0, excluded_by_recency: 0, company_count: 0 },
    };
  }

  const registryRows = await loadFieldRegistry(supabase).catch(() => []);
  const registryByKey = indexRegistry(registryRows);

  const { data, error } = await supabase
    .from("benefit_entries")
    .select(
      `
      entry_id, category, field, value, value_type, confidence_score, confidence_was_clamped,
      fiscal_year_or_effective_date, effective_date, company_id,
      companies!inner ( company_id, name, country, industry, slug ),
      sources!inner ( source_type, source_title, source_url, publication_date )
    `
    )
    .eq("publish_status", "published")
    .order("date_collected", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  const allRows = data ?? [];
  let excludedByRecency = 0;

  const entries = allRows.flatMap((row) => {
    if (isExcludedBenefitField(row.field)) return [];

    const companyRaw = joinedOne(row.companies as CompanyJoin | CompanyJoin[] | null);
    const sourceRaw = joinedOne(row.sources as SourceJoin | SourceJoin[] | null);
    if (!companyRaw || !sourceRaw) return [];

    const inWindow = isEntryWithinRecencyWindow(
      {
        fiscal_year_or_effective_date: row.fiscal_year_or_effective_date,
        field: row.field,
        value_type: row.value_type,
      },
      sourceRaw
    );
    if (!inWindow) {
      excludedByRecency += 1;
      return [];
    }

    const slug = resolveCompanySlug(
      companyRaw.slug,
      companyRaw.name,
      companyRaw.country ?? ""
    );
    const registry = registryByKey.get(`${row.category}::${row.field}`);
    const displayText = renderDisplayText(
      registry?.display_template,
      companyRaw.name,
      row.value,
      registry?.field_label
    );

    return [
      {
        entry_id: row.entry_id,
        category: row.category,
        field: row.field,
        field_label: registry?.field_label ?? null,
        display_text: displayText,
        value: row.value,
        value_type: row.value_type,
        confidence_score: row.confidence_score,
        confidence_was_clamped: row.confidence_was_clamped,
        effective_date: row.effective_date,
        fiscal_year_or_effective_date: row.fiscal_year_or_effective_date,
        company_id: row.company_id,
        companies: {
          company_id: companyRaw.company_id ?? row.company_id,
          name: companyRaw.name,
          country: companyRaw.country ?? "",
          industry: companyRaw.industry ?? null,
          slug,
        },
        sources: {
          source_type: sourceRaw.source_type ?? "",
          source_title: sourceRaw.source_title ?? null,
          source_url: sourceRaw.source_url ?? null,
          publication_date: sourceRaw.publication_date ?? null,
        },
      } satisfies PublicBenefitEntry,
    ];
  });

  const publishedTotal = allRows.filter((row) => !isExcludedBenefitField(row.field)).length;
  const companyIds = new Set(entries.map((e) => e.company_id));

  return {
    configured: true,
    entries,
    stats: {
      published_visible: entries.length,
      published_total: publishedTotal,
      excluded_by_recency: excludedByRecency,
      company_count: companyIds.size,
    },
  };
}

export function buildCompanyIndex(entries: PublicBenefitEntry[]): CompanyIndexRow[] {
  const map = new Map<string, CompanyIndexRow & { scores: string[]; categorySet: Set<string> }>();

  for (const row of entries) {
    const key = row.company_id;
    const bucket =
      map.get(key) ??
      {
        company_id: row.company_id,
        name: row.companies.name,
        country: row.companies.country,
        industry: row.companies.industry,
        slug: row.companies.slug,
        field_count: 0,
        confidence_mix: computeConfidenceMix([]),
        categories: [],
        scores: [],
        categorySet: new Set<string>(),
      };

    bucket.field_count += 1;
    bucket.scores.push(row.confidence_score);
    bucket.categorySet.add(row.category);
    map.set(key, bucket);
  }

  return Array.from(map.values())
    .map(({ scores, categorySet, ...rest }) => ({
      ...rest,
      confidence_mix: computeConfidenceMix(scores),
      categories: Array.from(categorySet),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findCompanyBySlug(
  entries: PublicBenefitEntry[],
  slug: string
): { company: CompanyIndexRow; entries: PublicBenefitEntry[] } | null {
  const normalized = slug.trim().toLowerCase();
  const companyEntries = entries.filter((e) => e.companies.slug.toLowerCase() === normalized);
  if (companyEntries.length === 0) return null;

  const first = companyEntries[0].companies;
  return {
    company: {
      company_id: first.company_id,
      name: first.name,
      country: first.country,
      industry: first.industry,
      slug: first.slug,
      field_count: companyEntries.length,
      confidence_mix: computeConfidenceMix(companyEntries.map((e) => e.confidence_score)),
      categories: Array.from(new Set(companyEntries.map((e) => e.category))),
    },
    entries: companyEntries,
  };
}
