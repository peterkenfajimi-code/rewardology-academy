/**
 * Wipe GTCO benefit_entries and sources for a clean re-extract (Session 2).
 * Keeps the companies row intact.
 *
 * Usage: npx tsx scripts/wipe-gtco-entries.ts [--confirm]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const CANONICAL_TICKER = "GTCO";

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

async function main() {
  loadEnvLocal();
  const confirm = process.argv.includes("--confirm");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("company_id, name, exchange_ticker")
    .eq("exchange_ticker", CANONICAL_TICKER)
    .maybeSingle();

  if (companyError || !company) {
    throw new Error(companyError?.message ?? `Could not find company with ticker ${CANONICAL_TICKER}`);
  }

  const { count: entryCount } = await supabase
    .from("benefit_entries")
    .select("entry_id", { count: "exact", head: true })
    .eq("company_id", company.company_id);

  const { count: sourceCount } = await supabase
    .from("sources")
    .select("source_id", { count: "exact", head: true })
    .eq("company_id", company.company_id);

  console.log(`Company: ${company.name} (${company.company_id})`);
  console.log(`benefit_entries to delete: ${entryCount ?? 0}`);
  console.log(`sources to delete: ${sourceCount ?? 0}`);

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to delete.");
    return;
  }

  const { data: entryIds } = await supabase
    .from("benefit_entries")
    .select("entry_id")
    .eq("company_id", company.company_id);

  const ids = (entryIds ?? []).map((row) => row.entry_id);
  if (ids.length) {
    const { error: logError } = await supabase.from("verification_log").delete().in("entry_id", ids);
    if (logError) throw new Error(`verification_log: ${logError.message}`);
  }

  const { error: entriesError } = await supabase
    .from("benefit_entries")
    .delete()
    .eq("company_id", company.company_id);
  if (entriesError) throw new Error(entriesError.message);

  const { error: sourcesError } = await supabase
    .from("sources")
    .delete()
    .eq("company_id", company.company_id);
  if (sourcesError) throw new Error(sourcesError.message);

  console.log("GTCO entries and sources wiped. Company row retained.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
