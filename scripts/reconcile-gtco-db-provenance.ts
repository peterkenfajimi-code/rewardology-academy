/**
 * GTCO defined_benefit_plan_exists = Yes: replace the IAS 19 accounting-policy provenance with the
 * actual disclosure (March 2025 reviewed financial statements, note 32 "Defined benefit obligations").
 * The value is unchanged — the plan is real — only the evidence cited for it was boilerplate.
 *
 * Usage: npx tsx scripts/reconcile-gtco-db-provenance.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "gtco-db-provenance";
const ENTRY_ID = "da93ceba-123f-4444-8bbd-2e2487bea826";
const QUOTE =
  "The Group operates a non-contributory, funded lump sum defined benefit gratuity scheme. Employees are automatically admitted into the scheme after completing 10 consecutive years of service with the Bank.";

const NOTE = `Corrected provenance — previous note cited the IAS 19 accounting policy ("defined benefit plan liability recognition using projected unit credit method"), which describes how any DB plan would be measured and is not evidence one exists. Company-disclosed in March 2025 reviewed financial statements, note 32 "Defined benefit obligations": "${QUOTE}" Group DB obligation N4.21bn against plan assets of N40.51bn (Dec 2024). Active, not closed: current service cost is still recognised.`;

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

  const { data: entry, error: readError } = await supabase
    .from("benefit_entries")
    .select("entry_id, field, value, publish_status")
    .eq("entry_id", ENTRY_ID)
    .single();
  if (readError || !entry) throw new Error(readError?.message ?? "Entry not found");
  if (entry.field !== "defined_benefit_plan_exists" || entry.publish_status !== "published") {
    throw new Error(`Unexpected entry state: ${JSON.stringify(entry)}`);
  }

  const { error } = await supabase
    .from("benefit_entries")
    .update({ notes: NOTE, verified_by: ACTOR })
    .eq("entry_id", ENTRY_ID);
  if (error) throw new Error(error.message);

  const { error: logError } = await supabase.from("verification_log").insert({
    entry_id: ENTRY_ID,
    action: "corrected",
    actor: ACTOR,
    detail: "Replaced IAS 19 policy provenance with note 32 disclosure (lump-sum DB gratuity scheme). Value unchanged.",
  });
  if (logError) throw new Error(logError.message);

  console.log(`UPDATED  defined_benefit_plan_exists (${entry.value}) → note 32 citation (still published)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
