/**
 * Apply Safaricom publish decisions from Kenya validation review.
 * Usage: npx tsx scripts/reconcile-safaricom-publish.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "safaricom-review";

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
  fiscal_year_or_effective_date: string | null;
  sources: { source_title?: string | null } | null;
};

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

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

async function publishEntry(
  supabase: ReturnType<typeof createClient>,
  entry: EntryRow,
  detail: string
) {
  const { error } = await supabase
    .from("benefit_entries")
    .update({ publish_status: "published", verified_by: ACTOR })
    .eq("entry_id", entry.entry_id)
    .eq("publish_status", "pending_verification");
  if (error) throw new Error(`Publish failed ${entry.entry_id}: ${error.message}`);
  await logAction(supabase, entry.entry_id, "published", detail);
  console.log(`PUBLISHED  ${entry.category}.${entry.field} = ${entry.value}`);
}

async function supersedeEntry(
  supabase: ReturnType<typeof createClient>,
  entry: EntryRow,
  supersededBy: string | null,
  detail: string
) {
  await supabase
    .from("benefit_entries")
    .update({
      publish_status: "superseded",
      superseded_by_entry_id: supersededBy,
    })
    .eq("entry_id", entry.entry_id);
  await logAction(supabase, entry.entry_id, "superseded", detail);
  console.log(`SUPERSEDED ${entry.category}.${entry.field} = ${entry.value}`);
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
    .select("company_id, name, slug")
    .eq("exchange_ticker", "SCOM")
    .single();

  if (!company) throw new Error("Safaricom company row not found");

  const { data: entries, error } = await supabase
    .from("benefit_entries")
    .select(
      "entry_id, category, field, value, value_type, publish_status, fiscal_year_or_effective_date, sources(source_title)"
    )
    .eq("company_id", company.company_id)
    .in("publish_status", ["pending_verification", "published"]);

  if (error) throw new Error(error.message);

  const rows = (entries ?? []) as EntryRow[];

  const schemeMixed = rows.find(
    (e) => e.field === "pension_scheme_type" && norm(e.value) === "mixed"
  );
  const schemeDcRows = rows.filter(
    (e) =>
      e.field === "pension_scheme_type" &&
      e.publish_status === "pending_verification" &&
      norm(e.value).includes("defined contribution")
  );

  if (!schemeMixed) throw new Error("No pending pension_scheme_type=mixed row found");

  for (const row of schemeDcRows) {
    if (row.value_type === "compliance_status") {
      await supabase
        .from("benefit_entries")
        .update({
          value_type: "named_program",
          notes:
            "Corrected value_type from compliance_status to named_program before supersede (2025 extraction bug).",
        })
        .eq("entry_id", row.entry_id);
      console.log(`FIXED value_type on ${row.entry_id} (2025 DC row)`);
    }
  }

  await publishEntry(
    supabase,
    schemeMixed,
    "Published mixed pension_scheme_type — accurate Kenya two-tier structure (2026 annual report)."
  );

  for (const row of schemeDcRows) {
    await supersedeEntry(
      supabase,
      row,
      schemeMixed.entry_id,
      "Superseded imprecise defined_contribution label — Kenya structure is mixed, not single-tier DC."
    );
  }

  const publishFields = new Set([
    "pension_administrator_type",
    "esop_exists",
    "share_based_payment_scheme",
  ]);

  for (const row of rows) {
    if (row.publish_status !== "pending_verification") continue;
    if (row.field === "pension_scheme_type") continue;
    if (!publishFields.has(row.field)) continue;
    await publishEntry(
      supabase,
      row,
      `Published clean high-confidence ${row.category}.${row.field} after manual review.`
    );
  }

  const holdFields = new Set([
    "employer_contribution_pct",
    "employee_contribution_pct",
    "annual_leave_days",
    "additional_exit_benefit_scheme",
  ]);

  console.log("\nHeld pending for source review / value_type fix:");
  for (const row of rows) {
    if (row.publish_status !== "pending_verification") continue;
    if (publishFields.has(row.field) || row.field === "pension_scheme_type") continue;
    if (holdFields.has(row.field)) {
      console.log(`  HOLD ${row.category}.${row.field} = ${row.value}`);
    }
  }

  const { data: published } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, publish_status")
    .eq("company_id", company.company_id)
    .eq("publish_status", "published");

  console.log(`\nPublished Safaricom entries: ${published?.length ?? 0}`);
  for (const row of published ?? []) {
    console.log(`  ${row.category}.${row.field} = ${row.value}`);
  }

  const pending = rows.filter((r) => r.publish_status === "pending_verification").length;
  console.log(`Still pending_verification (this batch): ${pending}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
