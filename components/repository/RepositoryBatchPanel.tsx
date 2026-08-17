"use client";

import { useCallback, useEffect, useState } from "react";
import type { SourceType } from "@/lib/repository/types";

const SOURCE_TYPES: SourceType[] = [
  "annual_report",
  "sustainability_report",
  "careers_page",
  "press_release",
  "regulatory_filing",
  "linkedin",
  "award_recognition",
];

type BatchRun = {
  run_id: string;
  status: string;
  config: Record<string, unknown>;
  progress: {
    companiesTotal?: number;
    companiesDone?: number;
    sourcesProcessed?: number;
    sourcesSkipped?: number;
    entriesSaved?: number;
    errors?: number;
    currentCompany?: string;
    currentSource?: string;
  };
  log?: string;
  started_at?: string;
  finished_at?: string;
};

type Props = {
  anthropicConfigured: boolean;
};

export function RepositoryBatchPanel({ anthropicConfigured }: Props) {
  const [maxCompanies, setMaxCompanies] = useState(5);
  const [tickers, setTickers] = useState("");
  const [publish, setPublish] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [run, setRun] = useState<BatchRun | null>(null);
  const [recentRuns, setRecentRuns] = useState<BatchRun[]>([]);

  const loadRuns = useCallback(async () => {
    const res = await fetch("/api/repository-admin/batch");
    const data = (await res.json()) as { runs?: BatchRun[] };
    if (res.ok) setRecentRuns(data.runs ?? []);
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    if (!activeRunId) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/repository-admin/batch?runId=${encodeURIComponent(activeRunId)}`);
      const data = (await res.json()) as { run?: BatchRun };
      if (res.ok && data.run) {
        setRun(data.run);
        if (data.run.status !== "running") {
          setActiveRunId(null);
          loadRuns();
        }
      }
    }, 4000);
    return () => clearInterval(id);
  }, [activeRunId, loadRuns]);

  async function startBatch() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/repository-admin/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxCompanies: maxCompanies > 0 ? maxCompanies : undefined,
          tickers: tickers
            .split(",")
            .map((t) => t.trim().toUpperCase())
            .filter(Boolean),
          sourceTypes: SOURCE_TYPES,
          publish,
          dryRun,
          skipExistingSources: true,
          delayMs: 3000,
          actor: "repository-admin-ui",
        }),
      });
      const data = (await res.json()) as { runId?: string; message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not start batch");
      setActiveRunId(data.runId ?? null);
      setMessage(data.message ?? "Batch started.");
      if (data.runId) {
        const statusRes = await fetch(
          `/api/repository-admin/batch?runId=${encodeURIComponent(data.runId)}`
        );
        const statusData = (await statusRes.json()) as { run?: BatchRun };
        if (statusRes.ok && statusData.run) setRun(statusData.run);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch start failed");
    } finally {
      setLoading(false);
    }
  }

  const progress = run?.progress;

  return (
    <section className="repo-admin-card">
      <h2>NGX batch automation</h2>
      <p className="repo-admin-muted">
        Discovers annual reports, sustainability reports, careers pages, press releases, NGX
        filings, LinkedIn, and award pages for NGX-listed companies. Skips URLs already saved;
        reconciliation compares and updates entries when a newer or higher-trust source differs.
        For full market runs, use{" "}
        <code>npm run run:benefits-repository-batch</code> locally.
      </p>

      {!anthropicConfigured && (
        <p className="repo-admin-alert error">
          Batch extraction requires <code>ANTHROPIC_API_KEY</code>.
        </p>
      )}

      <div className="repo-admin-grid">
        <label>
          Max companies (0 = all in seed/cache)
          <input
            type="number"
            min={0}
            value={maxCompanies}
            onChange={(e) => setMaxCompanies(Number(e.target.value) || 0)}
          />
        </label>
        <label>
          Tickers only (optional, comma-separated)
          <input
            placeholder="GTCO,DANGCEM,MTNN"
            value={tickers}
            onChange={(e) => setTickers(e.target.value)}
          />
        </label>
      </div>

      <label className="repo-admin-check">
        <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
        Dry run (discover sources only — no AI extract or save)
      </label>
      <label className="repo-admin-check">
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        Publish immediately (otherwise pending verification)
      </label>

      <button
        type="button"
        className="repo-admin-btn repo-admin-btn-primary"
        disabled={loading || !anthropicConfigured}
        onClick={startBatch}
      >
        {loading ? "Starting…" : "Run NGX batch"}
      </button>

      {progress && (
        <div className="repo-admin-muted" style={{ marginTop: "1rem" }}>
          <p>
            Status: <strong>{run?.status}</strong>
            {progress.currentCompany ? ` · ${progress.currentCompany}` : ""}
          </p>
          <p>
            Companies {progress.companiesDone ?? 0}/{progress.companiesTotal ?? 0} · Sources{" "}
            {progress.sourcesProcessed ?? 0} (skipped {progress.sourcesSkipped ?? 0}) · Entries{" "}
            {progress.entriesSaved ?? 0} · Errors {progress.errors ?? 0}
          </p>
          {progress.currentSource && <p>Current: {progress.currentSource}</p>}
        </div>
      )}

      {run?.log && (
        <pre className="repo-admin-textarea" style={{ marginTop: "1rem", maxHeight: 240, overflow: "auto" }}>
          {run.log.slice(-8000)}
        </pre>
      )}

      {recentRuns.length > 0 && (
        <>
          <h3>Recent runs</h3>
          <div className="repo-admin-table-wrap">
            <table className="repo-admin-table">
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Status</th>
                  <th>Companies</th>
                  <th>Entries</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((r) => (
                  <tr key={r.run_id}>
                    <td>{r.started_at ? new Date(r.started_at).toLocaleString() : "—"}</td>
                    <td>{r.status}</td>
                    <td>
                      {r.progress?.companiesDone ?? 0}/{r.progress?.companiesTotal ?? 0}
                    </td>
                    <td>{r.progress?.entriesSaved ?? 0}</td>
                    <td>{r.progress?.errors ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(message || error) && (
        <p className={error ? "repo-admin-alert error" : "repo-admin-alert"} style={{ marginTop: "1rem" }}>
          {error || message}
        </p>
      )}
    </section>
  );
}
