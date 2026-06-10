import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = readFileSync(join(root, ".env.local"), "utf8").match(/^NETLIFY_AUTH_TOKEN=(.+)$/m)?.[1]?.trim();
const SITE_ID = "863de8b2-0f89-4c84-9f73-2440063bc695";
const headers = { Authorization: `Bearer ${token}` };

const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys?per_page=3`, { headers });
const deploys = await res.json();
for (const d of deploys) {
  console.log(JSON.stringify({
    id: d.id,
    state: d.state,
    commit: d.commit_ref?.slice(0, 7),
    error: d.error_message,
    summary: d.summary?.status,
  }, null, 2));
}
