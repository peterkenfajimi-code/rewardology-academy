/**
 * Merge duplicate manual GTCO company into canonical Guaranty Trust Holding Company Plc.
 *
 * Usage: npx tsx scripts/merge-duplicate-gtco-company.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DUPLICATE_NAME = "CompanyGuaranty Trust Holding Company";
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

function normalizeValue(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

async function main() {
  loadEnvLocal();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: duplicate } = await supabase
    .from("companies")
    .select("company_id, name")
    .eq("name", DUPLICATE_NAME)
    .maybeSingle();

  const { data: canonical } = await supabase
    .from("companies")
    .select("company_id, name, exchange_ticker")
    .eq("exchange_ticker", CANONICAL_TICKER)
    .maybeSingle();

  if (!duplicate || !canonical) {
    throw new Error("Could not find duplicate and/or canonical GTCO company rows");
  }

  console.log(`Duplicate: ${duplicate.name} (${duplicate.company_id})`);
  console.log(`Canonical: ${canonical.name} (${canonical.company_id})\n`);

  const { data: dupEntries } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, publish_status")
    .eq("company_id", duplicate.company_id)
    .in("publish_status", ["published", "pending_verification"]);

  const { data: mainEntries } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value")
    .eq("company_id", canonical.company_id)
    .in("publish_status", ["published", "pending_verification"]);

  const mainByField = new Map(
    (mainEntries ?? []).map((e) => [`${e.category}::${e.field}`, e])
  );

  let rejected = 0;
  let moved = 0;

  for (const entry of dupEntries ?? []) {
    const key = `${entry.category}::${entry.field}`;
    const existing = mainByField.get(key);

    if (existing && normalizeValue(existing.value) === normalizeValue(entry.value)) {
      await supabase
        .from("benefit_entries")
        .update({ publish_status: "rejected" })
        .eq("entry_id", entry.entry_id);
      await supabase.from("verification_log").insert({
        entry_id: entry.entry_id,
        action: "reconciled",
        actor: "merge-duplicate-gtco",
        detail: `Duplicate of canonical GTCO entry ${existing.entry_id}`,
      });
      console.log(`REJECT duplicate  ${entry.category}.${entry.field}`);
      rejected += 1;
      continue;
    }

    if (existing) {
      await supabase
        .from("benefit_entries")
        .update({ publish_status: "rejected" })
        .eq("entry_id", entry.entry_id);
      await supabase.from("verification_log").insert({
        entry_id: entry.entry_id,
        action: "reconciled",
        actor: "merge-duplicate-gtco",
        detail: `Superseded by canonical GTCO entry ${existing.entry_id}`,
      });
      console.log(`REJECT conflict  ${entry.category}.${entry.field} (canonical kept)`);
      rejected += 1;
      continue;
    }

    await supabase
      .from("benefit_entries")
      .update({ company_id: canonical.company_id })
      .eq("entry_id", entry.entry_id);
    await supabase.from("verification_log").insert({
      entry_id: entry.entry_id,
      action: "reconciled",
      actor: "merge-duplicate-gtco",
      detail: `Moved to canonical GTCO company ${canonical.company_id}`,
    });
    console.log(`MOVE  ${entry.category}.${entry.field}`);
    moved += 1;
  }

  await supabase
    .from("sources")
    .update({ company_id: canonical.company_id })
    .eq("company_id", duplicate.company_id);

  const { error: reassignError } = await supabase
    .from("benefit_entries")
    .update({ company_id: canonical.company_id })
    .eq("company_id", duplicate.company_id);

  if (reassignError) {
    throw new Error(`Could not reassign remaining entries: ${reassignError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("companies")
    .delete()
    .eq("company_id", duplicate.company_id);

  if (deleteError) {
    throw new Error(`Could not delete duplicate company: ${deleteError.message}`);
  }

  console.log(`\nDone — rejected ${rejected}, moved ${moved}, deleted duplicate company.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
