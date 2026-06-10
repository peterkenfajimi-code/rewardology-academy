/**
 * One-off Resend + Supabase SMTP status (no TS path aliases).
 * Usage: node scripts/check-resend-status.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getProjectRoot,
  getSupabaseAccessToken,
  loadEnvLocal,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const domain = "rewardologyacademy.com";

if (!apiKey) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const domainsRes = await fetch("https://api.resend.com/domains", {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const domainsBody = await domainsRes.json();
const match = domainsBody.data?.find((d) => d.name === domain);
console.log("Resend domains API:", domainsRes.status);
console.log("Domain:", domain);
console.log("Status:", match?.status ?? "not_found");
if (!match) {
  console.log("All domains:", domainsBody.data?.map((d) => `${d.name} (${d.status})`).join(", ") || "none");
} else if (process.argv.includes("--verify")) {
  const verifyRes = await fetch(`https://api.resend.com/domains/${match.id}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  console.log("Verify triggered:", verifyRes.status, await verifyRes.text());
  await new Promise((r) => setTimeout(r, 8000));
  const detailRes = await fetch(`https://api.resend.com/domains/${match.id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const detail = await detailRes.json();
  console.log("Status after verify:", detail.status);
  for (const rec of detail.records ?? []) {
    console.log(`  ${rec.record} ${rec.type} ${rec.name}: ${rec.status}`);
  }
}

const token = getSupabaseAccessToken(root);
if (token) {
  const authRes = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const auth = await authRes.json();
  console.log("\nSupabase Auth SMTP:");
  console.log("  external_email_enabled:", auth.external_email_enabled);
  console.log("  smtp_host:", auth.smtp_host);
  console.log("  smtp_port:", auth.smtp_port);
  console.log("  smtp_admin_email:", auth.smtp_admin_email);
  console.log("  smtp_sender_name:", auth.smtp_sender_name);
} else {
  console.log("\n(Skip Supabase check — no SUPABASE_ACCESS_TOKEN)");
}
