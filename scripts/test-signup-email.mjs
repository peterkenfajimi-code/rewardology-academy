/**
 * Live signup test: triggers Supabase signup and checks Resend for delivery.
 *
 * Usage:
 *   node scripts/test-signup-email.mjs you@example.com
 *   SIGNUP_TEST_EMAIL=you@example.com node scripts/test-signup-email.mjs
 */
import {
  getProjectRoot,
  loadEnvLocal,
  resolveProjectRoot,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const email = process.argv[2] || process.env.SIGNUP_TEST_EMAIL;

if (!supabaseUrl || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

if (!email) {
  console.error("Usage: node scripts/test-signup-email.mjs you@example.com");
  process.exit(1);
}

const password = `Test-${Date.now().toString(36)}!Aa1`;
const redirectTo = "https://rewardologyacademy.com/auth/callback?next=/dashboard";

console.log("Signup test email:", email);
console.log("Supabase URL:", supabaseUrl);

const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
  method: "POST",
  headers: {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    password,
    options: { emailRedirectTo: redirectTo },
  }),
});

const signupBody = await signupRes.text();
console.log("\nSignup response:", signupRes.status);
try {
  const parsed = JSON.parse(signupBody);
  if (parsed.user) {
    console.log("  user id:", parsed.user.id);
    console.log("  email confirmed:", parsed.user.email_confirmed_at ?? "pending");
  }
  if (parsed.msg || parsed.error_description || parsed.error) {
    console.log("  message:", parsed.msg || parsed.error_description || parsed.error);
  }
  if (parsed.code) console.log("  code:", parsed.code);
} catch {
  console.log(signupBody.slice(0, 500));
}

if (!signupRes.ok) {
  process.exit(1);
}

if (!resendKey) {
  console.log("\n(No RESEND_API_KEY — skip Resend delivery check)");
  process.exit(0);
}

console.log("\nWaiting 8s for Resend to process…");
await new Promise((r) => setTimeout(r, 8000));

const emailsRes = await fetch("https://api.resend.com/emails", {
  headers: { Authorization: `Bearer ${resendKey}` },
});
if (!emailsRes.ok) {
  console.log("Resend emails list:", emailsRes.status, await emailsRes.text());
  process.exit(0);
}

const emails = await emailsRes.json();
const recent = (emails.data ?? []).filter(
  (m) => m.to?.includes?.(email) || m.to === email || JSON.stringify(m.to).includes(email)
);
if (recent.length) {
  console.log("\nResend delivery log:");
  for (const m of recent.slice(0, 3)) {
    console.log(`  ${m.created_at} → ${JSON.stringify(m.to)} subject: ${m.subject} status: ${m.last_event || m.status}`);
  }
} else {
  console.log("\nNo Resend log yet for this address. Check https://resend.com/emails");
  console.log("Latest sends:", (emails.data ?? []).slice(0, 3).map((m) => `${m.to} — ${m.subject}`).join("\n  "));
}

console.log("\nCheck your inbox for the confirmation link from noreply@rewardologyacademy.com");
