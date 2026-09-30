/**
 * Unpublish MTN Ghana's termination_benefits_policy: AR 2.8.4 is the IAS 19 recognition and
 * measurement policy ("may be payable… charged when demonstrably committed… discounted"),
 * not a disclosed entitlement. Same ruling as GCB's row in reconcile-safaricom-gcb-pending.ts.
 *
 * Usage: npx tsx scripts/reconcile-mtngh-termination.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "mtngh-termination-review";
const ENTRY_ID = "e5c8448f-177a-434c-a3cb-76d52ecd0a96";
const DETAIL =
  "Unpublished. AR 2.8.4: termination benefits 'may be payable' on death, retrenchment or voluntary redundancy, are 'charged against statement of comprehensive income when the Group is demonstrably committed', and are discounted if due after 12 months. That is the IAS 19 recognition/measurement policy, not a statement that employees are entitled to a termination benefit. Consistent with the GCB rejection.";

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

  const { data: row, error: readErr } = await supabase
    .from("benefit_entries")
    .select("field, value, publish_status")
    .eq("entry_id", ENTRY_ID)
    .single();
  if (readErr || !row) throw new Error(readErr?.message ?? "missing entry");
  if (row.publish_status === "rejected") {
    console.log("SKIP already rejected");
    return;
  }

  const { error } = await supabase
    .from("benefit_entries")
    .update({ publish_status: "rejected", verified_by: ACTOR })
    .eq("entry_id", ENTRY_ID)
    .eq("publish_status", "published");
  if (error) throw new Error(error.message);
  const { error: logErr } = await supabase
    .from("verification_log")
    .insert({ entry_id: ENTRY_ID, action: "rejected", actor: ACTOR, detail: DETAIL });
  if (logErr) throw new Error(`log: ${logErr.message}`);
  console.log(`REJECTED ${row.field} (was ${row.publish_status})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
