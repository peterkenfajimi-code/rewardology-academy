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

const getRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}`, { headers });
if (!getRes.ok) {
  console.error("Get site failed:", getRes.status, await getRes.text());
  process.exit(1);
}
const full = await getRes.json();
const mergedEnv = { ...(full.build_settings?.env || {}), ...newVars };

const patchRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({
    build_settings: {
      ...full.build_settings,
      env: mergedEnv,
    },
  }),
});

if (!patchRes.ok) {
  console.error("PATCH site env failed:", patchRes.status, await patchRes.text());
  process.exit(1);
}

console.log("Netlify env updated for", site.ssl_url || NETLIFY_SITE_URL);
for (const key of Object.keys(newVars)) console.log("  ", key);
console.log("\nNetlify → Deploys → Trigger deploy → Deploy site");
