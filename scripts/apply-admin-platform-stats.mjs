/**
 * Apply supabase/admin-platform-stats.sql (admin_stats_snapshot + location stats fix).
 *
 * Requires SUPABASE_ACCESS_TOKEN and ADMIN_EMAIL in .env.local.
 * Usage: node scripts/apply-admin-platform-stats.mjs
 */
import fs from "fs";
import path from "path";
import {
  applySqlAdminEmail,
  getAdminEmail,
  getProjectRoot,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const projectRef = SUPABASE_PROJECT_REF;

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
Missing SUPABASE_ACCESS_TOKEN — add to .env.local, then re-run:
  node scripts/apply-admin-platform-stats.mjs
`);
  process.exit(1);
}

const sqlPath = path.join(root, "supabase", "admin-platform-stats.sql");
const adminEmail = getAdminEmail(root, { required: true });
const query = applySqlAdminEmail(fs.readFileSync(sqlPath, "utf8"), adminEmail);

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
  console.error("Admin platform stats migration failed:", res.status, body);
  process.exit(1);
}

console.log("admin_platform_stats applied.");
console.log(body.slice(0, 500));