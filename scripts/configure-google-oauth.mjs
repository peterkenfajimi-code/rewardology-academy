/**
 * Enable Google OAuth on Supabase (Management API).
 *
 * Requires in .env.local:
 *   SUPABASE_ACCESS_TOKEN=...
 *   GOOGLE_CLIENT_ID=....apps.googleusercontent.com
 *   GOOGLE_CLIENT_SECRET=...
 *
 * Create credentials: https://console.cloud.google.com/apis/credentials
 * Authorized redirect URI (exact):
 *   https://fgkhowgggwbsosqhfnnz.supabase.co/auth/v1/callback
 *
 * Usage: node scripts/configure-google-oauth.mjs
 */
import {
  getProjectRoot,
  getSupabaseAccessToken,
  loadEnvLocal,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const SUPABASE_GOOGLE_CALLBACK = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/callback`;

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = getSupabaseAccessToken(root);
const clientId = process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

if (!clientId || !clientSecret) {
  console.error(`
Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local

1. Open https://console.cloud.google.com/apis/credentials
2. Create OAuth client ID → Web application
3. Authorized redirect URIs (add exactly):
   ${SUPABASE_GOOGLE_CALLBACK}
4. Copy Client ID and Client secret into .env.local:
   GOOGLE_CLIENT_ID=....apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=....
5. Re-run: npm run configure:google-oauth
`);
  process.exit(1);
}

const base = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const patchRes = await fetch(base, {
  method: "PATCH",
  headers,
  body: JSON.stringify({
    external_google_enabled: true,
    external_google_client_id: clientId,
    external_google_secret: clientSecret,
    external_google_skip_nonce_check: true,
  }),
});

const body = await patchRes.text();
if (!patchRes.ok) {
  console.error("PATCH failed:", patchRes.status, body);
  process.exit(1);
}

console.log("Google OAuth enabled on Supabase.");
console.log("  Client ID:", clientId.slice(0, 12) + "...");
console.log("  Redirect URI in Google Cloud must be:", SUPABASE_GOOGLE_CALLBACK);
console.log("\nNext:");
console.log("  1. Add NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true to .env.local and netlify.toml");
console.log("  2. Redeploy Netlify (or restart npm run dev)");
console.log("  3. Test Continue with Google on /signup or /login");
