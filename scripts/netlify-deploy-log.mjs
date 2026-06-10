import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = readFileSync(join(root, ".env.local"), "utf8").match(/^NETLIFY_AUTH_TOKEN=(.+)$/m)?.[1]?.trim();
const SITE_ID = "863de8b2-0f89-4c84-9f73-2440063bc695";
const DEPLOY_ID = process.argv[2] || "6a29179940d7b1e554d4f9b0";
const headers = { Authorization: `Bearer ${token}` };

const d = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys/${DEPLOY_ID}`, { headers }).then((r) => r.json());
console.log("state:", d.state, "commit:", d.commit_ref?.slice(0, 7));
console.log("error:", d.error_message);

const logRes = await fetch(`https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}/log`, { headers });
const log = await logRes.text();
const lines = log.split("\n");
console.log("\n--- Last 40 log lines ---");
console.log(lines.slice(-40).join("\n"));
