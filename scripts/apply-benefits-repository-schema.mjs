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

const sqlPath = path.join(root, "supabase", "benefits-repository", "schema.sql");
const migrationPath = path.join(root, "supabase", "benefits-repository", "migrations", "002_sustainability_and_batch.sql");
const query = fs.readFileSync(sqlPath, "utf8");
const migration = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, "utf8") : "";

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
  console.error("Benefits repository schema failed:", res.status, body);
  process.exit(1);
}

console.log("Benefits repository schema applied successfully.");
console.log(body.slice(0, 500));

if (migration) {
  const migRes = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: migration }),
    }
  );
  const migBody = await migRes.text();
  if (!migRes.ok) {
    console.warn("Migration 002 warning (may already be applied):", migRes.status, migBody.slice(0, 300));
  } else {
    console.log("Migration 002 (sustainability + batch) applied.");
  }
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
      query: "select count(*)::int as country_modules from country_modules;",
    }),
  }
);

const verifyBody = await verify.text();
if (!verify.ok) {
  console.error("Verification query failed:", verify.status, verifyBody);
  process.exit(1);
}

console.log("Verification:", verifyBody);
