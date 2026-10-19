/**
 * 6g — publish MTN Ghana Company training spend from FY2024 AR note 2.8.
 *
 * Three tests (lib/repository/training-spend.ts): separate AR line; Company not Group;
 * staff training not customer/dealer. All three hold. Safaricom was rejected because
 * training sat inside other operating expenses with no figure broken out — opposite
 * facts, same rule.
 *
 * Usage: npx tsx scripts/reconcile-mtngh-training-spend.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { trustWeightForSourceType } from "../lib/repository/trust-weights";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "mtngh-training-spend";
const TRUST = trustWeightForSourceType("annual_report");
const COMPANY_ID = "bc1bb6ba-2074-4f2d-a044-cec8fd627eea";
const SOURCE_ID = "a8818302-7dec-4614-9ff2-78499d6da7d9";
const REJECTED_ID = "833e77ec-7dbc-43db-8aa3-0a62f5d8258f";

const VALUE = "GHS 10,830,000 (Company)";
const NOTES =
  'Scancom PLC 2024 Annual Report note 2.8 Employee expenses (amounts in thousands of Ghana Cedis): separate Training line Group 12,162 / Company 10,830 (2023: 7,606 / 7,146). Published Company GHS 10,830,000 — not the Group figure. Line sits with salaries, share-based payment, long service awards, post-employment benefit and bonus provision, so it is staff training cost, not customer/dealer training and not the MTN Ghana Foundation Skills Academy. Policy reversal of the earlier "P&L staff-cost line, not a programme budget" reject: a broken-out Company staff Training line is training_spend_amount (same rule that rejected Safaricom, where no figure was broken out).';

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

  const { data: existing, error: existErr } = await supabase
    .from("benefit_entries")
    .select("entry_id, publish_status, value")
    .eq("company_id", COMPANY_ID)
    .eq("field", "training_spend_amount")
    .eq("publish_status", "published");
  if (existErr) throw new Error(existErr.message);
  if (existing?.length) {
    console.log(`SKIPPED already published ${existing[0].entry_id} value=${existing[0].value}`);
    return;
  }

  const { data: inserted, error } = await supabase
    .from("benefit_entries")
    .insert({
      company_id: COMPANY_ID,
      source_id: SOURCE_ID,
      category: "development",
      field: "training_spend_amount",
      value: VALUE,
      value_type: "quantified",
      fiscal_year_or_effective_date: "FY2024",
      confidence_score: "high",
      confidence_was_clamped: false,
      source_trust_weight: TRUST,
      publish_status: "published",
      notes: NOTES,
      verified_by: ACTOR,
    })
    .select("entry_id")
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "insert failed");

  const { error: pubLogErr } = await supabase.from("verification_log").insert({
    entry_id: inserted.entry_id,
    action: "published",
    actor: ACTOR,
    detail:
      "Published Company GHS 10,830,000 from AR note 2.8 Training line. Separate staff-cost line, Company basis, staff not customer/dealer. Safaricom remains rejected (not broken out).",
  });
  if (pubLogErr) throw new Error(`publish log: ${pubLogErr.message}`);

  const { error: rejectLogErr } = await supabase.from("verification_log").insert({
    entry_id: REJECTED_ID,
    action: "rejected",
    actor: ACTOR,
    detail:
      "Left rejected as the audit of the old programme-budget test. Policy reversed: broken-out Company staff Training line is training_spend_amount. Successor published separately.",
  });
  if (rejectLogErr) throw new Error(`reject log: ${rejectLogErr.message}`);

  console.log(`PUBLISHED training_spend_amount ${inserted.entry_id} = ${VALUE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
