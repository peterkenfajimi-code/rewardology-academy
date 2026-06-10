/**
 * Add Resend email DNS records to Netlify for rewardologyacademy.com.
 * Usage: node scripts/add-resend-dns-netlify.mjs
 */
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = process.env.NETLIFY_AUTH_TOKEN || env.NETLIFY_AUTH_TOKEN;
const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const domain = "rewardologyacademy.com";

const RESEND_RECORDS = [
  {
    record: "DKIM",
    name: "resend._domainkey",
    value:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIHqKoW7nGdL/wPXDlmz09HKdmzv4PWpYNYFEot8B13+yBMC8sXXh7zvd+T3Tdq3rjEMBdfYWdyhtk9jylR8SEcvmZbWHtXvDKTPIO5H/WjarPgo/PLY59+Ege2THuNwrjT1h9Kv/L+DMlMIs0J2X9gi1UrB6E1r30VDJM6NeMKwIDAQAB",
    type: "TXT",
  },
  {
    record: "SPF",
    name: "send",
    type: "MX",
    value: "feedback-smtp.eu-west-1.amazonses.com",
    priority: 10,
  },
  {
    record: "SPF",
    name: "send",
    value: "v=spf1 include:amazonses.com ~all",
    type: "TXT",
  },
];

const zonesRes = await fetch("https://api.netlify.com/api/v1/dns_zones", {
  headers: { Authorization: `Bearer ${token}` },
});
const zones = await zonesRes.json();
const zone = zones.find((z) => z.name === domain);
if (!zone) {
  console.error("Zone not found in Netlify DNS");
  process.exit(1);
}

const recRes = await fetch(`https://api.netlify.com/api/v1/dns_zones/${zone.id}/dns_records`, {
  headers: { Authorization: `Bearer ${token}` },
});
const existing = await recRes.json();

function hostnameFor(name) {
  return name === domain ? domain : `${name}.${domain}`;
}

for (const rec of RESEND_RECORDS) {
  const hostname = hostnameFor(rec.name);
  const dup = existing.find(
    (r) =>
      r.type === rec.type &&
      r.hostname === hostname &&
      (rec.type !== "MX" || r.value === rec.value)
  );
  if (dup) {
    console.log("Skip (exists):", rec.type, hostname);
    continue;
  }

  const body = {
    type: rec.type,
    hostname: rec.name,
    value: rec.value,
  };
  if (rec.type === "MX" && rec.priority != null) {
    body.priority = rec.priority;
  }

  const createRes = await fetch(
    `https://api.netlify.com/api/v1/dns_zones/${zone.id}/dns_records`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const created = await createRes.text();
  if (!createRes.ok) {
    console.error("Failed:", rec.type, rec.name, createRes.status, created);
  } else {
    console.log("Added:", rec.type, rec.name);
  }
}

console.log("\nRe-checking Resend domain status in 5s...");
await new Promise((r) => setTimeout(r, 5000));

if (apiKey) {
  const listRes = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const list = await listRes.json();
  const entry = list.data?.find((d) => d.name === domain);
  console.log("Resend status:", entry?.status ?? "unknown");
}
