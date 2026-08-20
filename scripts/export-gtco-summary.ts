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

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!;
  const key = process.env.REPOSITORY_SUPABASE_SERVICE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name, exchange_ticker, country")
    .eq("exchange_ticker", "GTCO")
    .maybeSingle();

  if (!company) {
    console.error("GTCO company not found");
    process.exit(1);
  }

  const { data: sources } = await supabase
    .from("sources")
    .select("source_id, source_type, source_url, source_title, publication_date")
    .eq("company_id", company.company_id)
    .order("source_type");

  const { data: entries } = await supabase
    .from("benefit_entries")
    .select(
      "entry_id, category, field, value, value_type, confidence_score, publish_status, source_trust_weight, date_collected, sources(source_type, source_url, source_title)"
    )
    .eq("company_id", company.company_id)
    .in("publish_status", ["published", "pending_verification"])
    .order("category")
    .order("field");

  console.log(JSON.stringify({ company, sources, entries }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
