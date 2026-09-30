"use client";

import { useCallback, useEffect, useState } from "react";

type UnmappedFinding = {
  finding_id: string;
  raw_excerpt: string | null;
  suggested_category: string | null;
  suggested_field: string | null;
  ai_notes: string | null;
  created_at: string;
  companies: { name: string } | null;
  sources: { source_title: string | null; source_url: string | null; source_type: string } | null;
};

export function RepositoryUnmappedPanel() {
  const [findings, setFindings] = useState<UnmappedFinding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/repository-admin/unmapped");
      const data = (await res.json()) as { findings?: UnmappedFinding[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load unmapped findings");
      setFindings(data.findings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load unmapped findings");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markReviewed(findingId: string) {
    setBusyId(findingId);
    setError(null);
    try {
      const res = await fetch("/api/repository-admin/unmapped", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding_id: findingId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not mark reviewed");
      setFindings((prev) => prev?.filter((f) => f.finding_id !== findingId) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark reviewed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="repo-admin-card">
      <h2>Unmapped queue</h2>
      <p className="repo-admin-muted">
        Extracted facts that fit no registry field, oldest first. A recurring kind of fact here is a
        registry gap; add a field, then re-run extraction on the source.
      </p>

      {error ? <div className="repo-admin-alert error">{error}</div> : null}

      {findings === null ? (
        <p className="repo-admin-muted">Loading…</p>
      ) : findings.length === 0 ? (
        <p className="repo-admin-muted">No unreviewed findings.</p>
      ) : (
        <div className="repo-admin-table-wrap">
          <table className="repo-admin-table">
            <thead>
              <tr>
                <th>Company / source</th>
                <th>Suggested</th>
                <th>Extracted text</th>
                <th>AI notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.finding_id}>
                  <td>
                    {f.companies?.name ?? "—"}
                    <div className="repo-admin-muted">
                      {f.sources?.source_url ? (
                        <a href={f.sources.source_url} target="_blank" rel="noreferrer">
                          {f.sources.source_title || f.sources.source_type}
                        </a>
                      ) : (
                        f.sources?.source_title || f.sources?.source_type || "—"
                      )}
                    </div>
                    <div className="repo-admin-muted">{new Date(f.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    {f.suggested_category ?? "—"}
                    {f.suggested_field ? (
                      <div className="repo-admin-muted">invented key: {f.suggested_field}</div>
                    ) : null}
                  </td>
                  <td>{f.raw_excerpt || "—"}</td>
                  <td>{f.ai_notes || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="repo-admin-btn repo-admin-btn-ghost"
                      disabled={busyId === f.finding_id}
                      onClick={() => void markReviewed(f.finding_id)}
                    >
                      {busyId === f.finding_id ? "Saving…" : "Mark reviewed"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
