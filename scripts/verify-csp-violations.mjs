/**
 * Verify Academy csp_violations: anon cannot SELECT; RPC de-dups; no IP column.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  getProjectRoot,
  getSupabaseAccessToken,
  loadEnvLocal,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = getSupabaseAccessToken(root);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!token || !url || !anonKey) {
  console.error("Missing Academy Supabase env");
  process.exit(1);
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

const cols = await runSql(`
  select column_name, data_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'csp_violations'
  order by ordinal_position;
`);
const ipCols = cols.filter((c) => /ip|addr|client/i.test(c.column_name));
console.log("columns", cols);
console.log("ipColumns", ipCols);

const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: leaked, error: leakErr } = await anon.from("csp_violations").select("id").limit(1);
console.log("anon select", { leaked, error: leakErr?.message ?? null, code: leakErr?.code ?? null });

const marker = `verify-dup-${Date.now()}`;
const { error: r1 } = await anon.rpc("record_csp_violation_row", {
  p_directive: marker,
  p_blocked_uri: "https://example.test/a.js",
  p_document_uri: "https://rewardologyacademy.com/verify",
  p_user_agent: "verify-script",
});
const { error: r2 } = await anon.rpc("record_csp_violation_row", {
  p_directive: marker,
  p_blocked_uri: "https://example.test/a.js",
  p_document_uri: "https://rewardologyacademy.com/verify",
  p_user_agent: "verify-script",
});
console.log("rpc errors", r1?.message ?? null, r2?.message ?? null);

const rows = await runSql(`
  select directive, blocked_uri, document_uri, hit_count, user_agent
  from public.csp_violations
  where directive = '${marker.replace(/'/g, "''")}'
`);
console.log("dedup rows", rows);

await runSql(`delete from public.csp_violations where directive = '${marker.replace(/'/g, "''")}'`);

if (ipCols.length) throw new Error("IP column present");
if (!leakErr) throw new Error("anon can select csp_violations");
if (r1 || r2) throw new Error("record RPC failed");
if (rows.length !== 1 || rows[0].hit_count !== 2) throw new Error("de-dup failed");
console.log("CSP verify OK");
