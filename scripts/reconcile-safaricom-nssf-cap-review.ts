/**
 * Source-read of Safaricom NSSF / occupational pension notes (FY26 + FY25 ARs).
 * Outcome: do not publish employer_contribution_pct=6 — the reports do not state a
 * rate, cap, employee-side %, or Tier 2 occupational %. The 6 is country-module leakage.
 *
 * Usage: npx tsx scripts/reconcile-safaricom-nssf-cap-review.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "safaricom-nssf-cap-review";
const ENTRY_ID = "f5aae188-1503-4f77-94f2-0b8ca552bb06";

const SOURCE_NOTE =
  "Source-read FY26 AR note 2(s) (p.172) and FY25 AR note 2(s): 'The Group has a defined contribution plan for its employees. The Group and all its employees also contribute to the National Social Security Fund, which is a defined contribution scheme.' No contribution %, cap, upper/lower earnings limit, or contracted-out Tier 2 occupational rate is disclosed. Note 10 splits expense only: FY26 NSSF KShs 295.8m vs defined pension contribution plan KShs 1,229.3m (Group). 6% was Kenya country-module statutory baseline, not a company-disclosed figure — rejected, do not publish. Employee-side % and tier2_* rates remain undisclosed.";

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

  const { data: row, error } = await supabase
    .from("benefit_entries")
    .select("entry_id, field, value, notes, publish_status")
    .eq("entry_id", ENTRY_ID)
    .single();
  if (error || !row) throw new Error(error?.message ?? "employer_contribution_pct=6 row not found");

  if (row.publish_status === "rejected" && row.notes?.includes("Source-read FY26 AR")) {
    console.log("SKIP already reviewed:", row.entry_id);
    return;
  }

  const { error: updErr } = await supabase
    .from("benefit_entries")
    .update({
      publish_status: "rejected",
      notes: SOURCE_NOTE,
      verified_by: ACTOR,
    })
    .eq("entry_id", ENTRY_ID);
  if (updErr) throw new Error(updErr.message);

  await supabase.from("verification_log").insert({
    entry_id: ENTRY_ID,
    action: "reconciled",
    actor: ACTOR,
    detail:
      "Rejected employer_contribution_pct=6 after reading FY26 note 2(s) and Note 10. AR confirms NSSF + company DC plan exist; does not disclose 6%, cap mechanics, employee %, or occupational scheme rates.",
  });

  console.log(`REJECTED  ${row.field}=${row.value} (${ENTRY_ID})`);
  console.log("tier2_* left empty — source does not disclose occupational rates.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
