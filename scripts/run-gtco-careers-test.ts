/**
 * GTCO careers-page reconciliation test with pasted benefit text (Session 2 validation).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAREERS_URL = "https://www.gtcoplc.com/who-we-are/careers";

/** Representative careers-page benefits prose (lower trust than annual report). */
const CAREERS_PASTE = `
Working at GTCO — Employee Benefits

We offer a competitive rewards package for our people, including:
- Pension: the Company contributes 10% of basic salary to your Retirement Savings Account; employees contribute 8%.
- Group life insurance cover of three times (3x) annual emoluments for all permanent staff.
- Comprehensive medical cover through our HMO for employees and immediate family.
- 25 working days annual leave per year.
- Gratuity and terminal benefits on retirement.
- Access to our on-site gymnasium and wellness programmes.
- Employee Assistance Programme for counselling and emotional support.
`.trim();

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

  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name, country")
    .eq("exchange_ticker", "GTCO")
    .single();

  if (!company) throw new Error("GTCO company not found");

  const { data: mod } = await supabase.from("country_modules").select("*").eq("country_code", company.country).single();

  const { loadFieldRegistry } = await import("../lib/repository/field-registry");
  const { extractBenefitsFromSource } = await import("../lib/repository/extract-benefits");
  const { saveSourceAndEntries } = await import("../lib/repository/save-source");

  const registryRows = await loadFieldRegistry(supabase);
  console.log("Extracting from pasted careers-page text…");

  const extracted = await extractBenefitsFromSource({
    companyName: company.name,
    countryModule: mod,
    registryRows,
    rawText: CAREERS_PASTE,
  });

  console.log(`Benefits: ${extracted.entries.length}, workforce: ${extracted.workforceComposition.length}`);
  for (const e of extracted.entries) {
    console.log(`  ${e.category}.${e.field} = ${e.value}`);
  }

  const saved = await saveSourceAndEntries(supabase, {
    companyId: company.company_id,
    source: {
      source_type: "careers_page",
      source_url: `${CAREERS_URL}#pasted-validation-v2`,
      source_title: "GTCO Careers (pasted validation v2)",
      country: company.country,
    },
    entries: extracted.entries,
    workforceComposition: extracted.workforceComposition,
    publish: true,
    actor: "careers-reconciliation-test",
    skipIfUrlExists: false,
  });

  console.log("\nSave results:");
  for (const r of saved.results) {
    console.log(`  ${r.action} → ${r.publish_status} (${r.entry_id || "n/a"})`);
  }

  const overlapFields = ["employer_contribution_pct", "group_life_coverage_multiple", "annual_leave_days"];
  for (const field of overlapFields) {
    const { data: rows } = await supabase
      .from("benefit_entries")
      .select("publish_status, source_trust_weight, sources!inner(source_type)")
      .eq("company_id", company.company_id)
      .eq("field", field)
      .in("publish_status", ["published", "pending_verification"]);

    console.log(`\n${field}:`);
    for (const row of rows ?? []) {
      const s = row.sources as { source_type?: string };
      console.log(`  ${row.publish_status} trust=${row.source_trust_weight} source=${s.source_type}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
