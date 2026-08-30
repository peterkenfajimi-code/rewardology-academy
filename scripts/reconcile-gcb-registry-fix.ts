/**
 * Fix GCB misfiled facts after registry extension (migration 011).
 * Unpublishes voluntary_contribution_program mislabel, remaps to proper tier2/post-retirement fields.
 * Usage: npx tsx scripts/reconcile-gcb-registry-fix.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "gcb-registry-fix";

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

async function unpublishEntry(
  supabase: ReturnType<typeof createClient>,
  entry: EntryRow,
  detail: string
) {
  const { error } = await supabase
    .from("benefit_entries")
    .update({ publish_status: "pending_verification", verified_by: null })
    .eq("entry_id", entry.entry_id)
    .eq("publish_status", "published");
  if (error) throw new Error(`Unpublish ${entry.field}: ${error.message}`);
  await logAction(supabase, entry.entry_id, "unpublished", detail);
  console.log(`UNPUBLISHED ${entry.category}.${entry.field} = ${entry.value}`);
}

async function publishEntry(supabase: ReturnType<typeof createClient>, entry: EntryRow, detail: string) {
  const { error } = await supabase
    .from("benefit_entries")
    .update({ publish_status: "published", verified_by: ACTOR })
    .eq("entry_id", entry.entry_id);
  if (error) throw new Error(`Publish ${entry.field}: ${error.message}`);
  await logAction(supabase, entry.entry_id, "published", detail);
  console.log(`PUBLISHED   ${entry.category}.${entry.field} = ${entry.value}`);
}

function appendNote(notes: string | null, extra: string): string {
  return notes?.trim() ? `${notes.trim()} ${extra}` : extra;
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

  const { data: entries, error } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, value_type, publish_status, notes")
    .eq("company_id", company.company_id);

  if (error) throw new Error(error.message);
  const rows = (entries ?? []) as EntryRow[];

  const voluntaryMisfile = rows.find(
    (r) => r.field === "voluntary_contribution_program" && r.publish_status === "published"
  );
  const tier2EmployeeMisfile = rows.find(
    (r) =>
      r.field === "employee_contribution_pct" &&
      r.value?.trim() === "10" &&
      r.notes?.toLowerCase().includes("provident")
  );
  const postRetireMisfile = rows.find(
    (r) =>
      r.field === "additional_exit_benefit_scheme" &&
      (r.value?.toLowerCase().includes("post-retirement") ||
        r.notes?.toLowerCase().includes("hmo_scope"))
  );

  if (voluntaryMisfile) {
    await unpublishEntry(
      supabase,
      voluntaryMisfile,
      "Pulled — mandatory Tier 2 employer rate was misfiled under voluntary_contribution_program."
    );
    const { error: remapErr } = await supabase
      .from("benefit_entries")
      .update({
        field: "tier2_employer_contribution_pct",
        value: "12.5",
        value_type: "quantified",
        notes: appendNote(
          voluntaryMisfile.notes,
          "Remapped from voluntary_contribution_program — mandatory Tier 2 Provident Fund employer rate (migration 011)."
        ),
      })
      .eq("entry_id", voluntaryMisfile.entry_id);
    if (remapErr) throw new Error(remapErr.message);
    voluntaryMisfile.field = "tier2_employer_contribution_pct";
    voluntaryMisfile.value = "12.5";
    voluntaryMisfile.value_type = "quantified";
    console.log("Remapped → retirement.tier2_employer_contribution_pct = 12.5");
    await publishEntry(
      supabase,
      voluntaryMisfile,
      "Published mandatory Tier 2 Provident Fund employer contribution."
    );
  }

  if (tier2EmployeeMisfile) {
    if (tier2EmployeeMisfile.publish_status === "published") {
      await unpublishEntry(
        supabase,
        tier2EmployeeMisfile,
        "Pulled — Tier 2 Provident Fund employee rate was misfiled under primary employee_contribution_pct."
      );
    }
    const { error: remapErr } = await supabase
      .from("benefit_entries")
      .update({
        field: "tier2_employee_contribution_pct",
        value_type: "quantified",
        notes: appendNote(
          tier2EmployeeMisfile.notes,
          "Remapped from employee_contribution_pct — mandatory Tier 2 Provident Fund employee rate (migration 011)."
        ),
      })
      .eq("entry_id", tier2EmployeeMisfile.entry_id);
    if (remapErr) throw new Error(remapErr.message);
    tier2EmployeeMisfile.field = "tier2_employee_contribution_pct";
    console.log("Remapped → retirement.tier2_employee_contribution_pct = 10");
    await publishEntry(
      supabase,
      tier2EmployeeMisfile,
      "Published mandatory Tier 2 Provident Fund employee contribution."
    );
  }

  if (postRetireMisfile) {
    const { error: remapErr } = await supabase
      .from("benefit_entries")
      .update({
        field: "post_retirement_medical_care",
        value: "Yes",
        value_type: "compliance_status",
        notes: appendNote(
          postRetireMisfile.notes,
          "Remapped from additional_exit_benefit_scheme — ongoing post-retirement medical care, not exit/severance payout (migration 011)."
        ),
      })
      .eq("entry_id", postRetireMisfile.entry_id);
    if (remapErr) throw new Error(remapErr.message);
    postRetireMisfile.field = "post_retirement_medical_care";
    postRetireMisfile.value = "Yes";
    postRetireMisfile.value_type = "compliance_status";
    console.log("Remapped → retirement.post_retirement_medical_care = Yes");
    await publishEntry(
      supabase,
      postRetireMisfile,
      "Published post-retirement medical care for former employees."
    );
  }

  const { data: published } = await supabase
    .from("benefit_entries")
    .select("category, field, value, publish_status")
    .eq("company_id", company.company_id)
    .eq("publish_status", "published")
    .order("field");

  console.log(`\nPublished GCB entries: ${published?.length ?? 0}`);
  for (const row of published ?? []) {
    console.log(`  ${row.category}.${row.field} = ${row.value}`);
  }

  const { data: pending } = await supabase
    .from("benefit_entries")
    .select("category, field, value")
    .eq("company_id", company.company_id)
    .eq("publish_status", "pending_verification")
    .order("field");

  console.log(`\nStill pending: ${pending?.length ?? 0}`);
  for (const row of pending ?? []) {
    console.log(`  ${row.category}.${row.field} = ${row.value}`);
  }

  const bad = (published ?? []).filter((r) => r.field === "voluntary_contribution_program");
  if (bad.length) {
    throw new Error("voluntary_contribution_program still published — abort");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
