"use client";



import { useEffect, useMemo, useState } from "react";

import { CATEGORY_ORDER, categoryLabel } from "@/lib/repository/category-labels";
import { SOURCE_RECENCY_YEARS } from "@/lib/repository/collection-policy";

import { formatEffectiveDateBadge, isEntryStale } from "@/lib/repository/staleness";

import "@/styles/benefits-repository.css";



type PublicEntry = {

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



function confidenceClass(score: string): string {

  if (score === "high") return "benefits-repo-confidence benefits-repo-confidence-high";

  if (score === "medium") return "benefits-repo-confidence benefits-repo-confidence-medium";

  return "benefits-repo-confidence benefits-repo-confidence-low";

}



export function BenefitsRepositoryBrowser() {

  const [configured, setConfigured] = useState<boolean | null>(null);

  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [stats, setStats] = useState<{
    published_total: number;
    published_visible: number;
    excluded_by_recency: number;
  } | null>(null);

  const [country, setCountry] = useState("");

  const [industry, setIndustry] = useState("");

  const [category, setCategory] = useState("");

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

      .then((data: {
        configured?: boolean;
        entries?: PublicEntry[];
        stats?: { published_total: number; published_visible: number; excluded_by_recency: number };
      }) => {
        setConfigured(Boolean(data.configured));
        setEntries(data.entries ?? []);
        setStats(data.stats ?? null);
      })

      .finally(() => setLoading(false));

  }, [country, industry, q]);

  const displayedEntries = useMemo(() => {
    if (!category) return entries;
    return entries.filter((e) => e.category === category);
  }, [entries, category]);



  const industries = useMemo(() => {

    const set = new Set<string>();

    for (const row of entries) {

      if (row.companies.industry) set.add(row.companies.industry);

    }

    return Array.from(set).sort();

  }, [entries]);



  const categoriesPresent = useMemo(() => {

    const set = new Set(entries.map((e) => e.category));

    return CATEGORY_ORDER.filter((c) => set.has(c));

  }, [entries]);



  const byCompany = useMemo(() => {

    const map = new Map<

      string,

      { name: string; country: string; industry: string | null; entries: PublicEntry[] }

    >();

    for (const row of displayedEntries) {

      const key = row.companies.name;

      const bucket = map.get(key) ?? {

        name: row.companies.name,

        country: row.companies.country,

        industry: row.companies.industry,

        entries: [],

      };

      bucket.entries.push(row);

      map.set(key, bucket);

    }



    for (const bucket of map.values()) {

      bucket.entries.sort((a, b) => {

        const ai = CATEGORY_ORDER.indexOf(a.category as (typeof CATEGORY_ORDER)[number]);

        const bi = CATEGORY_ORDER.indexOf(b.category as (typeof CATEGORY_ORDER)[number]);

        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);

      });

    }



    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  }, [displayedEntries]);



  const groupedByCategory = useMemo(() => {

    const map = new Map<string, PublicEntry[]>();

    for (const row of entries) {

      const bucket = map.get(row.category) ?? [];

      bucket.push(row);

      map.set(row.category, bucket);

    }

    return map;

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

            placeholder="Company, benefit, field…"

          />

        </label>

      </div>



      {categoriesPresent.length > 0 && (

        <div className="benefits-repo-category-tabs" role="tablist" aria-label="Benefit categories">

          <button

            type="button"

            className={category === "" ? "is-active" : ""}

            onClick={() => setCategory("")}

          >

            All categories

          </button>

          {categoriesPresent.map((c) => (

            <button

              key={c}

              type="button"

              className={category === c ? "is-active" : ""}

              onClick={() => setCategory(c)}

            >

              {categoryLabel(c)} ({groupedByCategory.get(c)?.length ?? 0})

            </button>

          ))}

        </div>

      )}



      {loading ? (

        <p className="benefits-repo-muted">Loading…</p>

      ) : displayedEntries.length === 0 ? (

        <p className="benefits-repo-muted">

          No published entries yet. Data appears here after internal review and publish.

        </p>

      ) : (

        <>

          <p className="benefits-repo-muted">

            {byCompany.length} {byCompany.length === 1 ? "company" : "companies"} ·{" "}
            {displayedEntries.length} {displayedEntries.length === 1 ? "entry" : "entries"} shown
            {stats
              ? ` · ${stats.published_total} published${
                  stats.excluded_by_recency > 0
                    ? ` (${stats.excluded_by_recency} outside ${SOURCE_RECENCY_YEARS}-year window)`
                    : ""
                }`
              : ""}
            {category ? ` · filtered to ${categoryLabel(category)}` : ""}

          </p>

          <div className="benefits-repo-companies">

            {byCompany.map((company) => (

              <section key={company.name} className="benefits-repo-company">

                <header className="benefits-repo-company-head">

                  <div>

                    <h2>{company.name}</h2>

                    <p className="benefits-repo-muted">

                      {company.country}

                      {company.industry ? ` · ${company.industry}` : ""}

                      {" · "}

                      {company.entries.length} {company.entries.length === 1 ? "field" : "fields"}

                    </p>

                  </div>

                </header>

                <div className="benefits-repo-grid">

                  {company.entries.map((row) => {

                    const stale = isEntryStale(row.effective_date);

                    const dateBadge = row.effective_date

                      ? formatEffectiveDateBadge(row.effective_date)

                      : null;



                    return (

                      <article key={row.entry_id} className="benefits-repo-card">

                        <div className="benefits-repo-card-top">

                          <p className="benefits-repo-field">{categoryLabel(row.category)}</p>

                          <span className={confidenceClass(row.confidence_score)} title="Confidence">

                            {row.confidence_score}

                          </span>

                        </div>

                        <p className="benefits-repo-value">{row.display_text}</p>

                        <p className="benefits-repo-meta">

                          {dateBadge ? (

                            <span className={stale ? "benefits-repo-stale" : ""}>

                              as of {dateBadge}

                              {stale ? " · may be outdated" : ""}

                            </span>

                          ) : null}

                          {row.confidence_was_clamped ? (

                            <span className="benefits-repo-clamped"> · confidence capped per field rules</span>

                          ) : null}

                        </p>

                        <p className="benefits-repo-source">

                          Source: {row.sources.source_type.replace(/_/g, " ")}

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

                    );

                  })}

                </div>

              </section>

            ))}

          </div>

        </>

      )}

    </div>

  );

}

