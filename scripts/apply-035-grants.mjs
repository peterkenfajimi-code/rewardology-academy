/**
 * Export current repository GRANTs, write a rollback, apply 035, verify anon
 * cannot read internals, then run the throwaway REST probe and drop it.
 * Usage: node scripts/apply-035-grants.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backupDir = path.join(root, "supabase", "benefits-repository", "grants-backup-2026-11-19");
const EIGHT = [
  "country_modules",
  "companies",
  "sources",
  "benefit_entries",
  "benefit_field_registry",
  "workforce_composition_entries",
  "verification_log",
  "batch_runs",
];

function loadEnvLocal() {
  const env = {};
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnvLocal();
const token = process.env.REPOSITORY_SUPABASE_ACCESS_TOKEN || env.REPOSITORY_SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.REPOSITORY_SUPABASE_PROJECT_REF || env.REPOSITORY_SUPABASE_PROJECT_REF;
const restUrl = (process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL || env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL || "").replace(
  /\/$/,
  ""
);
const anonKey = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY;
if (!token || !projectRef) {
  console.error("Missing REPOSITORY_SUPABASE_ACCESS_TOKEN or REPOSITORY_SUPABASE_PROJECT_REF");
  process.exit(1);
}
if (!restUrl || !anonKey) {
  console.error("Missing NEXT_PUBLIC_REPOSITORY_SUPABASE_URL or NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY");
  process.exit(1);
}

async function runSql(label, query) {
  console.log(`\n--- ${label} ---`);
  console.log(query.trim());
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`FAILED ${res.status}:`, body.slice(0, 1200));
    throw new Error(`${label} failed`);
  }
  let parsed = body;
  try {
    parsed = JSON.parse(body);
  } catch {
    /* raw */
  }
  console.log("OK", typeof parsed === "string" ? parsed.slice(0, 400) : JSON.stringify(parsed).slice(0, 800));
  return parsed;
}

