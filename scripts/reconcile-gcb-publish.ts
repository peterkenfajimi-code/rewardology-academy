/**
 * Apply GCB review decisions: fix source URL, reclassify held rows, publish clean retirement fields.
 * Usage: npx tsx scripts/reconcile-gcb-publish.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "gcb-review";
const CANONICAL_SOURCE_URL =
  "https://www.gcbbank.com.gh/downloadable-reports/437-2024-annual-report/file";
const SOURCE_PAGE_URL =
  "https://www.gcbbank.com.gh/downloadable-reports/437-2024-annual-report";

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

type EntryRow = {
  entry_id: string;
  category: string;
  field: string;
  value: string | null;
  value_type: string | null;
  publish_status: string;
  notes: string | null;
  source_id: string;
};

async function logAction(
  supabase: ReturnType<typeof createClient>,
  entryId: string,
  action: string,
  detail: string
) {
  await supabase.from("verification_log").insert({
    entry_id: entryId,
    action,
    actor: ACTOR,
    detail,
  });
}

async function publishEntry(supabase: ReturnType<typeof createClient>, entry: EntryRow, detail: string) {
  const { error } = await supabase
    .from("benefit_entries")
    .update({ publish_status: "published", verified_by: ACTOR })
    .eq("entry_id", entry.entry_id)
    .eq("publish_status", "pending_verification");
  if (error) throw new Error(`Publish ${entry.field}: ${error.message}`);
  await logAction(supabase, entry.entry_id, "published", detail);
  console.log(`PUBLISHED  ${entry.category}.${entry.field} = ${entry.value}`);
}

async function main() {
  loadEnvLocal();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name")
    .eq("exchange_ticker", "GCB")
    .single();
  if (!company) throw new Error("GCB company not found");

  const { data: sources } = await supabase
    .from("sources")
    .select("source_id, source_url, source_title")
    .eq("company_id", company.company_id)
    .ilike("source_title", "%GCB Bank PLC 2024%");

  for (const src of sources ?? []) {
    if (!src.source_url?.startsWith("http")) {
      await supabase
        .from("sources")
        .update({
          source_url: CANONICAL_SOURCE_URL,
          source_title: "GCB Bank PLC 2024 Annual Report",
        })
        .eq("source_id", src.source_id);
      console.log(`Fixed source URL → ${CANONICAL_SOURCE_URL}`);
    }
  }

  const { data: entries, error } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, value_type, publish_status, notes, source_id")
    .eq("company_id", company.company_id)
    .eq("publish_status", "pending_verification");

  if (error) throw new Error(error.message);
  const rows = (entries ?? []) as EntryRow[];

  const byFieldValue = (field: string, valueIncludes: string) =>
    rows.find((r) => r.field === field && r.value?.includes(valueIncludes));

  const schemeMixed = rows.find((r) => r.field === "pension_scheme_type" && r.value === "mixed");
  const admin = rows.find((r) => r.field === "pension_administrator_type");
  const employer13 = byFieldValue("employer_contribution_pct", "13");
  const employer125 = byFieldValue("employer_contribution_pct", "12.5");
  const employee10 = byFieldValue("employee_contribution_pct", "10");
  const legacyDb = rows.find((r) => r.field === "defined_benefit_plan_exists");
  const hmo = rows.find((r) => r.field === "hmo_scope" && r.category === "health");
  const termination = rows.find((r) => r.field === "termination_benefits_policy");

  if (schemeMixed) {
    await supabase
      .from("benefit_entries")
      .update({
        value_type: "named_program",
        notes: appendNote(
          schemeMixed.notes,
          "Corrected value_type to named_program per field registry."
        ),
      })
      .eq("entry_id", schemeMixed.entry_id);
    schemeMixed.value_type = "named_program";
    console.log("Fixed pension_scheme_type value_type → named_program");
  }

  if (legacyDb) {
    await supabase
      .from("benefit_entries")
      .update({
        value: "Yes (closed legacy scheme, discontinued 1985)",
        notes: appendNote(
          legacyDb.notes,
          "Held pending — bare Yes would misread as active DB plan for current employees."
        ),
      })
      .eq("entry_id", legacyDb.entry_id);
    console.log("Updated defined_benefit_plan_exists value — held pending");
  }

  if (hmo) {
    await supabase
      .from("benefit_entries")
      .update({
        category: "retirement",
        field: "post_retirement_medical_care",
        value_type: "compliance_status",
        value: "Yes",
        notes: appendNote(
          hmo.notes,
          "Reclassified from health.hmo_scope — ongoing post-retirement medical care, not active-employee health coverage."
        ),
      })
      .eq("entry_id", hmo.entry_id);
    console.log("Reclassified post-retirement medical care → retirement.post_retirement_medical_care (held pending)");
  }

  if (employer125) {
    await supabase
      .from("benefit_entries")
      .update({
        category: "retirement",
        field: "tier2_employer_contribution_pct",
        value_type: "quantified",
        value: "12.5",
        notes: appendNote(
          employer125.notes,
          "Remapped from duplicate employer_contribution_pct — mandatory Tier 2 Provident Fund employer rate."
        ),
      })
      .eq("entry_id", employer125.entry_id);
    employer125.field = "tier2_employer_contribution_pct";
    employer125.value = "12.5";
    employer125.value_type = "quantified";
    console.log("Remapped Tier 2 employer 12.5% → tier2_employer_contribution_pct");
  }

  if (employee10) {
    await supabase
      .from("benefit_entries")
      .update({
        category: "retirement",
        field: "tier2_employee_contribution_pct",
        value_type: "quantified",
        notes: appendNote(
          employee10.notes,
          "Remapped from employee_contribution_pct — mandatory Tier 2 Provident Fund employee rate."
        ),
      })
      .eq("entry_id", employee10.entry_id);
    employee10.field = "tier2_employee_contribution_pct";
    employee10.value_type = "quantified";
    console.log("Remapped Tier 2 employee 10% → tier2_employee_contribution_pct");
  }

  if (termination) {
    console.log("Held pending: other_voluntary.termination_benefits_policy (value_type mismatch)");
  }

  const toPublish = [schemeMixed, admin, employer13, employee10, employer125].filter(Boolean) as EntryRow[];
  // employee10 / employer125 are tier2_* fields after remap above

  for (const entry of toPublish) {
    await publishEntry(
      supabase,
      entry,
      `Published after GCB Ghana three-tier review. Source: ${SOURCE_PAGE_URL}`
    );
  }

  const { data: published } = await supabase
    .from("benefit_entries")
    .select("category, field, value, publish_status")
    .eq("company_id", company.company_id)
    .eq("publish_status", "published");

  console.log(`\nPublished GCB entries: ${published?.length ?? 0}`);
  for (const row of published ?? []) {
    console.log(`  ${row.category}.${row.field} = ${row.value}`);
  }

  const { data: pending } = await supabase
    .from("benefit_entries")
    .select("category, field, value")
    .eq("company_id", company.company_id)
    .eq("publish_status", "pending_verification");

  console.log(`\nStill pending: ${pending?.length ?? 0}`);
  for (const row of pending ?? []) {
    console.log(`  ${row.category}.${row.field} = ${row.value}`);
  }
}

function appendNote(notes: string | null, extra: string): string {
  return notes?.trim() ? `${notes.trim()} ${extra}` : extra;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
