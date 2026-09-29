/**
 * Review decisions for Scancom PLC (MTN Ghana) FY2024 AR extract.
 *
 * Usage: node scripts/reconcile-mtngh-review.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "mtngh-review";
const SOURCE_URL = "https://mtn.com.gh/wp-content/uploads/2025/03/MTNGH-2024-Annual-Report-vf.pdf";

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

type Entry = {
  entry_id: string;
  category: string;
  field: string;
  value: string | null;
  value_type: string | null;
  notes: string | null;
  source_id: string;
  publish_status: string;
};

async function log(
  supabase: ReturnType<typeof createClient>,
  entryId: string,
  action: string,
  detail: string
) {
  await supabase.from("verification_log").insert({ entry_id: entryId, action, actor: ACTOR, detail });
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
    .select("company_id, name, slug, exchange_ticker, listing_exchange")
    .eq("exchange_ticker", "MTNGH")
    .eq("listing_exchange", "GSE")
    .single();
  if (!company) throw new Error("MTNGH company not found");

  const { data: za } = await supabase
    .from("companies")
    .select("company_id, name, slug")
    .eq("exchange_ticker", "MTN")
    .eq("listing_exchange", "JSE")
    .maybeSingle();
  if (!za) throw new Error("Identity check failed — JSE:MTN missing");
  if (za.company_id === company.company_id) throw new Error("MTN Ghana collapsed into MTN ZA");
  console.log(`OK identity ${company.name} ${company.slug} ≠ ${za.name} ${za.slug}`);

  const { data: entries, error } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, value_type, notes, source_id, publish_status")
    .eq("company_id", company.company_id)
    .eq("publish_status", "pending_verification");
  if (error) throw new Error(error.message);
  const rows = (entries ?? []) as Entry[];
  const sourceId = rows[0]?.source_id;
  if (!sourceId) throw new Error("No pending MTN Ghana entries");

  const byField = (field: string) => rows.filter((r) => r.field === field);

  for (const row of [...byField("employer_contribution_pct"), ...byField("employee_contribution_pct")]) {
    if (row.value?.trim()) continue;
    await supabase.from("benefit_entries").update({ publish_status: "rejected" }).eq("entry_id", row.entry_id);
    await log(
      supabase,
      row.entry_id,
      "rejected",
      "AR 2.8.3 discloses a DC scheme paying a fixed % into a fund but states no number. Null is not a company fact; statutory 5% was not copied (leak test held)."
    );
    console.log(`REJECTED  ${row.field} (empty)`);
  }

  for (const row of byField("training_spend_amount")) {
    await supabase.from("benefit_entries").update({ publish_status: "rejected" }).eq("entry_id", row.entry_id);
    await log(
      supabase,
      row.entry_id,
      "rejected",
      "P&L staff-cost 'Training' line in note 2.8 (amounts in thousands), not a disclosed L&D programme budget."
    );
    console.log("REJECTED  training_spend_amount (personnel-cost line)");
  }

  for (const row of rows.filter((r) => r.field === "unmapped" && /staff loan/i.test(r.value ?? ""))) {
    await supabase.from("benefit_entries").update({ publish_status: "rejected" }).eq("entry_id", row.entry_id);
    await log(
      supabase,
      row.entry_id,
      "rejected",
      "Note 2.22 staff-loans balance-sheet line, not a described employee loan scheme."
    );
    console.log("REJECTED  unmapped staff loans (balance sheet)");
  }

  const termination = byField("termination_benefits_policy")[0];
  if (termination) {
    await supabase
      .from("benefit_entries")
      .update({
        value_type: "named_program",
        publish_status: "published",
        verified_by: ACTOR,
        notes: [termination.notes, "Corrected value_type to named_program per registry. AR 2.8.4 accounting policy."]
          .filter(Boolean)
          .join(" "),
      })
      .eq("entry_id", termination.entry_id);
    await log(supabase, termination.entry_id, "published", "Published termination_benefits_policy from AR 2.8.4.");
    console.log("PUBLISHED termination_benefits_policy");
  }

  const scheme = byField("pension_scheme_type")[0];
  if (scheme) {
    await supabase
      .from("benefit_entries")
      .update({
        publish_status: "published",
        verified_by: ACTOR,
        notes: [
          scheme.notes,
          'AR 2.8.3: "The Group operates a defined contribution scheme." Report does not mention SSNIT or a company DB; mixed is not inferred from the country module.',
        ]
          .filter(Boolean)
          .join(" "),
      })
      .eq("entry_id", scheme.entry_id);
    await log(supabase, scheme.entry_id, "published", "Published pension_scheme_type=defined contribution from AR 2.8.3.");
    console.log("PUBLISHED pension_scheme_type = defined contribution");
  }

  const sbp = byField("share_based_payment_scheme")[0];
  if (sbp) {
    await supabase
      .from("benefit_entries")
      .update({ publish_status: "published", verified_by: ACTOR })
      .eq("entry_id", sbp.entry_id);
    await log(supabase, sbp.entry_id, "published", "Published share_based_payment_scheme from AR 2.8.2 / ESOP+PSP notes.");
    console.log("PUBLISHED share_based_payment_scheme");
  }

  const { data: existingEsop } = await supabase
    .from("benefit_entries")
    .select("entry_id")
    .eq("company_id", company.company_id)
    .eq("field", "esop_exists")
    .in("publish_status", ["published", "pending_verification"])
    .maybeSingle();

  if (!existingEsop) {
    const { data: inserted, error: esopErr } = await supabase
      .from("benefit_entries")
      .insert({
        company_id: company.company_id,
        source_id: sourceId,
        category: "equity_variable",
        field: "esop_exists",
        value: "Yes",
        value_type: "compliance_status",
        confidence_score: "high",
        source_trust_weight: 5,
        fiscal_year_or_effective_date: "FY2024",
        notes:
          "FY2024 AR: Employee Share Ownership Plan (ESOP) and Performance Share Plan (PSP) grants; dividends paid to ESOP beneficiaries GHS 3,120,786.87.",
        publish_status: "published",
        verified_by: ACTOR,
      })
      .select("entry_id")
      .single();
    if (esopErr || !inserted) throw new Error(esopErr?.message ?? "esop insert failed");
    await log(supabase, inserted.entry_id, "published", "Published esop_exists=Yes from FY2024 ESOP/PSP disclosure.");
    console.log("PUBLISHED esop_exists = Yes");
  }

  const workforce = [
    {
      metric_key: "female_workforce_pct",
      value: "42.8",
      notes: "FY2024 AR: women representation closed at 42.8% (2023: 41.6%).",
    },
    {
      metric_key: "female_leadership_pct",
      value: "29.3",
      notes: "FY2024 AR: women in leadership closed at 29.3%.",
    },
  ];

  for (const w of workforce) {
    const { error: wErr } = await supabase.from("workforce_composition_entries").insert({
      company_id: company.company_id,
      source_id: sourceId,
      metric_key: w.metric_key,
      value: w.value,
      reporting_period: "FY2024",
      confidence_score: "high",
      publish_status: "published",
      notes: w.notes,
    });
    if (wErr) throw new Error(`${w.metric_key}: ${wErr.message}`);
    console.log(`PUBLISHED workforce ${w.metric_key} = ${w.value}`);
  }

  console.log(`Public slug: /benefits-repository/${company.slug}`);
  console.log(`Source: ${SOURCE_URL}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
