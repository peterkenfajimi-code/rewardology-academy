/**
 * Session 2 validation: re-extract GTCO + one ZA company (MTN), then print summary.
 *
 * Usage: npx tsx scripts/run-session2-validation.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (!process.env[key]) process.env[key] = t.slice(i + 1).trim();
  }
}

async function printSummary(supabase: ReturnType<typeof createClient>, label: string, ticker: string) {
  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name, country, exchange_ticker")
    .eq("exchange_ticker", ticker)
    .maybeSingle();

  if (!company) {
    console.log(`\n${label}: company ${ticker} not found`);
    return;
  }

  const { data: entries } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, publish_status, source_trust_weight, confidence_score, confidence_was_clamped")
    .eq("company_id", company.company_id)
    .order("category")
    .order("field");

  const byStatus = new Map<string, number>();
  for (const row of entries ?? []) {
    byStatus.set(row.publish_status, (byStatus.get(row.publish_status) ?? 0) + 1);
  }

  console.log(`\n=== ${label}: ${company.name} (${ticker}) ===`);
  console.log(`Country: ${company.country}`);
  console.log(`Total entries: ${entries?.length ?? 0}`);
  console.log("By status:", Object.fromEntries(byStatus));

  const published = (entries ?? []).filter((e) => e.publish_status === "published");
  const pending = (entries ?? []).filter((e) => e.publish_status === "pending_verification");
  const clamped = (entries ?? []).filter((e) => e.confidence_was_clamped);

  if (pending.length) {
    console.log(`Pending verification (${pending.length}) — reconciliation holding lower-trust sources:`);
    for (const row of pending.slice(0, 8)) {
      console.log(`  ${row.category}.${row.field} trust=${row.source_trust_weight} conf=${row.confidence_score}`);
    }
    if (pending.length > 8) console.log(`  … and ${pending.length - 8} more`);
  }

  if (clamped.length) {
    console.log(`Confidence clamped (${clamped.length}):`);
    for (const row of clamped.slice(0, 5)) {
      console.log(`  ${row.category}.${row.field}`);
    }
  }

  console.log(`Published fields (${published.length}):`);
  for (const row of published.slice(0, 12)) {
    console.log(`  ${row.category}.${row.field} = ${row.value?.slice(0, 60) ?? "null"}`);
  }
  if (published.length > 12) console.log(`  … and ${published.length - 12} more`);
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL;
  const key = process.env.REPOSITORY_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Missing repository Supabase env vars");
  if (!process.env.ANTHROPIC_API_KEY?.trim()) throw new Error("Missing ANTHROPIC_API_KEY");

  const { runBenefitsRepositoryBatch } = await import("../lib/repository/batch-runner");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log("\n--- Phase 1: GTCO full re-extract (publish) ---\n");
  const gtco = await runBenefitsRepositoryBatch(
    supabase,
    {
      tickers: ["GTCO"],
      exchanges: ["NGX"],
      publish: true,
      skipExistingSources: false,
      delayMs: 2500,
      maxPdfPerType: 3,
      actor: "session2-validation",
    },
    (progress) => {
      process.stdout.write(
        `\rGTCO sources ${progress.sourcesProcessed} | entries saved ${progress.entriesSaved} | errors ${progress.errors}   `
      );
    }
  );
  console.log("\nGTCO batch done:", JSON.stringify(gtco.progress));

  console.log("\n--- Phase 2: MTN (ZA) validation extract (publish) ---\n");
  const mtn = await runBenefitsRepositoryBatch(
    supabase,
    {
      tickers: ["MTN"],
      countries: ["ZA"],
      exchanges: ["JSE"],
      publish: true,
      skipExistingSources: false,
      delayMs: 2500,
      maxPdfPerType: 2,
      maxCompanies: 1,
      actor: "session2-validation",
    },
    (progress) => {
      process.stdout.write(
        `\rMTN sources ${progress.sourcesProcessed} | entries saved ${progress.entriesSaved} | errors ${progress.errors}   `
      );
    }
  );
  console.log("\nMTN batch done:", JSON.stringify(mtn.progress));

  await printSummary(supabase, "GTCO", "GTCO");
  await printSummary(supabase, "MTN ZA validation", "MTN");

  const { data: zaModule } = await supabase
    .from("country_modules")
    .select("country_name, pension_statutory_employer_pct, pension_statutory_employee_pct, pension_scheme_type")
    .eq("country_code", "ZA")
    .maybeSingle();

  console.log("\n=== ZA country module (null pension check) ===");
  console.log(JSON.stringify(zaModule, null, 2));
  console.log(
    zaModule?.pension_statutory_employer_pct == null
      ? "PASS: ZA employer pension is null — UI should show 'No statutory minimum'"
      : "NOTE: ZA employer pension has a numeric value"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
