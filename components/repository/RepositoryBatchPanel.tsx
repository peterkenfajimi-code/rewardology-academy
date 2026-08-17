"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COLLECTION_ROLLOUT_NOTES } from "@/lib/repository/exchange-config";
import type { CountryCode, DisclosureExchange, SourceType } from "@/lib/repository/types";

const SOURCE_TYPES: SourceType[] = [
  "annual_report",
  "sustainability_report",
  "careers_page",
  "press_release",
  "regulatory_filing",
  "linkedin",
  "award_recognition",
];

type BatchPreset = {
  id: string;
  label: string;
  countries: CountryCode[];
  hint: string;
};

const PRESETS: BatchPreset[] = [
  {
    id: "ng",
    label: "Nigeria (NGX + FMDQ + NASD)",
    countries: ["NG"],
    hint: COLLECTION_ROLLOUT_NOTES.NG,
  },
  {
    id: "za",
    label: "South Africa (JSE) — recommended #2",
    countries: ["ZA"],
    hint: COLLECTION_ROLLOUT_NOTES.ZA,
  },
  {
    id: "ke",
    label: "Kenya (NSE)",
    countries: ["KE"],
    hint: COLLECTION_ROLLOUT_NOTES.KE,
  },
  {
    id: "gh",
    label: "Ghana (GSE)",
    countries: ["GH"],
    hint: COLLECTION_ROLLOUT_NOTES.GH,
  },
  {
    id: "eg",
    label: "Egypt (EGX)",
    countries: ["EG"],
    hint: COLLECTION_ROLLOUT_NOTES.EG,
  },
  {
    id: "rw",
    label: "Rwanda (RSE) — lean on Guides 2/3/7",
    countries: ["RW"],
    hint: COLLECTION_ROLLOUT_NOTES.RW,
  },
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
  const [presetId, setPresetId] = useState("ng");
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

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

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
          countries: preset.countries,
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
      <h2>Disclosure automation (6 markets)</h2>
      <p className="repo-admin-muted">
        All six country modules have exchanges requiring audited annual reports. Expect solid
        IAS-19-style pension/gratuity notes almost everywhere; richer voluntary-benefit narrative
        (wellness, HMO, DEI) concentrates in JSE-listed companies and the largest names elsewhere.
        Outside JSE, only ~15% of large issuers publish sustainability reports beyond financials.
      </p>

      {!anthropicConfigured && (
        <p className="repo-admin-alert error">
          Batch extraction requires <code>ANTHROPIC_API_KEY</code>.
        </p>
      )}

      <label>
        Market preset
        <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <p className="repo-admin-muted" style={{ marginTop: "0.75rem" }}>
        {preset.hint}
      </p>

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
            placeholder="GTCO,MTN,SCOM"
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
        {loading ? "Starting…" : `Run batch — ${preset.label}`}
      </button>

      <p className="repo-admin-muted" style={{ marginTop: "0.75rem" }}>
        CLI: <code>npm run sync:disclosure-companies</code> then{" "}
        <code>npm run run:benefits-repository-batch -- --countries=ZA --max=5 --dry-run</code>
      </p>

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
