/** Quick post-validation DB check */
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

  const { data: gtco } = await supabase
    .from("companies")
    .select("company_id")
    .eq("exchange_ticker", "GTCO")
    .single();

  const { data: pending } = await supabase
    .from("benefit_entries")
    .select("category, field, publish_status, source_trust_weight, sources(source_type)")
    .eq("company_id", gtco!.company_id)
    .eq("publish_status", "pending_verification");

  const { data: bySource } = await supabase
    .from("benefit_entries")
    .select("category, field, publish_status, sources(source_type)")
    .eq("company_id", gtco!.company_id);

  const careers = (bySource ?? []).filter((r) => {
    const s = r.sources as { source_type?: string };
    return s.source_type === "careers_page";
  });

  console.log("GTCO pending_verification:", pending?.length ?? 0);
  for (const row of pending ?? []) {
    const s = row.sources as { source_type?: string };
    console.log(`  ${row.category}.${row.field} (${s.source_type}, trust=${row.source_trust_weight})`);
  }

  console.log("\nGTCO careers_page entries:", careers.length);
  for (const row of careers) {
    console.log(`  ${row.category}.${row.field} → ${row.publish_status}`);
  }

  const { count: pubCount } = await supabase
    .from("benefit_entries")
    .select("entry_id", { count: "exact", head: true })
    .eq("publish_status", "published");

  console.log("\nTotal published (all companies):", pubCount);
}

main().catch(console.error);
