/** Summarize Safaricom extraction for Kenya multi-tier review */
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
    .select("company_id, name, country, exchange_ticker, slug")
    .eq("exchange_ticker", "SCOM")
    .maybeSingle();

  if (!company) {
    console.log("No Safaricom company row found");
    return;
  }

  console.log("Company:", company);

  const { data: entries } = await supabase
    .from("benefit_entries")
    .select(
      "category, field, value, value_type, confidence_score, confidence_was_clamped, publish_status, fiscal_year_or_effective_date, sources(source_type, source_title, source_url)"
    )
    .eq("company_id", company.company_id)
    .order("category")
    .order("field");

  const byStatus = new Map<string, number>();
  for (const e of entries ?? []) {
    byStatus.set(e.publish_status, (byStatus.get(e.publish_status) ?? 0) + 1);
  }
  console.log("\nStatus counts:", Object.fromEntries(byStatus));
  console.log(`Total entries: ${entries?.length ?? 0}\n`);

  const retirement = (entries ?? []).filter((e) => e.category === "retirement");
  console.log("=== RETIREMENT (Kenya watch list) ===");
  for (const e of retirement) {
    const src = e.sources as { source_type?: string; source_title?: string } | null;
    console.log(
      `- ${e.field} | ${e.value_type} | conf=${e.confidence_score}${e.confidence_was_clamped ? " (clamped)" : ""} | ${e.publish_status} | fy=${e.fiscal_year_or_effective_date}`
    );
    console.log(`  value: ${e.value}`);
    console.log(`  source: ${src?.source_type} — ${src?.source_title ?? ""}`);
  }

  console.log("\n=== ALL FIELDS ===");
  for (const e of entries ?? []) {
    const src = e.sources as { source_type?: string } | null;
    console.log(
      `${e.category}.${e.field} = ${JSON.stringify(e.value)} [${e.confidence_score}${e.confidence_was_clamped ? "*" : ""}] (${e.publish_status}, ${src?.source_type})`
    );
  }
}

main().catch(console.error);
