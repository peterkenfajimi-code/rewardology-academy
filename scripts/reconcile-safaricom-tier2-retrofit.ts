/**
 * Align Safaricom Kenya retirement fields with migration 011 tier-aware registry (GCB pattern).
 * - pension_administrator_type scoped to Tier 1 NSSF only (Tier 2 rates belong in tier2_* fields)
 * - employer_contribution_pct=6 annotated as Tier 1 NSSF (stays pending until cap review)
 * - Supersede duplicate FY2024 pension_administrator_type row
 *
 * Usage: npx tsx scripts/reconcile-safaricom-tier2-retrofit.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "safaricom-tier2-retrofit";

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
  fiscal_year_or_effective_date: string | null;
};

function appendNote(notes: string | null, extra: string): string {
  return notes?.trim() ? `${notes.trim()} ${extra}` : extra;
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
  if (!company) throw new Error("Safaricom company not found");

  const { data: entries, error } = await supabase
    .from("benefit_entries")
    .select(
      "entry_id, category, field, value, value_type, publish_status, notes, fiscal_year_or_effective_date"
    )
    .eq("company_id", company.company_id)
    .eq("category", "retirement");

  if (error) throw new Error(error.message);
  const rows = (entries ?? []) as EntryRow[];

  const publishedAdmin = rows.find(
    (r) =>
      r.field === "pension_administrator_type" &&
      r.publish_status === "published" &&
      (r.value?.toLowerCase().includes("nssf") ?? false)
  );
  const pendingAdminDup = rows.find(
    (r) =>
      r.field === "pension_administrator_type" &&
      r.publish_status === "pending_verification" &&
      r.value?.includes("National Social Security Fund (NSSF) and separate")
  );
  const employer6 = rows.find(
    (r) => r.field === "employer_contribution_pct" && r.value?.trim() === "6"
  );
  const tier2EmployerPublished = rows.find(
    (r) => r.field === "tier2_employer_contribution_pct" && r.publish_status === "published"
  );
  const tier2EmployeePublished = rows.find(
    (r) => r.field === "tier2_employee_contribution_pct" && r.publish_status === "published"
  );

  if (!publishedAdmin) throw new Error("Published pension_administrator_type row not found");

  const oldAdminValue = publishedAdmin.value;
  if (oldAdminValue?.includes("private occupational") || oldAdminValue?.includes("+")) {
    const { error: adminErr } = await supabase
      .from("benefit_entries")
      .update({
        value: "NSSF (Tier 1)",
        notes: appendNote(
          publishedAdmin.notes,
          "Retrofit: Tier 1 administrator only. Private occupational DC scheme (Tier 2) to be captured via tier2_* contribution fields when source confirms rates — not bundled in administrator prose (migration 011 alignment)."
        ),
      })
      .eq("entry_id", publishedAdmin.entry_id);
    if (adminErr) throw new Error(adminErr.message);
    await logAction(
      supabase,
      publishedAdmin.entry_id,
      "corrected",
      `Scoped pension_administrator_type from "${oldAdminValue}" to NSSF (Tier 1) only.`
    );
    console.log(`UPDATED    pension_administrator_type: "${oldAdminValue}" → NSSF (Tier 1)`);
  } else {
    console.log("SKIP admin — already Tier 1 scoped:", publishedAdmin.value);
  }

  if (pendingAdminDup) {
    await supabase
      .from("benefit_entries")
      .update({
        publish_status: "superseded",
        superseded_by_entry_id: publishedAdmin.entry_id,
        notes: appendNote(
          pendingAdminDup.notes,
          "Superseded — duplicate administrator row; Tier 1/Tier 2 split now uses tier-aware fields."
        ),
      })
      .eq("entry_id", pendingAdminDup.entry_id);
    await logAction(
      supabase,
      pendingAdminDup.entry_id,
      "superseded",
      "FY2024 duplicate pension_administrator_type superseded after tier2 retrofit."
    );
    console.log("SUPERSEDED pending pension_administrator_type (FY2024 duplicate)");
  }

  if (employer6) {
    const { error: empErr } = await supabase
      .from("benefit_entries")
      .update({
        notes: appendNote(
          employer6.notes,
          "Tier 1 NSSF statutory employer rate (6%). Held pending cap-language source review — not Tier 2 occupational scheme rate."
        ),
      })
      .eq("entry_id", employer6.entry_id);
    if (empErr) throw new Error(empErr.message);
    console.log("ANNOTATED  employer_contribution_pct=6 as Tier 1 NSSF (still pending_verification)");
  }

  if (!tier2EmployerPublished && !tier2EmployeePublished) {
    console.log(
      "NOTE       No tier2_* contribution rates in DB yet — publish tier2_employer/employee_contribution_pct when annual-report review confirms occupational scheme rates."
    );
  }

  const { data: published } = await supabase
    .from("benefit_entries")
    .select("category, field, value, publish_status")
    .eq("company_id", company.company_id)
    .eq("publish_status", "published")
    .eq("category", "retirement")
    .order("field");

  console.log(`\nPublished Safaricom retirement fields: ${published?.length ?? 0}`);
  for (const row of published ?? []) {
    console.log(`  ${row.field} = ${row.value}`);
  }

  const bad = (published ?? []).find(
    (r) =>
      r.field === "pension_administrator_type" &&
      (r.value?.includes("+") || r.value?.toLowerCase().includes("private occupational"))
  );
  if (bad) throw new Error("Administrator still bundles Tier 2 prose — abort");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
