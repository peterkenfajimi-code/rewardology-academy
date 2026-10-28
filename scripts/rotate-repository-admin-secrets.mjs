/**
 * Rotate REPOSITORY_ADMIN_PASSWORD and REPOSITORY_ADMIN_SESSION_TOKEN.
 * Writes them to .env.local (gitignored) and, when NETLIFY_AUTH_TOKEN is set,
 * to Netlify production env. Does not print the new values.
 *
 * Usage: node scripts/rotate-repository-admin-secrets.mjs
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const NETLIFY_SITE_SLUG = "effulgent-cajeta-57593b";
const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const envPath = path.join(root, ".env.local");
const env = loadEnvLocal(root);

const password = crypto.randomBytes(24).toString("base64url");
const sessionToken = crypto.randomBytes(32).toString("base64url");

if (password === sessionToken) {
  console.error("Generated password collided with session token; re-run.");
  process.exit(1);
}

function upsertEnvFile(filePath, updates) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const lines = existing.length ? existing.split(/\r?\n/) : [];
  const seen = new Set();
  const next = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const i = trimmed.indexOf("=");
    if (i === -1) return line;
    const key = trimmed.slice(0, i).trim();
    if (!(key in updates)) return line;
    seen.add(key);
    return `${key}=${updates[key]}`;
  });
  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
  }
  const text = next.join("\n").replace(/\n*$/, "\n");
  fs.writeFileSync(filePath, text, "utf8");
}

upsertEnvFile(envPath, {
  REPOSITORY_ADMIN_PASSWORD: password,
  REPOSITORY_ADMIN_SESSION_TOKEN: sessionToken,
});
console.log("Wrote new password and session token to .env.local (not printed).");

const token = process.env.NETLIFY_AUTH_TOKEN || env.NETLIFY_AUTH_TOKEN;
if (!token) {
  console.log("NETLIFY_AUTH_TOKEN missing — set the two values in Netlify env, then redeploy.");
  process.exit(0);
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
  console.error(`Site not found for slug ${NETLIFY_SITE_SLUG}`);
  process.exit(1);
}

const accountId = site.account_id || site.account_slug;
const existingRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/env`, { headers });
if (!existingRes.ok) {
  console.error("List site env failed:", existingRes.status, await existingRes.text());
  process.exit(1);
}
const existingKeys = new Set((await existingRes.json()).map((v) => v.key));

async function setEnv(key, value) {
  const body = { key, values: [{ context: "all", value }] };
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
  console.log(existingKeys.has(key) ? "Updated" : "Created", key, "on Netlify");
}

await setEnv("REPOSITORY_ADMIN_PASSWORD", password);
await setEnv("REPOSITORY_ADMIN_SESSION_TOKEN", sessionToken);
console.log("Netlify env rotated. Redeploy so functions pick up the new values.");