function statementsFromSql(sql) {
  return sql
    .split(/\n/)
    .filter((line) => !/^\s*--/.test(line))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${s};`);
}

function grantLine(table, role, privs) {
  if (!privs.length) return `revoke all on table public.${table} from ${role};`;
  return `grant ${privs.join(", ").toLowerCase()} on table public.${table} to ${role};`;
}

const grantRows = await runSql(
  "Export current grants (eight tables)",
  `
  select table_name, grantee, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (${EIGHT.map((t) => `'${t}'`).join(",")})
    and grantee in ('anon', 'authenticated', 'service_role')
  order by table_name, grantee, privilege_type;
  `
);

const byTable = {};
for (const t of EIGHT) {
  byTable[t] = { anon: [], authenticated: [], service_role: [] };
}
for (const row of grantRows) {
  if (!byTable[row.table_name]) continue;
  byTable[row.table_name][row.grantee].push(row.privilege_type);
}

fs.mkdirSync(backupDir, { recursive: true });
const snapshot = { exportedAt: new Date().toISOString(), tables: byTable };
fs.writeFileSync(path.join(backupDir, "grants.json"), JSON.stringify(snapshot, null, 2));

const rollback = [
  "-- Rollback for migration 035. Restores GRANTs captured before the revoke.",
  `-- Exported ${snapshot.exportedAt}`,
  "",
];
for (const table of EIGHT) {
  for (const role of ["anon", "authenticated", "service_role"]) {
    rollback.push(grantLine(table, role, byTable[table][role]));
  }
  rollback.push("");
}
fs.writeFileSync(path.join(backupDir, "rollback-035.sql"), rollback.join("\n"));
console.log(`Wrote ${path.join(backupDir, "grants.json")}`);
console.log(`Wrote ${path.join(backupDir, "rollback-035.sql")}`);

const migration = fs.readFileSync(
  path.join(root, "supabase", "benefits-repository", "migrations", "035_revoke_pre_oct30_grants.sql"),
  "utf8"
);
for (const stmt of statementsFromSql(migration)) {
  await runSql("035", stmt);
}

const after = await runSql(
  "Grants after 035",
  `
  select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee in ('anon', 'authenticated', 'service_role')
  group by table_name, grantee
  order by table_name, grantee;
  `
);

async function restGet(table, query = "select=*&limit=5") {
  const res = await fetch(`${restUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let json = text;
  try {
    json = JSON.parse(text);
  } catch {
    /* raw */
  }
  return { status: res.status, body: json };
}

console.log("\n=== Anon REST checks ===");
const checks = [
  ["benefit_entries published", "benefit_entries", "select=entry_id,publish_status&publish_status=eq.published&limit=3"],
  ["benefit_entries pending_verification", "benefit_entries", "select=entry_id,publish_status&publish_status=eq.pending_verification&limit=5"],
  ["verification_log", "verification_log", "select=log_id&limit=1"],
  ["batch_runs", "batch_runs", "select=run_id&limit=1"],
  ["unmapped_findings", "unmapped_findings", "select=finding_id&limit=1"],
  ["company_review_schedule", "company_review_schedule", "select=company_id&limit=1"],
  ["country_modules", "country_modules", "select=country_code&limit=1"],
];
const restResults = {};
for (const [label, table, q] of checks) {
  const result = await restGet(table, q);
  restResults[label] = { status: result.status, sample: JSON.stringify(result.body).slice(0, 240) };
  console.log(label, restResults[label]);
}

const pendingBody = await restGet(
  "benefit_entries",
  "select=entry_id&publish_status=eq.pending_verification&limit=5"
);
if (pendingBody.status === 200 && Array.isArray(pendingBody.body) && pendingBody.body.length > 0) {
  throw new Error("anon can read pending_verification rows");
}
for (const internal of ["verification_log", "batch_runs", "unmapped_findings", "company_review_schedule", "country_modules"]) {
  const r = restResults[internal];
  if (r.status === 200) {
    throw new Error(`anon can read internal table ${internal}: ${r.sample}`);
  }
}
const published = restResults["benefit_entries published"];
if (published.status !== 200) {
  throw new Error(`anon cannot read published benefit_entries: ${published.sample}`);
}

await runSql(
  "Create grant_probe_035",
  `
  create table public.grant_probe_035 (
    id int primary key,
    note text not null
  );
  `
);
await runSql("Enable RLS on probe", "alter table public.grant_probe_035 enable row level security;");
await runSql(
  "Probe SELECT policy",
  `create policy "Public read grant_probe_035" on public.grant_probe_035 for select to anon, authenticated using (true);`
);
await runSql("Revoke probe from anon/auth", "revoke all on table public.grant_probe_035 from anon, authenticated;");
await runSql("Grant probe SELECT", "grant select on table public.grant_probe_035 to anon, authenticated;");
await runSql(
  "Grant probe service_role",
  "grant select, insert, update, delete on table public.grant_probe_035 to service_role;"
);
await runSql("Insert probe row", "insert into public.grant_probe_035 (id, note) values (1, 'ok');");
await runSql("Reload PostgREST schema", "notify pgrst, 'reload schema';");

let probe;
for (let i = 0; i < 8; i++) {
  await new Promise((r) => setTimeout(r, 1500));
  probe = await restGet("grant_probe_035", "select=id,note");
  console.log("probe attempt", i + 1, probe.status, JSON.stringify(probe.body).slice(0, 200));
  if (probe.status === 200 && Array.isArray(probe.body) && probe.body[0]?.note === "ok") break;
}
if (!(probe.status === 200 && Array.isArray(probe.body) && probe.body[0]?.note === "ok")) {
  await runSql("Drop probe after failed read", "drop table if exists public.grant_probe_035;");
  throw new Error("probe REST read failed");
}

await runSql("Drop grant_probe_035", "drop table if exists public.grant_probe_035;");
await runSql("Reload PostgREST after drop", "notify pgrst, 'reload schema';");

console.log(
  JSON.stringify(
    {
      backupDir,
      grantsAfter: after,
      restResults,
      probeOk: true,
    },
    null,
    2
  )
);
