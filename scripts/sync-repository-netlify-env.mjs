/**
 * Sync repository + Anthropic env vars from .env.local to Netlify.
 * Requires NETLIFY_AUTH_TOKEN and repository vars in .env.local.
 *
 * Usage: node scripts/sync-repository-netlify-env.mjs
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getProjectRoot, loadEnvLocal, resolveProjectRoot } from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);

const required = [
  "NEXT_PUBLIC_REPOSITORY_SUPABASE_URL",
  "REPOSITORY_SUPABASE_SERVICE_KEY",
  "REPOSITORY_ADMIN_SESSION_TOKEN",
];
const missing = required.filter((k) => !env[k]?.trim());
if (missing.length) {
  console.error("Missing in .env.local:", missing.join(", "));
  console.error("Run: npm run setup:benefits-repository");
  process.exit(1);
}

if (!env.ANTHROPIC_API_KEY?.trim()) {
  console.warn("ANTHROPIC_API_KEY not set — extraction will stay disabled until you add it.");
}

const configureScript = path.join(root, "scripts", "configure-netlify-env.mjs");
const node = process.execPath;
const res = spawnSync(node, [configureScript], { cwd: root, stdio: "inherit" });
process.exit(res.status ?? 1);
