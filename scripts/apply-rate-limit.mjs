/**
 * Apply supabase/rate-limit.sql to the Academy project.
 * Requires SUPABASE_ACCESS_TOKEN in .env.local (never commit).
 * Usage: node scripts/apply-rate-limit.mjs
 */
import fs from "fs";
import path from "path";
import {
  getProjectRoot,
  getSupabaseAccessToken,
  resolveProjectRoot,
  SUPABASE_PROJECT_REF,
} from "./lib/load-env-local.mjs";

const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const token = getSupabaseAccessToken(root);

if (!token) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Open https://supabase.com/dashboard/account/tokens
2. Generate a token
3. Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_...

Then run: node scripts/apply-rate-limit.mjs
`);
  process.exit(1);
}

const query = fs.readFileSync(path.join(root, "supabase", "rate-limit.sql"), "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }
);

const body = await res.text();
if (!res.ok) {
  console.error("Rate-limit migration failed:", res.status, body);
  process.exit(1);
}

console.log("Rate-limit schema applied.");

const verify = await fetch(
  `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `select
        to_regclass('public.rate_limit_buckets') as table_name,
        (select relrowsecurity from pg_class c
           join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relname = 'rate_limit_buckets') as rls,
        (select coalesce(json_agg(json_build_object('grantee', grantee, 'privilege', privilege_type)
           order by grantee, privilege_type), '[]'::json)
           from information_schema.role_table_grants
           where table_schema = 'public' and table_name = 'rate_limit_buckets') as grants,
        exists (
          select 1 from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public' and p.proname = 'purge_rate_limit_buckets'
        ) as has_purge;`,
    }),
  }
);

const verifyBody = await verify.text();
if (!verify.ok) {
  console.error("Verification query failed:", verify.status, verifyBody);
  process.exit(1);
}

console.log("Verification:", verifyBody);
