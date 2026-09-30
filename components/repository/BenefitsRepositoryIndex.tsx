"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BenefitsRepositoryHero } from "@/components/repository/BenefitsRepositoryHero";
import { ConfidenceMixBar } from "@/components/repository/ConfidenceMixBar";
import { EmptyState } from "@/components/repository/EmptyState";
import { FilterChipBar, type ActiveFilter } from "@/components/repository/FilterChipBar";
import { SOURCE_RECENCY_YEARS } from "@/lib/repository/collection-policy";
import type { CompanyIndexRow } from "@/lib/repository/load-public-entries";
import { marketLabel } from "@/lib/repository/market-labels";
import "@/styles/benefits-repository.css";

type IndexResponse = {
  error?: string;
  configured?: boolean;
  companies?: CompanyIndexRow[];
  industries?: string[];
  stats?: {
    published_total: number;
    published_visible: number;
    excluded_by_recency: number;
    companies_total: number;
    companies_visible: number;
  };
};

function filterDescription(filters: ActiveFilter[]): string {
  const parts = filters.map((f) => f.label);
  return parts.length ? parts.join(" · ") : "your filters";
}

export function BenefitsRepositoryIndex({ marketCount }: { marketCount: number | null }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [companies, setCompanies] = useState<CompanyIndexRow[]>([]);
  const [stats, setStats] = useState<IndexResponse["stats"]>(undefined);
  const [industries, setIndustries] = useState<string[]>([]);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    for (const f of filters) params.set(f.key, f.value);
    if (q.trim()) params.set("q", q.trim());

    let cancelled = false;
    setLoading(true);
    fetch(`/api/benefits-repository?${params.toString()}`)
      .then(async (r) => {
        const data = (await r.json()) as IndexResponse;
        if (!r.ok || data.error) throw new Error(data.error ?? `HTTP ${r.status}`);
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setConfigured(Boolean(data.configured));
        setCompanies(data.companies ?? []);
        setStats(data.stats ?? undefined);
        if (data.industries) setIndustries(data.industries);
        setLoadFailed(false);
        setHasLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, q, reloadKey]);

  const totalCompanies = stats?.companies_total ?? companies.length;
  const showCount = hasLoaded && !loadFailed;

  return (
    <div className="benefits-repo">
      <BenefitsRepositoryHero marketCount={marketCount} />

      {configured === false ? (
        <div className="benefits-repo-notice">
          The repository database is not configured on this deployment yet. Internal collection continues
          via <code>/repository-admin</code>.
        </div>
      ) : null}

      <FilterChipBar
        filters={filters}
        onChange={setFilters}
        industries={industries}
        matchCount={showCount ? companies.length : null}
        totalCount={totalCompanies}
      />

      <label className="benefits-repo-search benefits-repo-search-standalone">
        <span>
          Search companies or benefits{" "}
          <kbd className="benefits-repo-kbd">Ctrl / ⌘ K</kbd>
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Company, benefit, field…"
        />
      </label>

      {loading && companies.length > 0 ? (
        <p className="benefits-repo-muted benefits-repo-loading-hint">Updating…</p>
      ) : null}

      {!loading && loadFailed ? (
        <EmptyState
          heading="Couldn't load the repository"
          body="The directory didn't load — this is a connection problem, not missing data. A VPN, corporate network, or ad blocker can block it. Try refreshing, or open the page on another network."
          ctaLabel="Try again"
          onCta={() => setReloadKey((k) => k + 1)}
        />
      ) : !loading && companies.length === 0 ? (
        <EmptyState
          heading={
            filters.length
              ? `No verified data yet for ${filterDescription(filters)}`
              : "No published companies yet"
          }
          body={
            filters.length
              ? "This reflects a real coverage gap in the repository — not a loading error. Try removing a filter or check back as more companies are reviewed and published."
              : "Published company profiles appear here after internal review. Data collection continues via the admin tool."
          }
          ctaLabel={filters.length ? "Clear all filters" : undefined}
          onCta={filters.length ? () => setFilters([]) : undefined}
        />
      ) : loading ? (
        <p className="benefits-repo-muted">Loading…</p>
      ) : (
        <>
          {stats ? (
            <p className="benefits-repo-muted benefits-repo-stats-line">
              {stats.published_visible} published {stats.published_visible === 1 ? "entry" : "entries"}
              {stats.excluded_by_recency > 0
                ? ` · ${stats.excluded_by_recency} outside ${SOURCE_RECENCY_YEARS}-year window`
                : ""}
            </p>
          ) : null}

          <div className="benefits-repo-index-wrap">
            <table className="benefits-repo-index">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Country</th>
                  <th>Industry</th>
                  <th>Fields</th>
                  <th>Confidence mix</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.company_id} className="benefits-repo-index-row">
                    <td>
                      <Link href={`/benefits-repository/${company.slug}`} className="benefits-repo-index-link">
                        <span className="benefits-repo-index-name">{company.name}</span>
                        <span className="benefits-repo-index-meta">View profile →</span>
                      </Link>
                    </td>
                    <td>{marketLabel(company.country)}</td>
                    <td>{company.industry ?? "—"}</td>
                    <td>
                      <span className="benefits-repo-mono">{company.field_count}</span>
                    </td>
                    <td>
                      <ConfidenceMixBar mix={company.confidence_mix} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
