/**
 * Raise Supabase Auth email rate limit (requires custom SMTP).
 * Default after custom SMTP is ~30/hr; this sets 100/hr for launch.
 *
 * Usage: node scripts/configure-supabase-email-rate-limit.mjs [limit]
 */
import {
  getProjectRoot,
  getSupabaseAccessToken,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const DEFAULT_LIMIT = 100;
const limit = Number(process.argv[2] || DEFAULT_LIMIT);

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const token = getSupabaseAccessToken(root);
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

const base = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const getRes = await fetch(base, { headers });
if (!getRes.ok) {
  console.error("GET auth config failed:", getRes.status, await getRes.text());
  process.exit(1);
}

const before = await getRes.json();
console.log("Current rate_limit_email_sent:", before.rate_limit_email_sent ?? "unknown");

const patchRes = await fetch(base, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ rate_limit_email_sent: limit }),
});

const body = await patchRes.text();
if (!patchRes.ok) {
  console.error("PATCH failed:", patchRes.status, body);
  process.exit(1);
}

const after = JSON.parse(body);
console.log("Updated rate_limit_email_sent:", after.rate_limit_email_sent);
