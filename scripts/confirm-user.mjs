/**
 * Manually confirm a Supabase auth user (dev utility).
 *
 * Usage:
 *   node scripts/confirm-user.mjs
 *   node scripts/confirm-user.mjs you@example.com
 *
 * Requires SUPABASE_ACCESS_TOKEN and ADMIN_EMAIL in .env.local (or pass email as arg).
 */
import {
  getAdminEmail,
  getProjectRoot,
  getSupabaseAccessToken,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const email = process.argv[2]?.trim() || getAdminEmail(root, { required: true });
const token = getSupabaseAccessToken(root);

if (!token) {
  console.error("No SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

const escaped = email.replace(/'/g, "''");

async function query(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return JSON.parse(text);
}

const users = await query(
  `select id, email, email_confirmed_at, created_at from auth.users where email = '${escaped}' limit 1;`
);
console.log("User:", JSON.stringify(users, null, 2));

if (users?.[0] && !users[0].email_confirmed_at) {
  await query(
    `update auth.users set email_confirmed_at = now(), confirmed_at = now() where email = '${escaped}';`
  );
  console.log("Email confirmed manually.");
} else if (users?.[0]?.email_confirmed_at) {
  console.log("Already confirmed.");
} else {
  console.log("No user found for that email.");
}
