/**
 * POST two identical CSP test reports, confirm de-dup, then delete the test row.
 * Usage: node scripts/csp-test-report.mjs [origin]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getProjectRoot,
  getSupabaseAccessToken,
  loadEnvLocal,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const origin = (process.argv[2] || env.NEXT_PUBLIC_SITE_URL || "https://rewardologyacademy.com").replace(/\/$/, "");
const token = getSupabaseAccessToken(root);
const marker = `cursor-test-script-src-${Date.now()}`;
const payload = {
  "csp-report": {
    "effective-directive": marker,
    "violated-directive": marker,
    "blocked-uri": "https://example.test/cursor-csp-probe.js",
    "document-uri": "https://rewardologyacademy.com/csp-probe",
  },
};

async function postOnce() {
  const res = await fetch(`${origin}/api/security/csp-report`, {
    method: "POST",
    headers: { "Content-Type": "application/csp-report", "User-Agent": "cursor-csp-probe" },
    body: JSON.stringify(payload),
  });
  return res.status;
}

async function runSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${body.slice(0, 800)}`);
  return JSON.parse(body);
}

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const s1 = await postOnce();
const s2 = await postOnce();
console.log("POST statuses", s1, s2);

const rows = await runSql(`
  select directive, blocked_uri, document_uri, hit_count, user_agent
  from public.csp_violations
  where directive = '${marker.replace(/'/g, "''")}'
`);
const cols = await runSql(`
  select column_name from information_schema.columns
  where table_schema = 'public' and table_name = 'csp_violations'
  order by ordinal_position
`);
console.log("columns", cols.map((c) => c.column_name));
console.log("rows", rows);

await runSql(`delete from public.csp_violations where directive = '${marker.replace(/'/g, "''")}'`);
await runSql(`delete from public.csp_violation_summaries where directive = '${marker.replace(/'/g, "''")}'`);
console.log("cleared test row");

if (s1 !== 204 || s2 !== 204) throw new Error("expected 204 from CSP route");
if (rows.length !== 1) throw new Error("expected one de-duped row");
if (Number(rows[0].hit_count) < 2) throw new Error("expected hit_count >= 2");
if (cols.some((c) => /ip|addr|client/i.test(c.column_name))) throw new Error("IP column present");
console.log("CSP live test OK");
