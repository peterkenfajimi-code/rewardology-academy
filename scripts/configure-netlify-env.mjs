/**
 * Set Netlify site environment variables via API.
 *
 * Requires in .env.local:
 *   NETLIFY_AUTH_TOKEN=...  https://app.netlify.com/user/applications#personal-access-tokens
 *
 * Usage: node scripts/configure-netlify-env.mjs
 */
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const NETLIFY_SITE_SLUG = "effulgent-cajeta-57593b";
const NETLIFY_SITE_URL = "https://effulgent-cajeta-57593b.netlify.app";
const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = process.env.NETLIFY_AUTH_TOKEN || env.NETLIFY_AUTH_TOKEN;

if (!token) {
  console.error(`
Missing NETLIFY_AUTH_TOKEN in .env.local

1. https://app.netlify.com/user/applications#personal-access-tokens → New token
2. Add: NETLIFY_AUTH_TOKEN=nfp_...
3. Re-run: node scripts/configure-netlify-env.mjs
`);
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const newVars = {
  NEXT_PUBLIC_SITE_URL: NETLIFY_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
  NEXT_PUBLIC_SANITY_DATASET: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  NEXT_PUBLIC_SANITY_API_VERSION: env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01",
};
if (env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  newVars.NEXT_PUBLIC_SANITY_PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
}
if (env.ELEVENLABS_API_KEY) newVars.ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY;
if (env.ELEVENLABS_VOICE_ID) newVars.ELEVENLABS_VOICE_ID = env.ELEVENLABS_VOICE_ID;
if (env.NEWSDATA_API_KEY) newVars.NEWSDATA_API_KEY = env.NEWSDATA_API_KEY;
if (env.RSS2JSON_API_KEY) newVars.RSS2JSON_API_KEY = env.RSS2JSON_API_KEY;
if (env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED) {
  newVars.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED = env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED;
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const listRes = await fetch("https://api.netlify.com/api/v1/sites", { headers });
if (!listRes.ok) {
  console.error("List sites failed:", listRes.status, await listRes.text());
  process.exit(1);
}
const sites = await listRes.json();
const site = sites.find(
  (s) => s.subdomain === NETLIFY_SITE_SLUG || s.name?.includes(NETLIFY_SITE_SLUG)
);
if (!site) {
  console.error(`Site not found for slug ${NETLIFY_SITE_SLUG}. Sites:`, sites.map((s) => s.subdomain).join(", "));
  process.exit(1);
}

const accountId = site.account_id || site.account_slug;
if (!accountId) {
  console.error("Could not resolve Netlify account_id for site");
  process.exit(1);
}

const existingRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/env`, { headers });
if (!existingRes.ok) {
  console.error("List site env failed:", existingRes.status, await existingRes.text());
  process.exit(1);
}
const existingVars = await existingRes.json();
const existingKeys = new Set(existingVars.map((v) => v.key));

function envVarBody(key, value) {
  return {
    key,
    values: [{ context: "all", value }],
  };
}

for (const [key, value] of Object.entries(newVars)) {
  const body = envVarBody(key, value);
  const siteQuery = `site_id=${site.id}`;
  const url = existingKeys.has(key)
    ? `https://api.netlify.com/api/v1/accounts/${accountId}/env/${encodeURIComponent(key)}?${siteQuery}`
    : `https://api.netlify.com/api/v1/accounts/${accountId}/env?${siteQuery}`;
  const method = existingKeys.has(key) ? "PUT" : "POST";
  const payload = existingKeys.has(key) ? body : [body];

  const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    console.error(`Set ${key} failed:`, res.status, await res.text());
    process.exit(1);
  }
  console.log(existingKeys.has(key) ? "Updated" : "Created", key);
}

console.log("\nNetlify env updated for", site.ssl_url || NETLIFY_SITE_URL);

const buildRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/builds`, {
  method: "POST",
  headers,
  body: JSON.stringify({}),
});
if (buildRes.ok) {
  const build = await buildRes.json();
  console.log("Production deploy triggered:", build.deploy_url || build.id);
} else {
  console.log("Trigger deploy manually: Netlify → Deploys → Deploy site");
  console.error("Build trigger failed:", buildRes.status, await buildRes.text());
}
