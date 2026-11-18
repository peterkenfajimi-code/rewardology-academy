/**
 * One-shot production setup for /setup admin dashboard accuracy:
 * 1. Apply admin-platform-stats.sql (optional but recommended)
 * 2. Push SUPABASE_SERVICE_ROLE_KEY + related vars to Netlify
 * 3. Trigger a production deploy
 *
 * Requires in .env.local:
 *   NETLIFY_AUTH_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL (= NEXT_PUBLIC_ADMIN_EMAIL)
 *   SUPABASE_ACCESS_TOKEN (only for step 1 SQL apply)
 *
 * Usage: node scripts/setup-admin-stats-production.mjs
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);

function requireEnv(name) {
  const v = process.env[name] || env[name];
  if (!v?.trim()) {
    console.error(`Missing ${name} in .env.local`);
    process.exit(1);
  }
  return v.trim();
}

requireEnv("NETLIFY_AUTH_TOKEN");
requireEnv("SUPABASE_SERVICE_ROLE_KEY");
requireEnv("ADMIN_EMAIL");
requireEnv("NEXT_PUBLIC_SUPABASE_URL");
requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const hasMgmt = Boolean(process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN);
if (hasMgmt) {
  console.log("→ Applying admin-platform-stats.sql …");
  const apply = spawnSync("node", ["scripts/apply-admin-platform-stats.mjs"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (apply.status !== 0) {
    console.error("SQL apply failed (continuing with Netlify service-role path)…");
  }
} else {
  console.log("Skipping SQL apply (SUPABASE_ACCESS_TOKEN not set). Netlify service role is enough.");
}

console.log("→ Syncing Netlify environment …");
const netlify = spawnSync("node", ["scripts/configure-netlify-env.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, ...env },
});
if (netlify.status !== 0) process.exit(netlify.status ?? 1);

console.log("→ Triggering production deploy …");
const deploy = spawnSync("node", ["scripts/trigger-netlify-deploy.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, ...env },
});
process.exit(deploy.status ?? 0);