"use client";

import { useCallback, useEffect, useState } from "react";
import type { DisclosureExchange, SourceType } from "@/lib/repository/types";

const SOURCE_TYPES: SourceType[] = [
  "annual_report",
  "sustainability_report",
  "careers_page",
  "press_release",
  "regulatory_filing",
  "linkedin",
  "award_recognition",
];

const EXCHANGES: DisclosureExchange[] = ["NGX", "FMDQ", "NASD"];

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
  const [exchanges, setExchanges] = useState<DisclosureExchange[]>(["NGX", "FMDQ", "NASD"]);
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

  function toggleExchange(exchange: DisclosureExchange) {
    setExchanges((prev) =>
      prev.includes(exchange) ? prev.filter((e) => e !== exchange) : [...prev, exchange]
    );
  }

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
          exchanges: exchanges.length ? exchanges : ["NGX", "FMDQ", "NASD"],
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
      <h2>Nigeria disclosure automation</h2>
      <p className="repo-admin-muted">
        Collects benefits data from companies with audited disclosure obligations across{" "}
        <strong>NGX</strong> (listed equity), <strong>FMDQ</strong> (listed/quoted debt and
        commercial paper — often private issuers), and <strong>NASD</strong> (OTC equity, NASD Blue
        tier). Commodity exchanges (NCX, AFEX) are excluded. Skips URLs already saved;
        reconciliation compares and updates when a newer or higher-trust source differs.
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
            placeholder="GTCO,SDFCWAMCO,MTNN"
            value={tickers}
            onChange={(e) => setTickers(e.target.value)}
          />
        </label>
      </div>

      <fieldset className="repo-admin-check-group" style={{ marginBottom: "1rem" }}>
        <legend>Disclosure venues</legend>
        {EXCHANGES.map((exchange) => (
          <label key={exchange} className="repo-admin-check">
            <input
              type="checkbox"
              checked={exchanges.includes(exchange)}
              onChange={() => toggleExchange(exchange)}
            />
            {exchange}
            {exchange === "FMDQ" && " — debt/CP issuers"}
            {exchange === "NASD" && " — OTC equity (Blue tier seed)"}
          </label>
        ))}
      </fieldset>

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
        disabled={loading || !anthropicConfigured || exchanges.length === 0}
        onClick={startBatch}
      >
        {loading ? "Starting…" : "Run disclosure batch"}
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
