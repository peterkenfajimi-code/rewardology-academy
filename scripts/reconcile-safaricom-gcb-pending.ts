/**
 * Clear the Safaricom pending queue (14 rows) and GCB's pending termination row.
 *
 * Every row is published or rejected with its reason in verification_log. Rejections are
 * statements that are not verifiable benefit facts: recruitment copy, IAS 19 accounting-policy
 * definitions, "no figure broken out", or HR Committee terms of reference read as provision.
 *
 * Usage: npx tsx scripts/reconcile-safaricom-gcb-pending.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "safaricom-gcb-pending-review";

const IAS19_SHORT_TERM =
  "IAS 19 accounting-policy definition (note 2(s)(iv): short-term benefits 'consist of salaries, bonuses and any non-monetary benefits such as medical aid contributions'). Defines a cost category; does not state that Safaricom provides medical aid or its scope.";
const HR_CHARTER =
  "HR Committee terms of reference (what the committee reviews), not a disclosure of what employees receive.";

const DECISIONS: { entry_id: string; action: "published" | "rejected"; detail: string }[] = [
  {
    entry_id: "bcd9b418-8ec3-4f91-9d77-3492ece29846",
    action: "rejected",
    detail: "'Competitive salaries' is recruitment marketing copy, not a pay philosophy with verifiable specificity.",
  },
  {
    entry_id: "3270454d-a4d1-4faa-bc73-556f00a09ddd",
    action: "rejected",
    detail: "'Competitive salaries' is recruitment marketing copy, not a pay philosophy with verifiable specificity.",
  },
  {
    entry_id: "e673df35-3c17-466e-a45b-2112021b3948",
    action: "rejected",
    detail: "FY2024 AR accounting note on the accrued-leave balance-sheet provision, not a leave entitlement. No days stated.",
  },
  {
    entry_id: "e43f5dec-7857-4a90-9847-74b7a6bd6308",
    action: "rejected",
    detail: "FY2025 AR accounting note on the accrued-leave balance-sheet provision, not a leave entitlement. No days stated.",
  },
  {
    entry_id: "bc6992ee-3bbb-4fe6-84d8-e8721d307fb5",
    action: "rejected",
    detail: "FY2025 AR says training sits inside 'other operating expenses' — no training figure is broken out.",
  },
  {
    entry_id: "b820398c-5ebe-4cc5-b630-9a982e08f968",
    action: "rejected",
    detail: "FY2024 AR says training sits inside 'other operating expenses' — no training figure is broken out.",
  },
  {
    entry_id: "455e558f-912f-477c-a47a-231ff50ac48e",
    action: "rejected",
    detail: `FY2024 medical-aid row (was on wellness_program_narrative). ${IAS19_SHORT_TERM} Not moved to hmo_scope: the wording is the same boilerplate in every year.`,
  },
  {
    entry_id: "db2dbb02-d129-4af5-8fa7-0a856b72f5e3",
    action: "rejected",
    detail: `FY2025 hmo_scope 'Medical aid contributions provided'. ${IAS19_SHORT_TERM}`,
  },
  {
    entry_id: "dab5aea9-05e7-46d3-aefe-414f08e13e6c",
    action: "rejected",
    detail: `hmo_scope 'Employee welfare medical scheme' from 'reviewing the adequacy and diversity of employee welfare through pension and medical schemes'. ${HR_CHARTER} No coverage scope stated.`,
  },
  {
    entry_id: "1303d9a5-4f72-4172-9f5a-e181c68f6750",
    action: "rejected",
    detail: `additional_exit_benefit_scheme=Yes inferred from the committee reviewing 'pension and medical schemes'. ${HR_CHARTER} No exit/severance scheme is mentioned.`,
  },
  {
    entry_id: "53cb8324-3007-4036-9a85-873642af114a",
    action: "rejected",
    detail: `tuition_reimbursement=Yes inferred from the committee reviewing 'learning and development'. ${HR_CHARTER} No tuition reimbursement is mentioned.`,
  },
  {
    entry_id: "fdcd196b-f784-40f5-8b14-8e73117c4248",
    action: "rejected",
    detail: "'Work-life balance' in a CEO/careers message is not a flexible or hybrid work policy — no arrangement is described.",
  },
  {
    entry_id: "195334a7-a6c2-414f-94ab-a970920f1a08",
    action: "published",
    detail:
      "2026 AR remuneration report: 'Long-Term Incentive Scheme — long-term incentives are delivered through equity-linked instruments that vest over a multi-year period'; HR Committee approved the LTIP and share grants for FY25. medium per registry cap.",
  },
  {
    entry_id: "5e18c96d-0f8e-46ed-ade2-1ac496c39899",
    action: "published",
    detail:
      "Careers page: 'As an equal opportunity employer, Safaricom is committed to a diverse workforce and … a barrier-free employment process.' Company-stated policy; medium (careers_page trust 2).",
  },
  {
    entry_id: "12d6b652-080e-4893-b1ee-3b23a030ff10",
    action: "rejected",
    detail:
      "GCB 2024 AR: 'recognises termination benefits when demonstrably committed to terminating employment…' is the IAS 19 recognition rule for when a cost is booked, not a disclosed termination-benefit entitlement for employees.",
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

  for (const row of DECISIONS) {
    const { data: existing, error: readErr } = await supabase
      .from("benefit_entries")
      .select("entry_id, category, field, value, publish_status")
      .eq("entry_id", row.entry_id)
      .single();
    if (readErr || !existing) throw new Error(readErr?.message ?? `missing ${row.entry_id}`);
    if (existing.publish_status !== "pending_verification" && existing.publish_status !== row.action) {
      console.log(`SKIP ${existing.publish_status} ${existing.category}.${existing.field}`);
      continue;
    }
    const { data: logged } = await supabase
      .from("verification_log")
      .select("entry_id")
      .eq("entry_id", row.entry_id)
      .eq("action", row.action)
      .eq("actor", ACTOR);
    if (existing.publish_status === row.action && logged?.length) {
      console.log(`SKIP done ${existing.category}.${existing.field}`);
      continue;
    }
    if (existing.publish_status === "pending_verification") {
      const { error } = await supabase
        .from("benefit_entries")
        .update({ publish_status: row.action, verified_by: ACTOR })
        .eq("entry_id", row.entry_id)
        .eq("publish_status", "pending_verification");
      if (error) throw new Error(`${row.action} ${row.entry_id}: ${error.message}`);
    }
    const { error: logErr } = await supabase.from("verification_log").insert({
      entry_id: row.entry_id,
      action: row.action,
      actor: ACTOR,
      detail: row.detail,
    });
    if (logErr) throw new Error(`log ${row.entry_id}: ${logErr.message}`);
    console.log(`${row.action.toUpperCase().padEnd(9)} ${existing.category}.${existing.field} = ${existing.value}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
