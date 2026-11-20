/**
 * Anon REST: group benefit_entries by publish_status (what the public key can see).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
const restUrl = (process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL || env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL).replace(
  /\/$/,
  ""
);
const anonKey = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY;
const token = process.env.REPOSITORY_SUPABASE_ACCESS_TOKEN || env.REPOSITORY_SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.REPOSITORY_SUPABASE_PROJECT_REF || env.REPOSITORY_SUPABASE_PROJECT_REF;

async function anonGet(pathAndQuery) {
  const res = await fetch(`${restUrl}/rest/v1/${pathAndQuery}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Accept: "application/json", Prefer: "count=exact" },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, range: res.headers.get("content-range"), body };
}

const published = await anonGet("benefit_entries?select=publish_status&limit=1000");
const counts = {};
if (Array.isArray(published.body)) {
  for (const row of published.body) {
    const s = row.publish_status || "(null)";
    counts[s] = (counts[s] || 0) + 1;
  }
}

const byStatus = {};
for (const status of ["published", "pending_verification", "superseded", "rejected"]) {
  byStatus[status] = await anonGet(
    `benefit_entries?select=entry_id&publish_status=eq.${status}&limit=5`
  );
}

const internals = {};
for (const table of ["verification_log", "batch_runs", "unmapped_findings", "company_review_schedule"]) {
  internals[table] = await anonGet(`${table}?select=*&limit=1`);
}

let serviceCounts = null;
if (token && projectRef) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "select publish_status, count(*)::int as n from public.benefit_entries group by publish_status order by publish_status;",
    }),
  });
  serviceCounts = JSON.parse(await res.text());
}

console.log(
  JSON.stringify(
    {
      anonGroupedVisible: counts,
      anonByStatus: Object.fromEntries(
        Object.entries(byStatus).map(([k, v]) => [
          k,
          { status: v.status, rowCount: Array.isArray(v.body) ? v.body.length : null, sample: JSON.stringify(v.body).slice(0, 160) },
        ])
      ),
      internals: Object.fromEntries(
        Object.entries(internals).map(([k, v]) => [k, { status: v.status, sample: JSON.stringify(v.body).slice(0, 160) }])
      ),
      serviceRoleAllStatuses: serviceCounts,
    },
    null,
    2
  )
);
