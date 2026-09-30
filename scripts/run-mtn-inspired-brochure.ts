/**
 * MTN Group (JSE:MTN) — "Inspired" rewards brochure for Group HQ joiners (mtn.com, Sep 2024).
 * Company-published recruitment/EVP material → careers_page (Guide 2 trust). Saved as pending
 * for row-by-row review; nothing is published by this script.
 *
 * Needs data/mtn-za-downloads/inspired-brochure.txt (text of the PDF at SOURCE_URL).
 * Usage: npx tsx scripts/run-mtn-inspired-brochure.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { extractBenefitsFromSource } from "../lib/repository/extract-benefits";
import { loadFieldRegistry } from "../lib/repository/field-registry";
import { saveSourceAndEntries } from "../lib/repository/save-source";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "mtn-inspired-brochure";
const SOURCE_URL = "https://www.mtn.com/wp-content/uploads/2024/09/Brochure.pdf";
const TEXT_FILE = path.join(root, "data", "mtn-za-downloads", "inspired-brochure.txt");

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
  const rawText = fs.readFileSync(TEXT_FILE, "utf8").replace(/Sensitivity: MTN Internal/g, "").trim();

  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name, country")
    .eq("exchange_ticker", "MTN")
    .eq("listing_exchange", "JSE")
    .single();
  if (!company) throw new Error("MTN Group not in DB");
  const { data: mod } = await supabase.from("country_modules").select("*").eq("country_code", company.country).single();

  const extracted = await extractBenefitsFromSource({
    companyName: company.name,
    countryModule: mod,
    registryRows: await loadFieldRegistry(supabase),
    rawText,
  });
  console.log(`Extracted ${extracted.entries.length} benefit rows, ${extracted.workforceComposition.length} workforce rows`);
  for (const e of extracted.entries) {
    console.log(`  ${e.category}.${e.field} = ${JSON.stringify(e.value)} [${e.value_type}, ${e.confidence_score}]`);
  }

  const saved = await saveSourceAndEntries(supabase, {
    companyId: company.company_id,
    source: {
      source_type: "careers_page",
      source_url: SOURCE_URL,
      source_title:
        "MTN 'Inspired' rewards brochure for Group HQ joiners (Sep 2024; marked 'MTN Internal', publicly hosted on mtn.com)",
      publication_date: "2024-09-01",
      country: company.country,
    },
    entries: extracted.entries,
    workforceComposition: extracted.workforceComposition,
    publish: false,
    actor: ACTOR,
    skipIfUrlExists: true,
  });
  if (saved.skipped) console.log("SKIP — source URL already saved");
  for (const r of saved.results) console.log(`  ${r.action} → ${r.publish_status} ${r.entry_id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
