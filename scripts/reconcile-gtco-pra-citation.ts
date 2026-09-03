/**
 * Retarget GTCO employer 10% / employee 8% to the 2024 Annual Report citation
 * (p.155, Defined contribution plans) and replace the false "metadata notes" provenance.
 *
 * Usage: npx tsx scripts/reconcile-gtco-pra-citation.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { contributionPctRegistryDescription } from "../lib/repository/statutory-vs-disclosure.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "gtco-pra-citation";
const AR_URL =
  "https://gtbank-plc.files.svdcdn.com/production/annual-reports/2024-annual-report/GTCO-FY-2024-Annual-Report.pdf";
const QUOTE =
  "The rate of contribution by the Bank and its employee is 10% and 8% respectively of basic salary, housing and transport allowance.";

const EMPLOYER_ID = "30f38ca0-7a8e-461f-996f-2b229b190625";
const EMPLOYEE_ID = "f709f476-214d-4f86-a949-1e93239716cf";

const EMPLOYER_NOTE = `Corrected provenance — previous note ("Statutory employer pension contribution for Nigeria extracted from metadata notes") was country-module leakage, not the actual citation. Company-disclosed in 2024 Annual Report p.155, "Defined contribution plans": "${QUOTE}" Equals the PRA statutory employer minimum; that match is not a reason to reject a source-stated company rate.`;

const EMPLOYEE_NOTE = `Corrected provenance — earlier note restated PRA wording without this citation. Company-disclosed in 2024 Annual Report p.155, "Defined contribution plans": "${QUOTE}" Equals the PRA statutory employee minimum; disclosed as the Bank's rate, not inferred from country_modules.`;

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

  const { data: company, error: cErr } = await supabase
    .from("companies")
    .select("company_id, country")
    .eq("exchange_ticker", "GTCO")
    .single();
  if (cErr || !company) throw new Error(cErr?.message ?? "GTCO not found");

  const existing = await supabase
    .from("sources")
    .select("source_id")
    .eq("company_id", company.company_id)
    .eq("source_url", AR_URL)
    .maybeSingle();

  let sourceId = existing.data?.source_id;
  if (!sourceId) {
    const { data: inserted, error: sErr } = await supabase
      .from("sources")
      .insert({
        company_id: company.company_id,
        source_type: "annual_report",
        source_url: AR_URL,
        source_title: "2024 Annual Report",
        publication_date: "2024-12-31",
        date_accessed: new Date().toISOString().slice(0, 10),
        country: company.country,
      })
      .select("source_id")
      .single();
    if (sErr || !inserted) throw new Error(sErr?.message ?? "Could not insert 2024 AR source");
    sourceId = inserted.source_id;
    console.log("INSERTED source", sourceId);
  } else {
    console.log("REUSING source", sourceId);
  }

  const updates: { id: string; field: string; notes: string }[] = [
    { id: EMPLOYER_ID, field: "employer_contribution_pct", notes: EMPLOYER_NOTE },
    { id: EMPLOYEE_ID, field: "employee_contribution_pct", notes: EMPLOYEE_NOTE },
  ];

  for (const row of updates) {
    const { error } = await supabase
      .from("benefit_entries")
      .update({
        source_id: sourceId,
        notes: row.notes,
        fiscal_year_or_effective_date: "FY2024",
        publish_status: "published",
        verified_by: ACTOR,
      })
      .eq("entry_id", row.id);
    if (error) throw new Error(`${row.field}: ${error.message}`);

    await supabase.from("verification_log").insert({
      entry_id: row.id,
      action: "corrected",
      actor: ACTOR,
      detail: `Retargeted ${row.field} to 2024 AR p.155 Defined contribution plans. Replaced incorrect provenance note.`,
    });
    console.log(`UPDATED  ${row.field} → 2024 AR p.155 (still published)`);
  }

  for (const who of ["employer", "employee"] as const) {
    const key = `${who}_contribution_pct`;
    const { error } = await supabase
      .from("benefit_field_registry")
      .update({ description: contributionPctRegistryDescription(who) })
      .eq("category", "retirement")
      .eq("field_key", key);
    if (error) throw new Error(`registry ${key}: ${error.message}`);
    console.log(`UPDATED  registry ${key} description`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
