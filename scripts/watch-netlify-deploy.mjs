import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = readFileSync(join(root, ".env.local"), "utf8").match(/^NETLIFY_AUTH_TOKEN=(.+)$/m)?.[1]?.trim();
const SITE_ID = "863de8b2-0f89-4c84-9f73-2440063bc695";
const headers = { Authorization: `Bearer ${token}` };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const listRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys?per_page=1`, { headers });
const [latest] = await listRes.json();
const deployId = latest.id;
console.log("Watching deploy:", deployId?.slice(0, 12), "commit:", latest.commit_ref?.slice(0, 7));

for (let i = 0; i < 40; i++) {
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys/${deployId}`, { headers });
  const d = await res.json();
  console.log(`[${i + 1}] state=${d.state} commit=${d.commit_ref?.slice(0, 7)} ${d.error_message || d.title || ""}`);
  if (d.state === "ready") {
    console.log("SUCCESS:", d.ssl_url || d.deploy_ssl_url);
    process.exit(0);
  }
  if (d.state === "error") {
    console.error("FAILED:", d.error_message);
    process.exit(1);
  }
  await sleep(15000);
}
console.error("Timed out waiting for deploy");
process.exit(1);
