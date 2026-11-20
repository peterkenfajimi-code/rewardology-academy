/**
 * Apply supabase/csp-violations-detail.sql to the Academy project.
 * Usage: node scripts/apply-csp-violations-detail.mjs
 */
import fs from "fs";
import path from "path";
import {
  getProjectRoot,
  getSupabaseAccessToken,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const token = getSupabaseAccessToken(root);
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

async function runSql(label, query) {
  console.log(`\n--- ${label} ---`);
  console.log(query.trim().slice(0, 1200));
  const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`FAILED ${res.status}:`, body.slice(0, 1200));
    throw new Error(`${label} failed`);
  }
  console.log("OK", body.slice(0, 500));
  return body;
}

const sql = fs.readFileSync(path.join(root, "supabase", "csp-violations-detail.sql"), "utf8");
await runSql("csp-violations-detail.sql (full file)", sql);

await runSql(
  "Confirm csp_violations grants",
  `
  select grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'csp_violations'
    and grantee in ('anon', 'authenticated', 'service_role')
  group by grantee
  order by grantee;
  `
);

await runSql(
  "Confirm RLS",
  `select c.relname, c.relrowsecurity
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'csp_violations';`
);
