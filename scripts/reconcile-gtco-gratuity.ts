/**
 * GTCO's lump-sum DB gratuity scheme was published twice (defined_benefit_plan_exists = Yes and
 * gratuity_scheme_exists = "Terminal gratuity scheme"). Record it on the gratuity fields only
 * (migration 022 scope):
 *   - reject defined_benefit_plan_exists
 *   - gratuity_scheme_exists → clean Yes, cited to note 32 of the March 2025 reviewed statements
 *   - reject the pending careers-page gratuity "Yes" (vague, now a duplicate)
 *   - add gratuity_scheme_type from note 32
 *
 * Usage: npx tsx scripts/reconcile-gtco-gratuity.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { trustWeightForSourceType } from "../lib/repository/trust-weights";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "gtco-gratuity-scope";
const COMPANY_ID = "c10718dc-6905-4fa9-86e1-c128ab160092";
const MAR2025_FS_SOURCE_ID = "f9781d3a-8f9c-4f47-a2c9-bb86ec70c309";

const DB_EXISTS_ID = "da93ceba-123f-4444-8bbd-2e2487bea826";
const GRATUITY_EXISTS_ID = "097536af-04b6-4ee8-b462-e824c0bdfcf5";
const GRATUITY_PENDING_ID = "2434dead-3bc6-4681-ab4b-6be7d308498b";

const QUOTE =
  "The Group operates a non-contributory, funded lump sum defined benefit gratuity scheme. Employees are automatically admitted into the scheme after completing 10 consecutive years of service with the Bank. Employees' terminal benefits are calculated based on number of years of continuous service, limited to a maximum of 10 years.";
const CITATION = `March 2025 reviewed financial statements, note 32 "Defined benefit obligations" (2024 Annual Report note 38): "${QUOTE}"`;

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

  async function log(entryId: string, action: string, detail: string) {
    const { error } = await supabase
      .from("verification_log")
      .insert({ entry_id: entryId, action, actor: ACTOR, detail });
    if (error) throw new Error(`log ${entryId}: ${error.message}`);
  }

  async function update(entryId: string, fields: Record<string, unknown>) {
    const { error } = await supabase
      .from("benefit_entries")
      .update({ ...fields, verified_by: ACTOR })
      .eq("entry_id", entryId)
      .eq("company_id", COMPANY_ID);
    if (error) throw new Error(`update ${entryId}: ${error.message}`);
  }

  await update(DB_EXISTS_ID, {
    publish_status: "rejected",
    notes: `Rejected — the scheme behind this Yes is a lump-sum gratuity, not a pension-style DB plan; recorded on gratuity_scheme_exists / gratuity_scheme_type instead so one plan is not published as two (migration 022). ${CITATION}`,
  });
  await log(DB_EXISTS_ID, "rejected", "Lump-sum DB gratuity scheme moved to the gratuity fields (one plan, two published facts).");
  console.log("REJECTED defined_benefit_plan_exists");

  await update(GRATUITY_EXISTS_ID, {
    value: "Yes",
    value_type: "compliance_status",
    source_id: MAR2025_FS_SOURCE_ID,
    fiscal_year_or_effective_date: "FY2024",
    publish_status: "published",
    notes: `Corrected — previous value "Terminal gratuity scheme" was narrative on a Yes/No field (2023 AR directors' report). ${CITATION}`,
  });
  await log(GRATUITY_EXISTS_ID, "corrected", "Value normalised to Yes; retargeted to note 32 of the March 2025 reviewed statements.");
  console.log("UPDATED  gratuity_scheme_exists → Yes (still published)");

  await update(GRATUITY_PENDING_ID, {
    publish_status: "rejected",
    notes: "Rejected — careers-page paste only says gratuity and terminal benefits are mentioned; superseded by the note 32 disclosure on the published entry.",
  });
  await log(GRATUITY_PENDING_ID, "rejected", "Vague careers-page mention; duplicate of the published gratuity_scheme_exists.");
  console.log("REJECTED pending careers gratuity_scheme_exists");

  const { data: existingType } = await supabase
    .from("benefit_entries")
    .select("entry_id")
    .eq("company_id", COMPANY_ID)
    .eq("field", "gratuity_scheme_type")
    .in("publish_status", ["published", "pending_verification"]);
  if (existingType?.length) {
    console.log("SKIPPED  gratuity_scheme_type already present");
    return;
  }

  const { data: inserted, error } = await supabase
    .from("benefit_entries")
    .insert({
      company_id: COMPANY_ID,
      source_id: MAR2025_FS_SOURCE_ID,
      category: "retirement",
      field: "gratuity_scheme_type",
      value:
        "non-contributory, funded lump-sum scheme; employees join automatically after 10 consecutive years of service, and the benefit is based on years of continuous service, capped at 10 years",
      value_type: "named_program",
      fiscal_year_or_effective_date: "FY2024",
      confidence_score: "medium",
      confidence_was_clamped: false,
      source_trust_weight: trustWeightForSourceType("annual_report"),
      publish_status: "published",
      notes: CITATION,
      verified_by: ACTOR,
    })
    .select("entry_id")
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "Could not insert gratuity_scheme_type");
  await log(inserted.entry_id, "published", "Added from note 32 during gratuity/DB scope fix.");
  console.log("PUBLISHED gratuity_scheme_type", inserted.entry_id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
