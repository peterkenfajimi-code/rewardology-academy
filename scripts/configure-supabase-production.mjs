/**
 * Set Supabase Auth Site URL + redirect allow list for rewardologyacademy.com + localhost.
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.local (never commit).
 * Usage: node scripts/configure-supabase-production.mjs
 */
import {
  getProjectRoot,
  getSupabaseAccessToken,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const token = getSupabaseAccessToken(root);

const PRODUCTION_SITE_URL = "https://rewardologyacademy.com";
const REDIRECTS = [
  `${PRODUCTION_SITE_URL}/auth/callback`,
  "https://www.rewardologyacademy.com/auth/callback",
  "http://localhost:3000/auth/callback",
];

if (!token) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN in .env.local

1. https://supabase.com/dashboard/account/tokens → create token
2. Add: SUPABASE_ACCESS_TOKEN=sbp_...
3. Re-run: node scripts/configure-supabase-production.mjs
`);
  process.exit(1);
}

const base = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const getRes = await fetch(base, { headers: { Authorization: `Bearer ${token}` } });
if (!getRes.ok) {
  console.error("GET auth config failed:", getRes.status, await getRes.text());
  process.exit(1);
}
const current = await getRes.json();

const existingList = (current.uri_allow_list || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const merged = [...new Set([...existingList, ...REDIRECTS])];

const patchRes = await fetch(base, {
  method: "PATCH",
  headers,
  body: JSON.stringify({
    site_url: PRODUCTION_SITE_URL,
    uri_allow_list: merged.join(","),
  }),
});

const body = await patchRes.text();
if (!patchRes.ok) {
  console.error("PATCH auth config failed:", patchRes.status, body);
  process.exit(1);
}

console.log("Supabase auth URLs updated.");
console.log("  site_url:", PRODUCTION_SITE_URL);
console.log("  redirect URLs:");
for (const url of merged) console.log("   -", url);
console.log("\nLocal dev sign-in still works via localhost callback in the allow list.");
