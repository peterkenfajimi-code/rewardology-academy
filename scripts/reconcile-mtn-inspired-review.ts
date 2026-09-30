/**
 * Review the MTN Group 'Inspired' brochure rows saved as pending by run-mtn-inspired-brochure.ts.
 *
 * Usage: npx tsx scripts/reconcile-mtn-inspired-review.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "mtn-inspired-review";
const BROCHURE = "MTN 'Inspired' rewards brochure (Group HQ joiners, Sep 2024)";

const DECISIONS: {
  entry_id: string;
  action: "published" | "rejected";
  detail: string;
  update?: Record<string, string>;
}[] = [
  {
    entry_id: "9edd54ca-f394-4a8f-9a29-7f07421bbb2d",
    action: "rejected",
    detail: "'All-inclusive competitive rewards package… market-aligned basic salary' is recruitment copy, not a pay philosophy with verifiable specificity (same ruling as Safaricom).",
  },
  {
    entry_id: "3d01488a-108c-4446-bf28-613e6b259d0b",
    action: "published",
    detail: `${BROCHURE}: 'you will belong to the company's medical aid provider, CAMAF (a closed scheme)'.`,
  },
  {
    entry_id: "7d4a3e2e-d041-4080-bf47-71a4b1380599",
    action: "published",
    detail: `${BROCHURE}: membership is compulsory 'unless you are already covered by a spousal medical aid'; premiums structured within the package. Dependant cover not stated. value_type corrected to the registry's.`,
    update: { value_type: "quantified" },
  },
  {
    entry_id: "0b1b24f3-4684-4fae-813e-87dbb7c297f9",
    action: "published",
    detail: `${BROCHURE}: '20 days annual leave on full pay with increased additional leave days based on length of service'.`,
  },
  {
    entry_id: "6136c03c-e68c-40c5-a287-0f1ca17c1bd5",
    action: "published",
    detail: `${BROCHURE}: '6 months maternity leave on full pay'.`,
  },
  {
    entry_id: "8b0be28d-8835-49e6-81c1-229cc6131dd7",
    action: "published",
    detail: `${BROCHURE}: '5 days paternity leave upon the birth of the employee's child'.`,
  },
  {
    entry_id: "ee49ca23-6027-432e-9759-eba6e3a04572",
    action: "published",
    detail: `${BROCHURE}: 'we kit you out with tech equipment to support a hybrid work setting such as a laptop, headset… connectivity'. A described arrangement, unlike a bare work-life-balance claim.`,
  },
  {
    entry_id: "75f48fb8-07bc-4ec8-bf6b-a837df459ec7",
    action: "published",
    detail: `${BROCHURE}: 'Provident fund contributions are structured within your package, and a further Pension fund contribution from your end'. No rates stated.`,
  },
];

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

async function main() {
  loadEnvLocal();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  for (const row of DECISIONS) {
    const { data: existing, error: readErr } = await supabase
      .from("benefit_entries")
      .select("category, field, value, publish_status")
      .eq("entry_id", row.entry_id)
      .single();
    if (readErr || !existing) throw new Error(readErr?.message ?? `missing ${row.entry_id}`);
    if (existing.publish_status !== "pending_verification") {
      console.log(`SKIP ${existing.publish_status} ${existing.category}.${existing.field}`);
      continue;
    }
    const { error } = await supabase
      .from("benefit_entries")
      .update({ ...row.update, publish_status: row.action, verified_by: ACTOR })
      .eq("entry_id", row.entry_id)
      .eq("publish_status", "pending_verification");
    if (error) throw new Error(`${row.entry_id}: ${error.message}`);
    const { error: logErr } = await supabase
      .from("verification_log")
      .insert({ entry_id: row.entry_id, action: row.action, actor: ACTOR, detail: row.detail });
    if (logErr) throw new Error(`log ${row.entry_id}: ${logErr.message}`);
    console.log(`${row.action.toUpperCase().padEnd(9)} ${existing.category}.${existing.field} = ${existing.value}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
