/**
 * Push GA_MEASUREMENT_ID to Netlify and trigger a production deploy.
 *
 * Requires in .env.local (or env):
 *   NETLIFY_AUTH_TOKEN
 *   GA_MEASUREMENT_ID   (G-XXXXXXXXXX)
 *
 * Usage: node scripts/setup-ga4-production.mjs
 */
import { spawnSync } from "node:child_process";
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = process.env.NETLIFY_AUTH_TOKEN || env.NETLIFY_AUTH_TOKEN;
const gaId = (process.env.GA_MEASUREMENT_ID || env.GA_MEASUREMENT_ID)?.trim();

if (!token) {
  console.error("Missing NETLIFY_AUTH_TOKEN");
  process.exit(1);
}
if (!gaId || !/^G-[A-Z0-9]+$/i.test(gaId)) {
  console.error("Missing or invalid GA_MEASUREMENT_ID (expected G-XXXXXXXXXX)");
  process.exit(1);
}

// Ensure .env.local has GA id for configure-netlify-env
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const envPath = join(root, ".env.local");
let body = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
if (!/^GA_MEASUREMENT_ID=/m.test(body)) {
  body += `${body.endsWith("\n") || body.length === 0 ? "" : "\n"}GA_MEASUREMENT_ID=${gaId}\n`;
} else {
  body = body.replace(/^GA_MEASUREMENT_ID=.*$/m, `GA_MEASUREMENT_ID=${gaId}`);
}
if (!/^NETLIFY_AUTH_TOKEN=/m.test(body) && token) {
  body += `NETLIFY_AUTH_TOKEN=${token}\n`;
}
writeFileSync(envPath, body, "utf8");

const cfg = spawnSync("node", ["scripts/configure-netlify-env.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NETLIFY_AUTH_TOKEN: token, GA_MEASUREMENT_ID: gaId },
});
if (cfg.status !== 0) process.exit(cfg.status ?? 1);

const deploy = spawnSync("node", ["scripts/trigger-netlify-deploy.mjs"], {
  cwd: root,
  stdio: "inherit",
});
process.exit(deploy.status ?? 0);