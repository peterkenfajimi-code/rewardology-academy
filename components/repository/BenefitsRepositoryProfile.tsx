"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfidenceMixBar } from "@/components/repository/ConfidenceMixBar";
import { EmptyState } from "@/components/repository/EmptyState";
import { EntryCard } from "@/components/repository/EntryCard";
import { CATEGORY_ORDER, categoryLabel } from "@/lib/repository/category-labels";
import type { CompanyIndexRow, PublicBenefitEntry } from "@/lib/repository/load-public-entries";
import { marketLabel } from "@/lib/repository/market-labels";
import "@/styles/benefits-repository.css";

type ProfileResponse = {
  configured?: boolean;
  company?: CompanyIndexRow;
  entries?: PublicBenefitEntry[];
  error?: string;
};

export function BenefitsRepositoryProfile({ slug }: { slug: string }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [company, setCompany] = useState<CompanyIndexRow | null>(null);
  const [entries, setEntries] = useState<PublicBenefitEntry[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/benefits-repository/companies/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json() as Promise<ProfileResponse>;
      })
      .then((data) => {
        if (!data) return;
        setConfigured(Boolean(data.configured));
        setCompany(data.company ?? null);
        setEntries(data.entries ?? []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const byCategory = useMemo(() => {
    const map = new Map<string, PublicBenefitEntry[]>();
    for (const row of entries) {
      const bucket = map.get(row.category) ?? [];
      bucket.push(row);
      map.set(row.category, bucket);
    }
    return map;
  }, [entries]);

  if (loading) {
    return <p className="benefits-repo-muted">Loading…</p>;
  }

  if (notFound || !company) {
    return (
      <div className="benefits-repo">
        <EmptyState
          heading="Company profile not found"
          body="This company may not be published yet, or the URL may be outdated."
          ctaLabel="Back to directory"
          onCta={() => {
            window.location.assign("/benefits-repository");
          }}
        />
      </div>
    );
  }

  return (
    <div className="benefits-repo benefits-repo-profile">
      <nav className="benefits-repo-breadcrumb">
        <Link href="/benefits-repository">Directory</Link>
        <span aria-hidden> / </span>
        <span>{company.name}</span>
      </nav>

      <header className="benefits-repo-profile-head">
        <div>
          <p className="benefits-repo-eyebrow">Company profile</p>
          <h1>{company.name}</h1>
          <p className="benefits-repo-muted">
            {marketLabel(company.country)}
            {company.industry ? ` · ${company.industry}` : ""}
            {" · "}
            {company.field_count} published {company.field_count === 1 ? "field" : "fields"}
          </p>
        </div>
        <div className="benefits-repo-profile-confidence">
          <ConfidenceMixBar mix={company.confidence_mix} expanded />
          <Link href="/benefits-repository/methodology" className="benefits-repo-methodology-link">
            ⓘ How confidence is scored
          </Link>
        </div>
      </header>

      {configured === false ? (
        <div className="benefits-repo-notice">Repository database is not configured on this deployment.</div>
      ) : null}

      {CATEGORY_ORDER.map((category) => {
        const rows = byCategory.get(category) ?? [];
        return (
          <section key={category} className="benefits-repo-category-section">
            <h2 className="benefits-repo-section-label">{categoryLabel(category)}</h2>
            {rows.length === 0 ? (
              <EmptyState
                heading={`No verified ${categoryLabel(category)} data yet for ${company.name}`}
                body="This category has no published entries for this company yet. That may reflect limited disclosure in available sources, not a system error."
              />
            ) : (
              <div className="benefits-repo-grid">
                {rows.map((row, index) => (
                  <EntryCard key={row.entry_id} row={row} index={index} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
