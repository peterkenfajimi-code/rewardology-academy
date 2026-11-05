/**
 * Checkpoint rulings A/B data fixes. Never delete.
 * Usage: node scripts/checkpoint-repairs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "checkpoint-2026-11-05-repairs";
const AS_OF = new Date("2026-11-05T12:00:00Z");

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

function monthIndex(label) {
  const last = (label ?? "").trim().toLowerCase().split(/\s+/).pop();
  return last != null ? MONTHS[last] ?? null : null;
}
function parseFy(value) {
  const m = String(value ?? "").match(/(?:FY)?(20\d{2})/i);
  return m ? Number(m[1]) : null;
}
function latestAvailable(fye, reportMonth, asOf) {
  const fyeMonth = monthIndex(fye);
  const rm = monthIndex(reportMonth);
  if (fyeMonth == null || rm == null) return null;
  const asOfUtc = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  const start = asOf.getUTCFullYear() + 1;
  for (let fy = start; fy >= start - 6; fy -= 1) {
    const year = rm > fyeMonth ? fy : fy + 1;
    if (Date.UTC(year, rm, 1) <= asOfUtc) return fy;
  }
  return null;
}

loadEnvLocal();
const supabase = createClient(
  process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL,
  process.env.REPOSITORY_SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

async function log(entryId, action, detail) {
  const { error } = await supabase.from("verification_log").insert({
    entry_id: entryId,
    action,
    actor: ACTOR,
    detail,
  });
  if (error) throw new Error(`log ${entryId}: ${error.message}`);
}

const { data: nb, error: nbErr } = await supabase
  .from("companies")
  .select("company_id, name, slug")
  .eq("slug", "nigerian-breweries-plc-ng")
  .single();
if (nbErr || !nb) throw new Error(nbErr?.message ?? "NB missing");
const { error: nbSchErr } = await supabase.from("company_review_schedule").upsert(
  {
    company_id: nb.company_id,
    fiscal_year_end: "31 December",
    report_usually_published_month: "March",
    last_fy_extracted: "FY2025",
    next_due: "2027-03-01",
    notes: "Listed NGX:NB. Company-column facts. Added after checkpoint found it missing from company_review_schedule.",
  },
  { onConflict: "company_id" }
);
if (nbSchErr) throw new Error(`NB schedule: ${nbSchErr.message}`);
console.log("UPSERTED Nigerian Breweries company_review_schedule");

const { data: gtco } = await supabase
  .from("companies")
  .select("company_id")
  .eq("slug", "guaranty-trust-holding-company-plc-ng")
  .single();
const { data: hmo, error: hmoErr } = await supabase
  .from("benefit_entries")
  .select("entry_id, field, value, value_type, publish_status, notes")
  .eq("company_id", gtco.company_id)
  .eq("field", "hmo_scope")
  .eq("publish_status", "published")
  .maybeSingle();
if (hmoErr) throw new Error(hmoErr.message);
if (!hmo) throw new Error("GTCO published hmo_scope missing");
if (hmo.value_type !== "named_program") {
  const { error } = await supabase
    .from("benefit_entries")
    .update({
      value_type: "named_program",
      notes: `${hmo.notes ?? ""} Aligned value_type to named_program (migration 028). Value unchanged.`.trim(),
      verified_by: ACTOR,
    })
    .eq("entry_id", hmo.entry_id)
    .eq("company_id", gtco.company_id);
  if (error) throw new Error(error.message);
  await log(hmo.entry_id, "corrected", "value_type narrative → named_program to match registry after migration 028. Value unchanged.");
  console.log("ALIGNED GTCO hmo_scope value_type named_program");
} else {
  console.log("SKIPPED GTCO hmo_scope already named_program");
}

const { data: mtn } = await supabase
  .from("companies")
  .select("company_id")
  .eq("slug", "mtn-group-ltd-za")
  .single();
const { data: lti, error: ltiErr } = await supabase
  .from("benefit_entries")
  .select("entry_id, value, fiscal_year_or_effective_date, source_id, notes, publish_status")
  .eq("company_id", mtn.company_id)
  .eq("field", "long_term_incentive_plan")
  .eq("publish_status", "published")
  .maybeSingle();
if (ltiErr) throw new Error(ltiErr.message);
if (!lti) throw new Error("MTN Group published LTI missing");
const { error: srcDateErr } = await supabase
  .from("sources")
  .update({ publication_date: "2026-03-01" })
  .eq("source_id", lti.source_id);
if (srcDateErr) throw new Error(`CDP date: ${srcDateErr.message}`);
const { error: ltiNoteErr } = await supabase
  .from("benefit_entries")
  .update({
    notes: `${lti.notes ?? ""} CDP URL path /2026/03/ — publication_date was 2026-12-31 (period-end placeholder); corrected to 2026-03-01. 2025 CDP still says "As of 2022, 25% of the LTI component". FY25 Remuneration Report (mtn.com, June 2026) now weights ESG at 15% of the PSP, not 25%. Kept fiscal_year 2022 so the 25% row is not treated as current. 15% not published (needs a ruling).`.trim(),
    verified_by: ACTOR,
  })
  .eq("entry_id", lti.entry_id);
if (ltiNoteErr) throw new Error(ltiNoteErr.message);
await log(
  lti.entry_id,
  "corrected",
  "CDP publication_date 2026-12-31 → 2026-03-01. Re-verified: CDP restates as-of-2022 25% LTI ESG link; FY25 rem report now 15% ESG. FY stays 2022; not treated as current."
);
console.log("CORRECTED MTN Group CDP publication_date; LTI stays FY2022");

const { data: stanbic } = await supabase
  .from("companies")
  .select("company_id")
  .eq("slug", "stanbic-bank-ghana-ltd-gh")
  .single();
const { data: existingFund } = await supabase
  .from("benefit_entries")
  .select("entry_id, field, publish_status")
  .eq("company_id", stanbic.company_id)
  .eq("field", "supplementary_retirement_fund")
  .maybeSingle();
const { data: vol, error: volErr } = await supabase
  .from("benefit_entries")
  .select("entry_id, field, value, notes, publish_status")
  .eq("company_id", stanbic.company_id)
  .eq("field", "voluntary_contribution_program")
  .maybeSingle();
if (volErr) throw new Error(volErr.message);
if (existingFund?.publish_status === "published") {
  console.log("SKIPPED Stanbic supplementary_retirement_fund already published");
} else if (!vol) {
  throw new Error("Stanbic voluntary_contribution_program missing");
} else {
  const { error } = await supabase
    .from("benefit_entries")
    .update({
      field: "supplementary_retirement_fund",
      value: "retirement fund membership (Tier 3) for general staff (Bank)",
      value_type: "named_program",
      confidence_score: "medium",
      publish_status: "published",
      notes: `Remapped from voluntary_contribution_program. Printed p.39 (PDF p.42), quoted: "Remuneration of all staff is based on a basic salary plus benefits, which generally include medical aid and retirement fund membership (Tier 3)." Compulsory/voluntary not stated on that sentence — not invented. Managerial CTC "compulsory benefits (medical aid and retirement contribution)" left out (not described as this scheme). Medium.`,
      verified_by: ACTOR,
    })
    .eq("entry_id", vol.entry_id)
    .eq("company_id", stanbic.company_id);
  if (error) throw new Error(`Stanbic remap: ${error.message}`);
  await log(
    vol.entry_id,
    "published",
    "Remapped voluntary_contribution_program → supplementary_retirement_fund. General-staff Tier 3 membership only. Managerial CTC left out."
  );
  console.log("PUBLISHED Stanbic supplementary_retirement_fund");
}

const { data: saf } = await supabase
  .from("companies")
  .select("company_id")
  .eq("slug", "safaricom-plc-ke")
  .single();
const { data: safWf, error: safErr } = await supabase
  .from("workforce_composition_entries")
  .select("entry_id, metric_key, value, reporting_period, publish_status, notes")
  .eq("company_id", saf.company_id)
  .eq("publish_status", "pending_verification");
if (safErr) throw new Error(safErr.message);
for (const row of safWf ?? []) {
  if (row.reporting_period) {
    console.log(`SKIPPED Safaricom workforce ${row.metric_key} — has reporting_period ${row.reporting_period}`);
    continue;
  }
  const { error } = await supabase
    .from("workforce_composition_entries")
    .update({
      publish_status: "rejected",
      notes: `${row.notes ?? ""} Rejected: undated, no reporting period. Re-extract from the dated FY2026 report if wanted. Never deleted.`.trim(),
    })
    .eq("entry_id", row.entry_id)
    .eq("company_id", saf.company_id);
  if (error) throw new Error(`Safaricom ${row.metric_key}: ${error.message}`);
  console.log(`REJECTED Safaricom workforce ${row.metric_key}=${row.value}`);
}

for (const slug of ["guaranty-trust-holding-company-plc-ng", "scancom-plc-mtn-ghana-gh"]) {
  const { data: co } = await supabase.from("companies").select("company_id, name").eq("slug", slug).single();
  const { error } = await supabase
    .from("company_review_schedule")
    .update({
      notes:
        "FY2025 annual report published spring 2026; last extracted FY2024. Overdue = a newer AR than last extracted FY is available (not next_due).",
    })
    .eq("company_id", co.company_id);
  if (error) throw new Error(`${slug} schedule notes: ${error.message}`);
  console.log(`NOTED overdue ${co.name}`);
}

const { data: companies } = await supabase
  .from("companies")
  .select("company_id, name, slug");
const { data: schedule } = await supabase
  .from("company_review_schedule")
  .select(
    "company_id, fiscal_year_end, report_usually_published_month, last_fy_extracted, next_due, notes"
  );
const byId = Object.fromEntries((companies ?? []).map((c) => [c.company_id, c]));
const freshness = (schedule ?? [])
  .map((s) => {
    const last = parseFy(s.last_fy_extracted);
    const latest = latestAvailable(s.fiscal_year_end, s.report_usually_published_month, AS_OF);
    return {
      company: byId[s.company_id]?.name,
      last_fy: s.last_fy_extracted,
      latest_available_fy: latest != null ? `FY${latest}` : null,
      report_month: s.report_usually_published_month,
      fy_end: s.fiscal_year_end,
      next_due_old: s.next_due,
      overdue: last != null && latest != null && last < latest,
    };
  })
  .sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.company.localeCompare(b.company));

console.log(JSON.stringify({ freshness }, null, 2));
