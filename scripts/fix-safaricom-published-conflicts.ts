/** Resolve uq_one_published_fact conflicts for Safaricom share_based + pension_administrator. */
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

  const { data: shareRows } = await supabase
    .from("benefit_entries")
    .select("entry_id, value, publish_status")
    .eq("company_id", company!.company_id)
    .eq("field", "share_based_payment_scheme")
    .in("publish_status", ["published", "pending_verification"]);

  const grants = shareRows?.find((r) => r.value === "Share Grants" && r.publish_status === "published");
  const epsap = shareRows?.find((r) => r.value?.includes("EPSAP") && r.publish_status === "pending_verification");

  if (grants && epsap) {
    await supabase
      .from("benefit_entries")
      .update({ publish_status: "superseded", superseded_by_entry_id: epsap.entry_id })
      .eq("entry_id", grants.entry_id);
    const { error } = await supabase
      .from("benefit_entries")
      .update({ publish_status: "published", verified_by: "safaricom-review" })
      .eq("entry_id", epsap.entry_id);
    if (error) throw error;
    console.log("Published EPSAP; superseded generic Share Grants (one published fact per field).");
  }

  console.log(
    "FY2024 pension_administrator_type left pending — canonical published row is 2025 NSSF + private occupational scheme (uq_one_published_fact)."
  );
}

main().catch(console.error);
