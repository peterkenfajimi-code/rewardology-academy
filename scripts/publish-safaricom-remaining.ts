/** Publish remaining approved Safaricom rows (EPSAP + FY2024 pension administrator). */
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
    .eq("exchange_ticker", "SCOM")
    .single();

  const targets = [
    { field: "share_based_payment_scheme", valueIncludes: "EPSAP" },
    {
      field: "pension_administrator_type",
      valueIncludes: "National Social Security Fund (NSSF) and separate",
    },
  ];

  for (const t of targets) {
    const { data: row } = await supabase
      .from("benefit_entries")
      .select("entry_id, field, value, publish_status")
      .eq("company_id", company!.company_id)
      .eq("field", t.field)
      .eq("publish_status", "pending_verification")
      .ilike("value", `%${t.valueIncludes}%`)
      .maybeSingle();

    if (!row) {
      console.log("Skip (not pending):", t.field, t.valueIncludes);
      continue;
    }

    const { error } = await supabase
      .from("benefit_entries")
      .update({ publish_status: "published", verified_by: "safaricom-review" })
      .eq("entry_id", row.entry_id);
    if (error) throw new Error(error.message);
    console.log("Published", row.field, "=", row.value);
  }
}

main().catch(console.error);
