/**
 * Configure Supabase Auth to send email via Resend SMTP (Management API).
 *
 * Requires in .env.local:
 *   SUPABASE_ACCESS_TOKEN=...
 *   RESEND_API_KEY=re_...
 *
 * Optional:
 *   RESEND_FROM_EMAIL=noreply@rewardologyacademy.com  (must be on a verified Resend domain)
 *   RESEND_SENDER_NAME=Rewardology Academy
 *
 * Prerequisite: verify rewardologyacademy.com at https://resend.com/domains
 *
 * Usage: node scripts/configure-resend-smtp.mjs
 */
import {
  getProjectRoot,
  getSupabaseAccessToken,
  loadEnvLocal,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const DEFAULT_FROM = "noreply@rewardologyacademy.com";
const DEFAULT_SENDER = "Rewardology Academy";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = getSupabaseAccessToken(root);
const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || env.RESEND_FROM_EMAIL || DEFAULT_FROM;
const senderName =
  process.env.RESEND_SENDER_NAME || env.RESEND_SENDER_NAME || DEFAULT_SENDER;

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

if (!apiKey) {
  console.error(`
Missing RESEND_API_KEY in .env.local

1. Sign up at https://resend.com
2. Domains → Add rewardologyacademy.com → add SPF/DKIM in Netlify DNS (dns*.nsone.net nameservers)
3. API Keys → Create API key
4. Add to .env.local:
   RESEND_API_KEY=re_...
5. Re-run: npm run configure:resend-smtp
`);
  process.exit(1);
}

const base = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const patchRes = await fetch(base, {
  method: "PATCH",
  headers,
  body: JSON.stringify({
    external_email_enabled: true,
    mailer_secure_email_change_enabled: true,
    mailer_autoconfirm: false,
    smtp_admin_email: fromEmail,
    smtp_sender_name: senderName,
    smtp_host: "smtp.resend.com",
    smtp_port: "587",
    smtp_user: "resend",
    smtp_pass: apiKey,
  }),
});

const body = await patchRes.text();
if (!patchRes.ok) {
  console.error("PATCH failed:", patchRes.status, body);
  process.exit(1);
}

console.log("Resend SMTP configured on Supabase Auth.");
console.log("  Host: smtp.resend.com:587");
console.log("  User: resend");
console.log("  From:", fromEmail);
console.log("  Sender:", senderName);
console.log("\nNext:");
console.log("  1. Confirm rewardologyacademy.com shows Verified in Resend → Domains");
console.log("  2. Supabase → Authentication → Rate Limits → raise email limit if needed (default ~30/hr)");
console.log("  3. Test: https://rewardologyacademy.com/signup with a real inbox");
console.log("  4. Check delivery in Resend → Emails");
