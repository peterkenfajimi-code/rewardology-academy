/**
 * Hand-seed Scancom PLC (MTN Ghana) FY2024 annual report — fifth company,
 * identity-isolated from MTN Group Ltd (JSE:MTN).
 *
 * Usage: node scripts/run-mtngh-extraction.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { companySlug } from "../lib/repository/company-slug";
import { extractBenefitsFromSource } from "../lib/repository/extract-benefits";
import { loadFieldRegistry } from "../lib/repository/field-registry";
import { saveSourceAndEntries } from "../lib/repository/save-source";
import type { CountryModule } from "../lib/repository/types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPANY_NAME = "Scancom PLC (MTN Ghana)";
const SOURCE_URL = "https://mtn.com.gh/wp-content/uploads/2025/03/MTNGH-2024-Annual-Report-vf.pdf";
const DEFAULT_LOCAL_PDF = path.join(root, "data", "mtn-ghana-downloads", "mtngh-2024-annual-report.pdf");

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

async function upsertMtngh(supabase: ReturnType<typeof createClient>) {
  const { data: existing } = await supabase
    .from("companies")
    .select("company_id, name, country, exchange_ticker, listing_exchange, slug")
    .eq("exchange_ticker", "MTNGH")
    .eq("listing_exchange", "GSE")
    .maybeSingle();

  if (existing) {
    const slug = existing.slug?.trim() || companySlug(existing.name, existing.country);
    if (!existing.slug?.trim()) {
      await supabase.from("companies").update({ slug }).eq("company_id", existing.company_id);
    }
    return { ...existing, slug };
  }

  const { data: mtnZa } = await supabase
    .from("companies")
    .select("company_id, name, country, exchange_ticker, listing_exchange")
    .eq("exchange_ticker", "MTN")
    .eq("listing_exchange", "JSE")
    .maybeSingle();
  if (mtnZa) {
    console.log(`Identity check: MTN ZA remains ${mtnZa.name} ${mtnZa.listing_exchange}:${mtnZa.exchange_ticker} (${mtnZa.company_id})`);
  } else {
    console.log("Identity check: no JSE:MTN row in DB yet (seed exists in data/jse-companies-seed.json)");
  }

  const slug = companySlug(COMPANY_NAME, "GH");
  const { data: inserted, error } = await supabase
    .from("companies")
    .insert({
      name: COMPANY_NAME,
      country: "GH",
      industry: "ICT",
      listed_status: "listed",
      exchange_ticker: "MTNGH",
      listing_exchange: "GSE",
      slug,
      last_reviewed_at: new Date().toISOString(),
    })
    .select("company_id, name, country, exchange_ticker, listing_exchange, slug")
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Could not create MTN Ghana company");
  console.log(`INSERTED ${inserted.name} ${inserted.listing_exchange}:${inserted.exchange_ticker} slug=${inserted.slug}`);
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
  const localPdfPath = fs.existsSync(DEFAULT_LOCAL_PDF) ? DEFAULT_LOCAL_PDF : "";
  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const company = await upsertMtngh(supabase);
  const zaSlug = companySlug("MTN Group Ltd", "ZA");
  if (company.slug === zaSlug) {
    throw new Error(`Slug collision with MTN ZA: ${company.slug}`);
  }
  console.log(`Ghana slug ${company.slug} ≠ ZA slug ${zaSlug}`);

  const countryModule = await loadCountryModule(supabase);
  const registryRows = await loadFieldRegistry(supabase);

  console.log(`Source: ${SOURCE_URL}`);
  if (localPdfPath) console.log(`Local PDF: ${localPdfPath}`);
  console.log("Extracting…");

  const extracted = await extractBenefitsFromSource({
    companyName: company.name,
    countryModule,
    registryRows,
    sourceUrl: localPdfPath ? undefined : SOURCE_URL,
    localPdfPath: localPdfPath || undefined,
  });

  console.log(
    `Extracted ${extracted.entries.length} benefit entries, ${extracted.workforceComposition.length} workforce rows (${extracted.sourceMode}, ${extracted.pageCount ?? "?"} pages)`
  );
  for (const e of extracted.entries) {
    console.log(`  ${e.category}.${e.field} = ${JSON.stringify(e.value)} [${e.confidence_score}] (${e.value_type})`);
  }

  if (!extracted.entries.length && !extracted.workforceComposition.length) {
    console.log("Nothing to save.");
    return;
  }

  const saved = await saveSourceAndEntries(supabase, {
    companyId: company.company_id,
    source: {
      source_type: "annual_report",
      source_url: SOURCE_URL,
      source_title: "Scancom PLC (MTN Ghana) 2024 Annual Report",
      publication_date: "2024-12-31",
      country: "GH",
    },
    entries: extracted.entries,
    workforceComposition: extracted.workforceComposition,
    publish: false,
    actor: "mtngh-hand-seed",
    skipIfUrlExists: false,
  });

  if (saved.skipped) {
    console.log("Source URL already exists — skipped save.");
    return;
  }

  console.log(`\nSaved pending_verification (${saved.results.length} result rows). Review before publish.`);
  for (const r of saved.results) {
    if (r.action === "unmapped_queued" || r.action === "registry_rejected") continue;
    console.log(`  ${r.action} → ${r.publish_status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
