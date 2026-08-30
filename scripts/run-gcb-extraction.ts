/**
 * Hand-seed GCB Bank PLC FY2024 annual report and extract to pending_verification.
 * Usage: npx tsx scripts/run-gcb-extraction.ts [sourceUrl]
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
const DEFAULT_URL =
  "https://www.gcbbank.com.gh/downloadable-reports/437-2024-annual-report/file";
const FALLBACK_PAGE_URL =
  "https://www.gcbbank.com.gh/downloadable-reports/437-2024-annual-report";
const DEFAULT_LOCAL_PDF = path.join(root, "data", "gcb-downloads", "gcb-2024-annual-report.pdf");

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

async function upsertGcb(supabase: ReturnType<typeof createClient>) {
  const { data: existing } = await supabase
    .from("companies")
    .select("company_id, name, country")
    .eq("exchange_ticker", "GCB")
    .eq("listing_exchange", "GSE")
    .maybeSingle();

  if (existing) return existing;

  const { data: inserted, error } = await supabase
    .from("companies")
    .insert({
      name: "GCB Bank PLC",
      country: "GH",
      industry: "Financial Services",
      listed_status: "listed",
      exchange_ticker: "GCB",
      listing_exchange: "GSE",
      last_reviewed_at: new Date().toISOString(),
    })
    .select("company_id, name, country")
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Could not create GCB company");
  return inserted;
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
  const urlArg = process.argv.find((a) => a.startsWith("http"));
  const sourceUrl = urlArg ?? DEFAULT_URL;
  const localPdfPath = localPdfArg || (fs.existsSync(DEFAULT_LOCAL_PDF) ? DEFAULT_LOCAL_PDF : "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const company = await upsertGcb(supabase);
  const countryModule = await loadCountryModule(supabase);
  const registryRows = await loadFieldRegistry(supabase);

  console.log(`Company: ${company.name} (${company.company_id})`);
  console.log(`Source: ${sourceUrl}`);
  if (localPdfPath) console.log(`Local PDF: ${localPdfPath}`);
  console.log("Extracting…");

  const extracted = await extractBenefitsFromSource({
    companyName: company.name,
    countryModule,
    registryRows,
    sourceUrl,
    localPdfPath: localPdfPath || undefined,
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
      source_url: sourceUrl,
      source_title: "GCB Bank PLC 2024 Annual Report",
      publication_date: "2025-04-01",
      country: "GH",
    },
    entries: extracted.entries,
    workforceComposition: extracted.workforceComposition,
    publish: false,
    actor: "gcb-hand-seed",
    skipIfUrlExists: false,
  });

  if (saved.skipped) {
    console.log("Source URL already exists — skipped save.");
    return;
  }

  console.log(`Canonical source page: ${FALLBACK_PAGE_URL}`);

  const inserted = saved.results.filter(
    (r) =>
      r.action === "inserted" ||
      r.action === "superseded_conflict" ||
      r.action === "value_type_mismatch"
  ).length;

  console.log(`\nSaved ${inserted} entries (pending_verification unless value_type_mismatch).`);
  for (const r of saved.results) {
    if (r.action === "unmapped_skipped" || r.action === "registry_rejected") continue;
    console.log(`  ${r.action} → ${r.publish_status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
