/** Fix GTCO non_discrimination_policy to compliance_status Yes/No. */
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
    .select("company_id")
    .eq("exchange_ticker", "GTCO")
    .single();

  const { data: row } = await supabase
    .from("benefit_entries")
    .select("entry_id, value")
    .eq("company_id", company!.company_id)
    .eq("field", "non_discrimination_policy")
    .eq("publish_status", "published")
    .maybeSingle();

  if (!row) {
    console.log("No GTCO non_discrimination_policy entry.");
    return;
  }

  console.log(`Before: ${row.value?.slice(0, 80)}…`);
  await supabase
    .from("benefit_entries")
    .update({
      value: "Yes",
      value_type: "compliance_status",
      notes: "Normalized from narrative policy text to compliance_status Yes per field registry.",
    })
    .eq("entry_id", row.entry_id);
  console.log("After: Yes (compliance_status)");
}

main().catch(console.error);
