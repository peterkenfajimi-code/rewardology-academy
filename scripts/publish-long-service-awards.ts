/**
 * Publish already-identified long_service_award facts now that migration 023 exists.
 * MTN Ghana (prompted by patch 6): instituted Dec 2016, permanent staff, five years.
 * GCB: same sitting, already in the 2024 AR re-read — cash at graduated rates after 15 years.
 *
 * Usage: npx tsx scripts/publish-long-service-awards.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { trustWeightForSourceType } from "../lib/repository/trust-weights";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "long-service-award";
const TRUST = trustWeightForSourceType("annual_report");

const ROWS = [
  {
    companyId: "bc1bb6ba-2074-4f2d-a044-cec8fd627eea",
    sourceId: "a8818302-7dec-4614-9ff2-78499d6da7d9",
    name: "Scancom PLC (MTN Ghana)",
    value:
      "instituted December 2016; permanent staff become eligible after a minimum of five years of service",
    notes:
      'Scancom PLC 2024 Annual Report note 2.8 (employee benefits): "Long service awards were instituted and implemented in December 2016. The qualification criteria is for permanent staff who have attained a minimum of five years of service to the Group." P&L "Long service awards" staff-cost line not copied as the value — structure/eligibility only.',
  },
  {
    companyId: "fcd7e06f-58a0-4f78-af34-7528ca73f341",
    sourceId: "c648db72-5df7-4c5a-ac76-cb944e62efa1",
    name: "GCB Bank PLC",
    value:
      "cash payments at graduated rates for uninterrupted-service milestones; employees become eligible after 15 years",
    notes:
      'GCB Bank PLC 2024 Annual Report note 34 Plan A: "Plan A long service awards accrue to employees based on graduated periods of uninterrupted service. ... Employees in service with the Bank after fifteen (15) years become eligible to receive cash payments at graduated rates when employees achieve stipulated milestones set by the Bank." Found in the same re-read as MTN Ghana; recorded now that the field exists, not new collection.',
  },
];

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

  for (const row of ROWS) {
    const { data: existing } = await supabase
      .from("benefit_entries")
      .select("entry_id, publish_status")
      .eq("company_id", row.companyId)
      .eq("field", "long_service_award")
      .in("publish_status", ["published", "pending_verification"]);
    if (existing?.length) {
      console.log(`SKIPPED  ${row.name} — already ${existing[0].publish_status}`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("benefit_entries")
      .insert({
        company_id: row.companyId,
        source_id: row.sourceId,
        category: "other_voluntary",
        field: "long_service_award",
        value: row.value,
        value_type: "named_program",
        fiscal_year_or_effective_date: "FY2024",
        confidence_score: "medium",
        confidence_was_clamped: false,
        source_trust_weight: TRUST,
        publish_status: "published",
        notes: row.notes,
        verified_by: ACTOR,
      })
      .select("entry_id")
      .single();
    if (error || !inserted) throw new Error(`${row.name}: ${error?.message ?? "insert failed"}`);

    const { error: logErr } = await supabase.from("verification_log").insert({
      entry_id: inserted.entry_id,
      action: "published",
      actor: ACTOR,
      detail: `Published long_service_award from the stored 2024 AR (migration 023).`,
    });
    if (logErr) throw new Error(`log ${row.name}: ${logErr.message}`);
    console.log(`PUBLISHED ${row.name} long_service_award ${inserted.entry_id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
