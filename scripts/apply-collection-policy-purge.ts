/**
 * Purge excluded benefit fields and entries tied to sources outside the 3-year window.
 *
 * Usage: npx tsx scripts/apply-collection-policy-purge.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import {
  EXCLUDED_BENEFIT_FIELDS,
  isEntryWithinRecencyWindow,
  isExcludedBenefitField,
  recencyCutoffYear,
} from "../lib/repository/collection-policy";

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

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!;
  const key = process.env.REPOSITORY_SUPABASE_SERVICE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const cutoffYear = recencyCutoffYear();
  console.log(`Collection policy purge — excluding ${EXCLUDED_BENEFIT_FIELDS.size} field types`);
  console.log(`Recency cutoff: publication/fiscal year >= ${cutoffYear}\n`);

  const { data: rows, error } = await supabase
    .from("benefit_entries")
    .select(
      `
      entry_id, field, value_type, fiscal_year_or_effective_date, publish_status,
      companies ( name, exchange_ticker ),
      sources ( publication_date, source_url, source_title )
    `
    )
    .in("publish_status", ["published", "pending_verification"]);

  if (error) throw new Error(error.message);

  const toReject: string[] = [];
  for (const row of rows ?? []) {
    const source = row.sources as {
      publication_date?: string | null;
      source_url?: string | null;
      source_title?: string | null;
    } | null;
    const company = row.companies as { name?: string; exchange_ticker?: string | null } | null;

    if (isExcludedBenefitField(row.field)) {
      toReject.push(row.entry_id);
      console.log(`EXCLUDED FIELD  ${company?.exchange_ticker ?? "?"}  ${row.field}`);
      continue;
    }

    if (source && !isEntryWithinRecencyWindow(row, source)) {
      toReject.push(row.entry_id);
      console.log(`STALE SOURCE    ${company?.exchange_ticker ?? "?"}  ${row.field}`);
    }
  }

  const unique = [...new Set(toReject)];
  console.log(`\nRejecting ${unique.length} entries...`);

  if (!unique.length) {
    console.log("Nothing to purge.");
    return;
  }

  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);
    const { error: updateError } = await supabase
      .from("benefit_entries")
      .update({ publish_status: "rejected" })
      .in("entry_id", chunk);
    if (updateError) throw new Error(updateError.message);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
