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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: companies } = await supabase
    .from("companies")
    .select("company_id, name, exchange_ticker, country, industry");

  const { data: rejected } = await supabase
    .from("benefit_entries")
    .select(
      "entry_id, category, field, value, publish_status, companies(name, exchange_ticker), sources(source_type, source_url, publication_date)"
    )
    .eq("publish_status", "rejected");

  const { data: active } = await supabase
    .from("benefit_entries")
    .select(
      "entry_id, category, field, value, publish_status, companies(name, exchange_ticker), sources(source_type, source_url, publication_date)"
    )
    .in("publish_status", ["published", "pending_verification"]);

  const gtco = companies?.find((c) => c.exchange_ticker === "GTCO");

  const gtcoRejected = (rejected ?? []).filter(
    (e) => (e.companies as { exchange_ticker?: string })?.exchange_ticker === "GTCO"
  );
  const gtcoActive = (active ?? []).filter(
    (e) => (e.companies as { exchange_ticker?: string })?.exchange_ticker === "GTCO"
  );

  const byCompany = new Map<string, { name: string; ticker: string | null; count: number }>();
  for (const e of active ?? []) {
    const co = e.companies as { name: string; exchange_ticker: string | null };
    const id = (e as { company_id?: string }).company_id;
    const key = co.name;
    const prev = byCompany.get(key) ?? { name: co.name, ticker: co.exchange_ticker, count: 0 };
    prev.count += 1;
    byCompany.set(key, prev);
  }

  // recount with company_id join
  const counts: Record<string, number> = {};
  for (const c of companies ?? []) {
    counts[c.name] = (active ?? []).filter((e) => {
      const co = e.companies as { name: string };
      return co.name === c.name;
    }).length;
  }

  console.log(JSON.stringify({ gtcoRejected, gtcoActive, companyCounts: counts, companies }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
