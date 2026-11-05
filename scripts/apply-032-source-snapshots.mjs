/**
 * Apply migration 032 (source content hash + private snapshot bucket).
 * Requires REPOSITORY_SUPABASE_ACCESS_TOKEN and REPOSITORY_SUPABASE_PROJECT_REF.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
const token = process.env.REPOSITORY_SUPABASE_ACCESS_TOKEN || env.REPOSITORY_SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.REPOSITORY_SUPABASE_PROJECT_REF || env.REPOSITORY_SUPABASE_PROJECT_REF;
if (!token || !projectRef) {
  console.error("Missing REPOSITORY_SUPABASE_ACCESS_TOKEN or REPOSITORY_SUPABASE_PROJECT_REF");
  process.exit(1);
}

const query = fs.readFileSync(
  path.join(root, "supabase", "benefits-repository", "migrations", "032_source_snapshots.sql"),
  "utf8"
);
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const body = await res.text();
if (!res.ok) {
  console.error("Migration 032 failed:", res.status, body);
  process.exit(1);
}
console.log("Migration 032 applied.");
console.log(body.slice(0, 400));
