/**
 * GCB Guide 2 — careers-page extraction + reconciliation against Guide 1 AR facts.
 * Prefers data/gcb-downloads/careers.txt from scripts/fetch-gcb-careers.mjs.
 *
 * Usage: node scripts/run-gcb-careers-test.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { extractBenefitsFromSource } from "../lib/repository/extract-benefits";
import { loadFieldRegistry } from "../lib/repository/field-registry";
import { saveSourceAndEntries } from "../lib/repository/save-source";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAREERS_URL = "https://www.gcbbank.com.gh/careers";
const LOCAL_TEXT = path.join(root, "data", "gcb-downloads", "careers.txt");
const ACTOR = "gcb-careers-reconciliation-test";

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

function loadCareersText(): string {
  if (!fs.existsSync(LOCAL_TEXT)) {
    throw new Error(`Missing ${LOCAL_TEXT} — run: node scripts/fetch-gcb-careers.mjs`);
  }
  const raw = fs.readFileSync(LOCAL_TEXT, "utf8").trim();
  if (/404\s*-\s*article not found/i.test(raw)) {
    throw new Error(
      "GCB /careers is a 404 and is not in the public nav. Guide 2 has no benefits-bearing careers page to extract."
    );
  }
  const stripped = raw.replace(/^https?:\/\/\S+\s*/i, "").trim();
  if (stripped.length < 80) throw new Error("Careers text too short");
  return stripped;
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
    .eq("exchange_ticker", "GCB")
    .eq("listing_exchange", "GSE")
    .single();
  if (!company) throw new Error("GCB company not found");

  const { data: mod } = await supabase.from("country_modules").select("*").eq("country_code", "GH").single();
  const registryRows = await loadFieldRegistry(supabase);
  const rawText = loadCareersText();

  console.log(`Company: ${company.name}`);
  console.log(`Careers text: ${rawText.length} chars`);
  console.log("Extracting…");

  const extracted = await extractBenefitsFromSource({
    companyName: company.name,
    countryModule: mod,
    registryRows,
    rawText,
  });

  console.log(`Benefits: ${extracted.entries.length}, workforce: ${extracted.workforceComposition.length}`);
  for (const e of extracted.entries) {
    console.log(`  ${e.category}.${e.field} = ${JSON.stringify(e.value)} [${e.confidence_score}]`);
  }

  const saved = await saveSourceAndEntries(supabase, {
    companyId: company.company_id,
    source: {
      source_type: "careers_page",
      source_url: `${CAREERS_URL}#pasted-validation-v1`,
      source_title: "GCB Careers (pasted validation v1)",
      country: "GH",
    },
    entries: extracted.entries,
    workforceComposition: extracted.workforceComposition,
    publish: true,
    actor: ACTOR,
    skipIfUrlExists: false,
  });

  console.log("\nSave results:");
  for (const r of saved.results) {
    console.log(`  ${r.action} → ${r.publish_status} (${r.entry_id || "n/a"})`);
  }

  const overlapFields = [
    "employer_contribution_pct",
    "employee_contribution_pct",
    "tier2_employer_contribution_pct",
    "defined_benefit_plan_exists",
    "defined_benefit_plan_status",
    "hmo_scope",
    "annual_leave_days",
    "group_life_coverage_multiple",
  ];
  for (const field of overlapFields) {
    const { data: rows } = await supabase
      .from("benefit_entries")
      .select("value, publish_status, source_trust_weight, sources!inner(source_type)")
      .eq("company_id", company.company_id)
      .eq("field", field)
      .in("publish_status", ["published", "pending_verification"]);

    if (!rows?.length) continue;
    console.log(`\n${field}:`);
    for (const row of rows) {
      const s = row.sources as { source_type?: string };
      console.log(
        `  ${row.publish_status} trust=${row.source_trust_weight} source=${s.source_type} value=${JSON.stringify(row.value)}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
