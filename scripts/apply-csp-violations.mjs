/**
 * Apply supabase/csp-violations.sql to the Academy project.
 * Requires SUPABASE_ACCESS_TOKEN in .env.local (never commit).
 * Usage: node scripts/apply-csp-violations.mjs
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

const query = fs.readFileSync(path.join(root, "supabase", "csp-violations.sql"), "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const body = await res.text();
if (!res.ok) {
  console.error("CSP violations migration failed:", res.status, body);
  process.exit(1);
}
console.log("CSP violation summaries applied.");
console.log(body.slice(0, 400));
