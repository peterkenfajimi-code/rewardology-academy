/**
 * Apply supabase/comics-progress.sql to the linked remote project.
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.local (never commit).
 * Usage: node scripts/apply-comics-progress.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const projectRef = "fgkhowgggwbsosqhfnnz";

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
const token = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Open https://supabase.com/dashboard/account/tokens
2. Generate a token
3. Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_...

Then run: node scripts/apply-comics-progress.mjs
`);
  process.exit(1);
}

const sqlPath = path.join(root, "supabase", "comics-progress.sql");
const query = fs.readFileSync(sqlPath, "utf8");

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
  console.error("Comics progress migration failed:", res.status, body);
  process.exit(1);
}

console.log("Comics progress schema applied successfully.");
console.log(body.slice(0, 500));

const verify = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `select to_regclass('public.comics_progress') as table_name,
        exists (
          select 1 from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public' and p.proname = 'record_comic_issue'
        ) as has_rpc;`,
    }),
  }
);

const verifyBody = await verify.text();
if (!verify.ok) {
  console.error("Verification query failed:", verify.status, verifyBody);
  process.exit(1);
}

console.log("Verification:", verifyBody);
