/**
 * Split GCB defined_benefit_plan_exists interim narrative onto defined_benefit_plan_status.
 *
 * exists → Yes (published). status → closed_legacy (published).
 * Usage: node scripts/reconcile-gcb-db-status.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "gcb-db-plan-status";
const STATUS_NOTE =
  "Company-sponsored supplementary DB scheme closed/discontinued in 1985 — not accruing for current employees. SSNIT Tier 1 is the country statutory DB and is not this field. Split from defined_benefit_plan_exists so Yes/No is not collapsed into an active-plan reading.";

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

  const { error: existsDescErr } = await supabase
    .from("benefit_field_registry")
    .update({
      description:
        "Yes/No — whether a company-sponsored supplementary DB scheme exists, including closed/legacy schemes. Not the country statutory DB (e.g. SSNIT Tier 1). Put active vs closed_legacy vs none on defined_benefit_plan_status; never store the closed/discontinued story on this field.",
      display_template:
        "{company} has a company-sponsored defined benefit plan (including closed/legacy): {value}.",
    })
    .eq("category", "retirement")
    .eq("field_key", "defined_benefit_plan_exists");
  if (existsDescErr) throw new Error(existsDescErr.message);

  const { error: statusRegErr } = await supabase.from("benefit_field_registry").upsert(
    {
      category: "retirement",
      field_key: "defined_benefit_plan_status",
      field_label: "Defined benefit plan status",
      value_type: "named_program",
      max_confidence: "high",
      description:
        "Status of the company-sponsored supplementary DB scheme: active, closed_legacy, or none. Use closed_legacy when the scheme is frozen, discontinued, or closed to current employees. Not SSNIT/statutory DB. Not a Yes/No field.",
      display_template: "{company} company-sponsored defined benefit plan status: {value}.",
    },
    { onConflict: "category,field_key" }
  );
  if (statusRegErr) throw new Error(statusRegErr.message);
  console.log("Registry defined_benefit_plan_status ready");

  const { data: company } = await supabase
    .from("companies")
    .select("company_id, name")
    .eq("exchange_ticker", "GCB")
    .eq("listing_exchange", "GSE")
    .single();
  if (!company) throw new Error("GCB company not found");

  const { data: existsRows, error: eErr } = await supabase
    .from("benefit_entries")
    .select("entry_id, value, notes, source_id, publish_status, fiscal_year_or_effective_date, confidence_score")
    .eq("company_id", company.company_id)
    .eq("field", "defined_benefit_plan_exists")
    .in("publish_status", ["published", "pending_verification"]);
  if (eErr) throw new Error(eErr.message);
  const existsRow =
    existsRows?.find((r) => r.publish_status === "pending_verification") ?? existsRows?.[0];
  if (!existsRow) throw new Error("No defined_benefit_plan_exists row for GCB");

  console.log(
    `exists row ${existsRow.entry_id} status=${existsRow.publish_status} value=${JSON.stringify(existsRow.value)}`
  );

  const { error: uErr } = await supabase
    .from("benefit_entries")
    .update({
      value: "Yes",
      value_type: "compliance_status",
      publish_status: "published",
      verified_by: ACTOR,
      notes: [existsRow.notes, "Yes = company-sponsored supplementary DB existed; status lives on defined_benefit_plan_status (closed_legacy)."]
        .filter(Boolean)
        .join(" "),
    })
    .eq("entry_id", existsRow.entry_id);
  if (uErr) throw new Error(uErr.message);
  await supabase.from("verification_log").insert({
    entry_id: existsRow.entry_id,
    action: "published",
    actor: ACTOR,
    detail: "Published defined_benefit_plan_exists=Yes after splitting closed-legacy narrative onto defined_benefit_plan_status.",
  });
  console.log("PUBLISHED  defined_benefit_plan_exists = Yes");

  const { data: existingStatus } = await supabase
    .from("benefit_entries")
    .select("entry_id")
    .eq("company_id", company.company_id)
    .eq("field", "defined_benefit_plan_status")
    .in("publish_status", ["published", "pending_verification"])
    .maybeSingle();

  if (existingStatus) {
    const { error } = await supabase
      .from("benefit_entries")
      .update({
        value: "closed_legacy",
        value_type: "named_program",
        category: "retirement",
        notes: STATUS_NOTE,
        publish_status: "published",
        verified_by: ACTOR,
        source_id: existsRow.source_id,
        fiscal_year_or_effective_date: existsRow.fiscal_year_or_effective_date,
      })
      .eq("entry_id", existingStatus.entry_id);
    if (error) throw new Error(error.message);
    console.log("UPDATED   defined_benefit_plan_status = closed_legacy (published)");
  } else {
    const { data: inserted, error } = await supabase
      .from("benefit_entries")
      .insert({
        company_id: company.company_id,
        source_id: existsRow.source_id,
        category: "retirement",
        field: "defined_benefit_plan_status",
        value: "closed_legacy",
        value_type: "named_program",
        confidence_score: existsRow.confidence_score ?? "high",
        source_trust_weight: 5,
        fiscal_year_or_effective_date: existsRow.fiscal_year_or_effective_date,
        notes: STATUS_NOTE,
        publish_status: "published",
        verified_by: ACTOR,
      })
      .select("entry_id")
      .single();
    if (error || !inserted) throw new Error(error?.message ?? "Could not insert status row");
    await supabase.from("verification_log").insert({
      entry_id: inserted.entry_id,
      action: "published",
      actor: ACTOR,
      detail: "Published defined_benefit_plan_status=closed_legacy (1985 discontinued company DB scheme).",
    });
    console.log("INSERTED  defined_benefit_plan_status = closed_legacy (published)", inserted.entry_id);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
