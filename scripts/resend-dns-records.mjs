/**
 * Print Resend DNS records for rewardologyacademy.com (add in Netlify DNS).
 * Usage: node scripts/resend-dns-records.mjs
 */
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const domain = "rewardologyacademy.com";

if (!apiKey) {
  console.error("Missing RESEND_API_KEY");
  process.exit(1);
}

const listRes = await fetch("https://api.resend.com/domains", {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const list = await listRes.json();
const entry = list.data?.find((d) => d.name === domain);
if (!entry?.id) {
  console.log("Domain not in Resend. Add it at https://resend.com/domains");
  process.exit(1);
}

const detailRes = await fetch(`https://api.resend.com/domains/${entry.id}`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const detail = await detailRes.json();
console.log(JSON.stringify(detail, null, 2));
