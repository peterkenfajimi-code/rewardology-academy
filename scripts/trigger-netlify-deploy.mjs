/**
 * Trigger Netlify production deploy for rewardology-academy.
 * Usage: node scripts/trigger-netlify-deploy.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadToken() {
  const raw = readFileSync(envPath, "utf8");
  const match = raw.match(/^NETLIFY_AUTH_TOKEN=(.+)$/m);
  return match?.[1]?.trim();
}

const token = loadToken();
if (!token) {
  console.error("Missing NETLIFY_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const SITE_SLUG = "effulgent-cajeta-57593b";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const listRes = await fetch("https://api.netlify.com/api/v1/sites", { headers });
if (!listRes.ok) {
  console.error("List sites failed:", listRes.status, await listRes.text());
  process.exit(1);
}

const sites = await listRes.json();
const site = sites.find(
  (s) => s.name === SITE_SLUG || s.subdomain === SITE_SLUG || s.ssl_url?.includes(SITE_SLUG)
);
if (!site) {
  console.error(`Site ${SITE_SLUG} not found`);
  process.exit(1);
}

console.log("Site:", site.ssl_url || site.url);
console.log("Published commit:", site.published_deploy?.commit_ref?.slice(0, 7) || "unknown");
console.log("Published at:", site.published_deploy?.published_at || "unknown");

const buildRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/builds`, {
  method: "POST",
  headers,
  body: JSON.stringify({ clear_cache: true }),
});

if (!buildRes.ok) {
  console.error("Deploy trigger failed:", buildRes.status, await buildRes.text());
  process.exit(1);
}

const build = await buildRes.json();
console.log("Deploy triggered:", build.id);
console.log("Deploy URL:", build.deploy_ssl_url || build.deploy_url);
console.log("Admin:", build.admin_url || `https://app.netlify.com/sites/${SITE_SLUG}/deploys/${build.id}`);
