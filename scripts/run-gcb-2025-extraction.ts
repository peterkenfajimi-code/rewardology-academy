/**
 * Guide 1 — GCB Bank PLC FY2025 annual report extract to pending_verification.
 * Local PDF: data/gcb-downloads/gcb-2025-annual-report.pdf (gitignored).
 *
 * Usage: npx tsx scripts/run-gcb-2025-extraction.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { extractBenefitsFromSource } from "../lib/repository/extract-benefits";
import { loadFieldRegistry } from "../lib/repository/field-registry";
import { saveSourceAndEntries } from "../lib/repository/save-source";
import type { CountryModule } from "../lib/repository/types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_URL = "https://www.gcbbank.com.gh/group-results-and-reporting/462-2025-annual-report";
const FILE_URL = `${PAGE_URL}/file`;
const DEFAULT_LOCAL_PDF = path.join(root, "data", "gcb-downloads", "gcb-2025-annual-report.pdf");

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

async function loadCountryModule(
  supabase: ReturnType<typeof createClient>
): Promise<CountryModule | null> {
  const { data } = await supabase
    .from("country_modules")
    .select(
      "country_code, country_name, currency_code, pension_regulator, pension_statutory_employer_pct, pension_statutory_employee_pct, pension_scheme_type, notes"
    )
    .eq("country_code", "GH")
    .maybeSingle();
  return (data as CountryModule | null) ?? null;
}

async function main() {
  loadEnvLocal();
  const localPdfArg = process.argv.find((a) => a.startsWith("--local-pdf="))?.slice("--local-pdf=".length);
  const localPdfPath = localPdfArg || (fs.existsSync(DEFAULT_LOCAL_PDF) ? DEFAULT_LOCAL_PDF : "");
  if (!localPdfPath) {
    throw new Error("Missing local PDF. Run: node scripts/download-gcb-2025-report.mjs");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name, country")
    .eq("exchange_ticker", "GCB")
    .eq("listing_exchange", "GSE")
    .single();
  if (!company) throw new Error("GCB company not found");

  const countryModule = await loadCountryModule(supabase);
  const registryRows = await loadFieldRegistry(supabase);

  console.log(`Company: ${company.name} (${company.company_id})`);
  console.log(`Source page: ${PAGE_URL}`);
  console.log(`Local PDF: ${localPdfPath}`);
  console.log("Extracting…");

  const extracted = await extractBenefitsFromSource({
    companyName: company.name,
    countryModule,
    registryRows,
    sourceUrl: FILE_URL,
    localPdfPath,
  });

  console.log(
    `Extracted ${extracted.entries.length} benefit entries, ${extracted.workforceComposition.length} workforce rows (${extracted.sourceMode}, ${extracted.pageCount ?? "?"} pages)`
  );

  if (!extracted.entries.length && !extracted.workforceComposition.length) {
    console.log("Nothing to save.");
    return;
  }

  for (const e of extracted.entries) {
    console.log(`  ${e.category}.${e.field} = ${JSON.stringify(e.value)} [${e.confidence_score}] (${e.value_type})`);
  }

  const saved = await saveSourceAndEntries(supabase, {
    companyId: company.company_id,
    source: {
      source_type: "annual_report",
      source_url: PAGE_URL,
      source_title: "GCB Bank PLC 2025 Annual Report",
      publication_date: "2026-03-26",
      country: "GH",
    },
    entries: extracted.entries,
    workforceComposition: extracted.workforceComposition,
    publish: false,
    actor: "gcb-2025-guide1",
    skipIfUrlExists: true,
  });

  if (saved.skipped) {
    console.log("Source URL already exists — skipped save.");
    return;
  }

  const inserted = saved.results.filter(
    (r) =>
      r.action === "inserted" ||
      r.action === "superseded_conflict" ||
      r.action === "value_type_mismatch"
  ).length;

  console.log(`\nSaved ${inserted} entries (pending_verification unless value_type_mismatch).`);
  for (const r of saved.results) {
    if (r.action === "unmapped_queued" || r.action === "registry_rejected") continue;
    console.log(`  ${r.action} → ${r.publish_status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
