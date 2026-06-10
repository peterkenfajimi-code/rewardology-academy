/** List Netlify DNS zones and records for rewardologyacademy.com */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal, resolveProjectRoot, getProjectRoot } from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = process.env.NETLIFY_AUTH_TOKEN || env.NETLIFY_AUTH_TOKEN;
const domain = "rewardologyacademy.com";

const zonesRes = await fetch("https://api.netlify.com/api/v1/dns_zones", {
  headers: { Authorization: `Bearer ${token}` },
});
const zones = await zonesRes.json();
console.log("Zones:", zonesRes.status);
for (const z of zones) {
  console.log(`  ${z.id}  ${z.name}`);
}

const zone = zones.find((z) => z.name === domain);
if (!zone) {
  console.log("\nDomain not found in Netlify DNS — DNS may be managed elsewhere.");
  process.exit(0);
}

const recRes = await fetch(`https://api.netlify.com/api/v1/dns_zones/${zone.id}/dns_records`, {
  headers: { Authorization: `Bearer ${token}` },
});
const records = await recRes.json();
console.log("\nExisting records:");
for (const r of records) {
  console.log(`  ${r.type} ${r.hostname} → ${r.value}${r.priority != null ? ` (pri ${r.priority})` : ""}`);
}
