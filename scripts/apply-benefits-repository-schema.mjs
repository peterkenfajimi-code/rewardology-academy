/**
 * Apply supabase/benefits-repository/schema.sql to the separate repository project.
 *
 * Requires REPOSITORY_SUPABASE_ACCESS_TOKEN and REPOSITORY_SUPABASE_PROJECT_REF in .env.local
 * Usage: node scripts/apply-benefits-repository-schema.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnvLocal();
const token =
  process.env.REPOSITORY_SUPABASE_ACCESS_TOKEN || env.REPOSITORY_SUPABASE_ACCESS_TOKEN;
const projectRef =
  process.env.REPOSITORY_SUPABASE_PROJECT_REF || env.REPOSITORY_SUPABASE_PROJECT_REF;

if (!token || !projectRef) {
  console.error(`
Missing REPOSITORY_SUPABASE_ACCESS_TOKEN or REPOSITORY_SUPABASE_PROJECT_REF.

1. Create a NEW Supabase project for the Africa Benefits Repository (not Academy prod)
2. Add to .env.local:
   REPOSITORY_SUPABASE_PROJECT_REF=your_project_ref
   REPOSITORY_SUPABASE_ACCESS_TOKEN=sbp_...

Then run: npm run apply:benefits-repository
`);
  process.exit(1);
}

async function runQuery(label, query, { warnOnFail = false } = {}) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  const body = await res.text();
  if (!res.ok) {
    if (warnOnFail) {
      console.warn(`${label} warning (may already be applied):`, res.status, body.slice(0, 300));
      return false;
    }
    console.error(`${label} failed:`, res.status, body);
    process.exit(1);
  }
  console.log(`${label} applied.`);
  return true;
}

const sqlPath = path.join(root, "supabase", "benefits-repository", "schema.sql");
const migrationPath = path.join(root, "supabase", "benefits-repository", "migrations", "002_sustainability_and_batch.sql");
const migration003Path = path.join(root, "supabase", "benefits-repository", "migrations", "003_fmdq_nasd_disclosure_exchanges.sql");
const migration004Path = path.join(root, "supabase", "benefits-repository", "migrations", "004_multi_market_exchanges.sql");
const migration005Path = path.join(root, "supabase", "benefits-repository", "migrations", "005_enable_rls.sql");
const migration006Path = path.join(root, "supabase", "benefits-repository", "migrations", "006_field_registry.sql");
const migration007Path = path.join(root, "supabase", "benefits-repository", "migrations", "007_field_display_templates.sql");
const migration008Path = path.join(root, "supabase", "benefits-repository", "migrations", "008_schema_patch_2.sql");
const migration009Path = path.join(root, "supabase", "benefits-repository", "migrations", "009_rls_field_registry.sql");
const migration010Path = path.join(root, "supabase", "benefits-repository", "migrations", "010_company_slug.sql");
const query = fs.readFileSync(sqlPath, "utf8");
const migration = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, "utf8") : "";
const migration003 = fs.existsSync(migration003Path) ? fs.readFileSync(migration003Path, "utf8") : "";
const migration004 = fs.existsSync(migration004Path) ? fs.readFileSync(migration004Path, "utf8") : "";
const migration005 = fs.existsSync(migration005Path) ? fs.readFileSync(migration005Path, "utf8") : "";
const migration006 = fs.existsSync(migration006Path) ? fs.readFileSync(migration006Path, "utf8") : "";
const migration007 = fs.existsSync(migration007Path) ? fs.readFileSync(migration007Path, "utf8") : "";
const migration008 = fs.existsSync(migration008Path) ? fs.readFileSync(migration008Path, "utf8") : "";
const migration009 = fs.existsSync(migration009Path) ? fs.readFileSync(migration009Path, "utf8") : "";
const migration010 = fs.existsSync(migration010Path) ? fs.readFileSync(migration010Path, "utf8") : "";

// Migrations first — existing DBs may lack columns referenced in schema.sql inserts.
if (migration) await runQuery("Migration 002 (sustainability + batch)", migration, { warnOnFail: true });
if (migration003) {
  await runQuery("Migration 003 (FMDQ/NASD disclosure exchanges)", migration003, { warnOnFail: true });
}
if (migration004) {
  await runQuery("Migration 004 (multi-market exchanges + collection priority)", migration004, {
    warnOnFail: true,
  });
}
if (migration005) {
  await runQuery("Migration 005 (enable RLS)", migration005, { warnOnFail: true });
}

await runQuery("Benefits repository schema", query);

if (migration006) {
  await runQuery("Migration 006 (field registry)", migration006, { warnOnFail: true });
}
if (migration007) {
  await runQuery("Migration 007 (display templates)", migration007, { warnOnFail: true });
}
if (migration008) {
  await runQuery("Migration 008 (schema patch 2)", migration008, { warnOnFail: true });
}
if (migration009) {
  await runQuery("Migration 009 (RLS field registry)", migration009, { warnOnFail: true });
}
if (migration010) {
  await runQuery("Migration 010 (company slug)", migration010, { warnOnFail: true });
}

const verify = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "select country_code, listed_company_exchange, collection_priority from country_modules order by collection_priority;",
    }),
  }
);

const verifyBody = await verify.text();
if (!verify.ok) {
  console.error("Verification query failed:", verify.status, verifyBody);
  process.exit(1);
}

console.log("Verification (NG country_module):", verifyBody);
