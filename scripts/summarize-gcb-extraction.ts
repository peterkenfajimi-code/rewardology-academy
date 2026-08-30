/** List GCB benefit entries after extraction. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
    .select("company_id, name")
    .eq("exchange_ticker", "GCB")
    .single();

  const { data: entries } = await supabase
    .from("benefit_entries")
    .select(
      "category, field, value, value_type, confidence_score, confidence_was_clamped, publish_status, fiscal_year_or_effective_date, notes, sources(source_title)"
    )
    .eq("company_id", company!.company_id)
    .order("date_collected", { ascending: false });

  console.log(`GCB entries: ${entries?.length ?? 0}\n`);
  for (const e of entries ?? []) {
    const src = e.sources as { source_title?: string } | null;
    console.log(
      `${e.publish_status.padEnd(22)} ${e.category}.${e.field}`
    );
    console.log(`  value: ${e.value}`);
    console.log(`  type: ${e.value_type} | conf: ${e.confidence_score}${e.confidence_was_clamped ? " (clamped)" : ""} | fy: ${e.fiscal_year_or_effective_date ?? "—"}`);
    if (e.notes) console.log(`  notes: ${e.notes}`);
    console.log(`  source: ${src?.source_title ?? "?"}`);
    console.log("");
  }
}

main().catch(console.error);
