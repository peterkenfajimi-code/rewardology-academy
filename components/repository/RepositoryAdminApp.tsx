"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Company,
  CountryModule,
  ExtractedEntry,
  SourceType,
} from "@/lib/repository/types";

const SOURCE_TYPES: SourceType[] = [
  "annual_report",
  "careers_page",
  "press_release",
  "regulatory_filing",
  "linkedin",
  "award_recognition",
  "direct_confirmation",
];

const CATEGORIES = [
  "retirement",
  "health",
  "risk_insurance",
  "leave",
  "allowances",
  "development",
  "equity_variable",
  "other_voluntary",
] as const;

const VALUE_TYPES = ["quantified", "named_program", "compliance_status", "narrative"] as const;

const CONFIDENCE = ["high", "medium", "low"] as const;

type CoverageRow = {
  country: string;
  industry: string | null;
  company_size_band: string | null;
  company_count: number;
  entry_count: number;
};

type Props = {
  configured: boolean;
  anthropicConfigured: boolean;
};

export function RepositoryAdminApp({ configured, anthropicConfigured }: Props) {
  const [tab, setTab] = useState<"entry" | "coverage">("entry");
  const [countries, setCountries] = useState<CountryModule[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [newCompany, setNewCompany] = useState({
    name: "",
    country: "NG",
    industry: "",
    company_size_band: "",
    listed_status: "",
  });
  const [source, setSource] = useState({
    source_type: "annual_report" as SourceType,
    source_url: "",
    source_title: "",
    publication_date: "",
    date_accessed: new Date().toISOString().slice(0, 10),
  });
  const [rawText, setRawText] = useState("");
  const [entries, setEntries] = useState<ExtractedEntry[]>([]);
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coverage, setCoverage] = useState<{ summary: { companies: number; activeEntries: number }; rows: CoverageRow[] } | null>(null);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.company_id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId]
  );

  const loadCountries = useCallback(async () => {
    const res = await fetch("/api/repository-admin/countries");
    const data = (await res.json()) as { countries?: CountryModule[]; error?: string };
    if (res.ok) setCountries(data.countries ?? []);
  }, []);

  const loadCompanies = useCallback(async (country?: string) => {
    const qs = country ? `?country=${encodeURIComponent(country)}` : "";
    const res = await fetch(`/api/repository-admin/companies${qs}`);
    const data = (await res.json()) as { companies?: Company[]; error?: string };
    if (res.ok) setCompanies(data.companies ?? []);
  }, []);

  const loadCoverage = useCallback(async () => {
    const res = await fetch("/api/repository-admin/coverage");
    const data = (await res.json()) as {
      summary?: { companies: number; activeEntries: number };
      rows?: CoverageRow[];
      error?: string;
    };
    if (res.ok && data.summary && data.rows) {
      setCoverage({ summary: data.summary, rows: data.rows });
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    loadCountries();
    loadCompanies();
    loadCoverage();
  }, [configured, loadCountries, loadCompanies, loadCoverage]);

  async function createCompany() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/repository-admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });
      const data = (await res.json()) as { company?: Company; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create company");
      if (data.company) {
        setCompanies((prev) => [...prev, data.company!].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCompanyId(data.company.company_id);
        setMessage(`Created company: ${data.company.name}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function runExtract() {
    if (!selectedCompanyId) {
      setError("Select a company first");
      return;
    }
    const sourceUrl = source.source_url?.trim() ?? "";
    if (!rawText.trim() && !sourceUrl) {
      setError(
        "Add a Source URL in section 2 (PDF annual reports work) or paste an excerpt in the box below."
      );
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/repository-admin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          companyName: selectedCompany?.name,
          rawText: rawText.trim() || undefined,
          sourceUrl: rawText.trim() ? undefined : sourceUrl,
        }),
      });
      const data = (await res.json()) as {
        entries?: ExtractedEntry[];
        error?: string;
        detail?: string;
        sourceMode?: string;
        pageCount?: number;
      };
      if (!res.ok) throw new Error(data.error ?? data.detail ?? "Extraction failed");
      setEntries(data.entries ?? []);
      const modeNote =
        data.sourceMode === "url-pdf-text"
          ? ` (extracted benefits text from ${data.pageCount ?? "?"}-page PDF)`
          : data.sourceMode === "url-pdf"
            ? " (read from PDF URL)"
            : data.sourceMode === "url-text"
              ? " (read from web page URL)"
              : "";
      setMessage(`Extracted ${data.entries?.length ?? 0} fields${modeNote} — review before saving.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveEntries() {
    if (!selectedCompanyId) {
      setError("Select a company first");
      return;
    }
    if (!entries.length) {
      setError("No entries to save");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/repository-admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          source: { ...source, country: selectedCompany?.country ?? null },
          entries,
          publish,
        }),
      });
      const data = (await res.json()) as { results?: { action: string }[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage(`Saved ${data.results?.length ?? 0} entries with reconciliation.`);
      setEntries([]);
      setRawText("");
      await loadCoverage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/repository-admin/logout", { method: "POST" });
    window.location.href = "/repository-admin/login";
  }

  function updateEntry(index: number, patch: Partial<ExtractedEntry>) {
    setEntries((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  if (!configured) {
    return (
      <div className="repo-admin-card">
        <h1>Repository admin</h1>
        <p className="repo-admin-muted">
          Configure `NEXT_PUBLIC_REPOSITORY_SUPABASE_URL`, `REPOSITORY_SUPABASE_SERVICE_KEY`, and admin
          credentials in environment variables, then run the benefits repository schema.
        </p>
      </div>
    );
  }

  return (
    <div className="repo-admin-root">
      <header className="repo-admin-header">
        <div>
          <p className="repo-admin-eyebrow">Internal only</p>
          <h1>Africa Benefits Repository — Admin</h1>
        </div>
        <div className="repo-admin-header-actions">
          <button type="button" className="repo-admin-btn repo-admin-btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="repo-admin-tabs">
        <button
          type="button"
          className={tab === "entry" ? "repo-admin-tab active" : "repo-admin-tab"}
          onClick={() => setTab("entry")}
        >
          Entry tool
        </button>
        <button
          type="button"
          className={tab === "coverage" ? "repo-admin-tab active" : "repo-admin-tab"}
          onClick={() => setTab("coverage")}
        >
          Coverage dashboard
        </button>
      </div>

      {(message || error) && (
        <div className={error ? "repo-admin-alert error" : "repo-admin-alert"}>{error || message}</div>
      )}

      {tab === "coverage" ? (
        <section className="repo-admin-card">
          <h2>Coverage</h2>
          {coverage ? (
            <>
              <p className="repo-admin-muted">
                {coverage.summary.companies} companies · {coverage.summary.activeEntries} active entries
              </p>
              <div className="repo-admin-table-wrap">
                <table className="repo-admin-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Industry</th>
                      <th>Size band</th>
                      <th>Companies</th>
                      <th>Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.rows.map((row) => (
                      <tr key={`${row.country}-${row.industry}-${row.company_size_band}`}>
                        <td>{row.country}</td>
                        <td>{row.industry || "—"}</td>
                        <td>{row.company_size_band || "—"}</td>
                        <td>{row.company_count}</td>
                        <td>{row.entry_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="repo-admin-muted">No coverage data yet.</p>
          )}
        </section>
      ) : (
        <>
          <section className="repo-admin-card">
            <h2>1. Company</h2>
            <div className="repo-admin-grid">
              <label>
                Existing company
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                >
                  <option value="">Select…</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <h3>Create company</h3>
            <div className="repo-admin-grid">
              <label>
                Name
                <input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label>
                Country
                <select
                  value={newCompany.country}
                  onChange={(e) => setNewCompany((p) => ({ ...p, country: e.target.value }))}
                >
                  {countries.map((c) => (
                    <option key={c.country_code} value={c.country_code}>
                      {c.country_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Industry
                <input
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany((p) => ({ ...p, industry: e.target.value }))}
                />
              </label>
              <label>
                Size band
                <select
                  value={newCompany.company_size_band}
                  onChange={(e) =>
                    setNewCompany((p) => ({ ...p, company_size_band: e.target.value }))
                  }
                >
                  <option value="">—</option>
                  <option value="1-50">1-50</option>
                  <option value="51-500">51-500</option>
                  <option value="501-5000">501-5000</option>
                  <option value="5000+">5000+</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              className="repo-admin-btn"
              disabled={loading || !newCompany.name.trim()}
              onClick={createCompany}
            >
              Create company
            </button>
          </section>

          <section className="repo-admin-card">
            <h2>2. Source (required before save)</h2>
            <div className="repo-admin-grid">
              <label>
                Source type
                <select
                  value={source.source_type}
                  onChange={(e) =>
                    setSource((p) => ({ ...p, source_type: e.target.value as SourceType }))
                  }
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Source URL
                <input
                  value={source.source_url}
                  onChange={(e) => setSource((p) => ({ ...p, source_url: e.target.value }))}
                />
              </label>
              <label>
                Source title
                <input
                  value={source.source_title}
                  onChange={(e) => setSource((p) => ({ ...p, source_title: e.target.value }))}
                />
              </label>
              <label>
                Publication date
                <input
                  type="date"
                  value={source.publication_date}
                  onChange={(e) => setSource((p) => ({ ...p, publication_date: e.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className="repo-admin-card">
            <h2>3. Extract with AI</h2>
            <p className="repo-admin-muted">
              Paste a benefits excerpt below, <strong>or</strong> leave this empty and use the Source
              URL from section 2. Large annual-report PDFs (100+ pages) are scanned for pension and
              benefits sections automatically.
            </p>
            {!anthropicConfigured && (
              <p className="repo-admin-alert error">
                AI extraction needs <code>ANTHROPIC_API_KEY</code> in{" "}
                <code>.env.local</code> (local) and Netlify env vars (deploy preview). Create a
                key at{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  console.anthropic.com
                </a>
                , then restart <code>npm run dev</code>.
              </p>
            )}
            <textarea
              className="repo-admin-textarea"
              rows={10}
              placeholder="Paste annual report excerpt, careers page text, etc."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button
              type="button"
              className="repo-admin-btn"
              disabled={loading || !anthropicConfigured}
              onClick={runExtract}
            >
              {loading ? "Working…" : "Extract fields with AI"}
            </button>
          </section>

          {entries.length > 0 && (
            <section className="repo-admin-card">
              <h2>4. Review extracted fields</h2>
              <div className="repo-admin-table-wrap">
                <table className="repo-admin-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Type</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((row, index) => (
                      <tr key={`${row.field}-${index}`}>
                        <td>
                          <select
                            value={row.category}
                            onChange={(e) =>
                              updateEntry(index, {
                                category: e.target.value as ExtractedEntry["category"],
                              })
                            }
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            value={row.field}
                            onChange={(e) => updateEntry(index, { field: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            value={row.value ?? ""}
                            onChange={(e) => updateEntry(index, { value: e.target.value || null })}
                          />
                        </td>
                        <td>
                          <select
                            value={row.value_type}
                            onChange={(e) =>
                              updateEntry(index, {
                                value_type: e.target.value as ExtractedEntry["value_type"],
                              })
                            }
                          >
                            {VALUE_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={row.confidence_score}
                            onChange={(e) =>
                              updateEntry(index, {
                                confidence_score: e.target.value as ExtractedEntry["confidence_score"],
                              })
                            }
                          >
                            {CONFIDENCE.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <label className="repo-admin-check">
                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
                Publish immediately (otherwise saved as pending verification)
              </label>

              <button
                type="button"
                className="repo-admin-btn repo-admin-btn-primary"
                disabled={loading}
                onClick={saveEntries}
              >
                Save source + entries
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
