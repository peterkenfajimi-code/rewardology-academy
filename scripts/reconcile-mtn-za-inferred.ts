/**
 * Unpublish four MTN Group (JSE:MTN) rows that were inferred from GRI index headings and page
 * references rather than stated in the source. Checked against the FY25 ESG Data Booklet and
 * FY25 People report text (Sep 2026): none of the four facts is asserted in either document.
 *
 * Usage: npx tsx scripts/reconcile-mtn-za-inferred.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "mtn-za-inferred-review";

const REJECT: { entry_id: string; detail: string }[] = [
  {
    entry_id: "5b099168-c20f-45ab-a51f-45198b1cc30a",
    detail:
      "defined_benefit_plan_exists=yes came from the GRI 201-3 index line 'Defined benefit plan obligations and other retirement plans' — the GRI standard's own disclosure title pointing to the remuneration report, not a statement that MTN has a DB plan. Neither the ESG booklet nor the People report mentions one.",
  },
  {
    entry_id: "669282c1-94e4-43a0-8a80-ef0da42a97e1",
    detail:
      "flexible_hybrid_work_policy: notes admit 'may exist, no explicit confirmation'. The ESG booklet's only 'hybrid' is hybrid vehicles; the People report's 'flexible work and job models' is skills-based deployment and on-demand talent, not a flexible-hours policy.",
  },
  {
    entry_id: "4e8e958b-c27d-4e4e-aa67-494a9e4b27d8",
    detail:
      "tuition_reimbursement 'study leave policy exists' was 'implied from multiple references to employee development'. No study leave, bursary or tuition wording in the ESG booklet or People report.",
  },
  {
    entry_id: "8de3bf85-89d0-4eef-98d0-89ddea064022",
    detail:
      "share_based_payment_scheme 'yes - included in remuneration policy' was inferred from a GRI index page reference to share-based payment liabilities. No scheme is named or described in the source; the equity category keeps the CDP-sourced LTI row.",
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

  for (const row of REJECT) {
    const { data: existing, error: readErr } = await supabase
      .from("benefit_entries")
      .select("category, field, value, publish_status")
      .eq("entry_id", row.entry_id)
      .single();
    if (readErr || !existing) throw new Error(readErr?.message ?? `missing ${row.entry_id}`);
    if (existing.publish_status === "rejected") {
      console.log(`SKIP already rejected ${existing.category}.${existing.field}`);
      continue;
    }
    const { error } = await supabase
      .from("benefit_entries")
      .update({ publish_status: "rejected", verified_by: ACTOR })
      .eq("entry_id", row.entry_id)
      .eq("publish_status", "published");
    if (error) throw new Error(`${row.entry_id}: ${error.message}`);
    const { error: logErr } = await supabase
      .from("verification_log")
      .insert({ entry_id: row.entry_id, action: "rejected", actor: ACTOR, detail: row.detail });
    if (logErr) throw new Error(`log ${row.entry_id}: ${logErr.message}`);
    console.log(`REJECTED ${existing.category}.${existing.field} = ${existing.value}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
