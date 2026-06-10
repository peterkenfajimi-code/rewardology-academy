import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = readFileSync(join(root, ".env.local"), "utf8").match(/^NETLIFY_AUTH_TOKEN=(.+)$/m)?.[1]?.trim();
const SITE_ID = "863de8b2-0f89-4c84-9f73-2440063bc695";
const headers = { Authorization: `Bearer ${token}` };

const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys?per_page=5`, { headers });
const deploys = await res.json();
for (const d of deploys) {
  console.log(
    d.id?.slice(0, 12),
    d.state,
    d.context,
    d.commit_ref?.slice(0, 7),
    d.error_message || d.title
  );
}

const siteRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}`, { headers });
const site = await siteRes.json();
console.log("\nPublished:", site.published_deploy?.commit_ref?.slice(0, 7), site.published_deploy?.state);
