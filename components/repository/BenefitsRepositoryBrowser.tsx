"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/benefits-repository.css";

type PublicEntry = {
  entry_id: string;
  category: string;
  field: string;
  value: string | null;
  value_type: string | null;
  confidence_score: string;
  fiscal_year_or_effective_date: string | null;
  companies: { name: string; country: string; industry: string | null };
  sources: {
    source_type: string;
    source_title: string | null;
    source_url: string | null;
    publication_date: string | null;
  };
};

const COUNTRIES = [
  { code: "", label: "All countries" },
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
  { code: "KE", label: "Kenya" },
  { code: "ZA", label: "South Africa" },
  { code: "EG", label: "Egypt" },
  { code: "RW", label: "Rwanda" },
];

export function BenefitsRepositoryBrowser() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (industry) params.set("industry", industry);
    if (q.trim()) params.set("q", q.trim());

    setLoading(true);
    fetch(`/api/benefits-repository?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { configured?: boolean; entries?: PublicEntry[] }) => {
        setConfigured(Boolean(data.configured));
        setEntries(data.entries ?? []);
      })
      .finally(() => setLoading(false));
  }, [country, industry, q]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    for (const row of entries) {
      if (row.companies.industry) set.add(row.companies.industry);
    }
    return Array.from(set).sort();
  }, [entries]);

  return (
    <div className="benefits-repo">
      <header className="benefits-repo-hero">
        <p className="benefits-repo-eyebrow">Research pillar · Preview</p>
        <h1>Africa Benefits Repository</h1>
        <p>
          Structured employer benefits intelligence across six African markets. Published entries only —
          with confidence indicators and source citations.
        </p>
      </header>

      {configured === false && (
        <div className="benefits-repo-notice">
          The repository database is not configured on this deployment yet. Internal collection continues
          via <code>/repository-admin</code>.
        </div>
      )}

      <div className="benefits-repo-filters">
        <label>
          Country
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code || "all"} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Industry
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
        <label className="benefits-repo-search">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Company, field, benefit…"
          />
        </label>
      </div>

      {loading ? (
        <p className="benefits-repo-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="benefits-repo-muted">
          No published entries yet. Data appears here after internal review and publish.
        </p>
      ) : (
        <div className="benefits-repo-grid">
          {entries.map((row) => (
            <article key={row.entry_id} className="benefits-repo-card">
              <div className="benefits-repo-card-top">
                <strong>{row.companies.name}</strong>
                <span>{row.companies.country}</span>
              </div>
              <p className="benefits-repo-field">
                {row.category} · <code>{row.field}</code>
              </p>
              <p className="benefits-repo-value">{row.value || "—"}</p>
              <p className="benefits-repo-meta">
                Confidence: {row.confidence_score}
                {row.fiscal_year_or_effective_date
                  ? ` · ${row.fiscal_year_or_effective_date}`
                  : ""}
              </p>
              <p className="benefits-repo-source">
                Source: {row.sources.source_type}
                {row.sources.source_title ? ` — ${row.sources.source_title}` : ""}
                {row.sources.source_url ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={row.sources.source_url} target="_blank" rel="noopener noreferrer">
                      link
                    </a>
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
