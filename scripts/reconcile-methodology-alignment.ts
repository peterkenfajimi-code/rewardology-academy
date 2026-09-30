/**
 * Bring published data in line with the methodology page:
 * - Nothing from material the company marks internal: unpublish the MTN 'Inspired' brochure rows
 *   (every page says "Sensitivity: MTN Internal", even though mtn.com hosts it publicly).
 * - Low-confidence findings are held, not published: move every published Low row back to pending.
 *
 * Usage: npx tsx scripts/reconcile-methodology-alignment.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "methodology-alignment";
const BROCHURE_URL = "https://www.mtn.com/wp-content/uploads/2024/09/Brochure.pdf";

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

  async function move(entryId: string, to: "rejected" | "pending_verification", action: string, detail: string) {
    const { error } = await supabase
      .from("benefit_entries")
      .update({ publish_status: to, verified_by: ACTOR })
      .eq("entry_id", entryId)
      .eq("publish_status", "published");
    if (error) throw new Error(`${entryId}: ${error.message}`);
    const { error: logErr } = await supabase
      .from("verification_log")
      .insert({ entry_id: entryId, action, actor: ACTOR, detail });
    if (logErr) throw new Error(`log ${entryId}: ${logErr.message}`);
  }

  const { data: sources, error: srcErr } = await supabase
    .from("sources")
    .select("source_id")
    .eq("source_url", BROCHURE_URL);
  if (srcErr) throw new Error(srcErr.message);
  const { data: brochureRows, error: bErr } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value")
    .in("source_id", (sources ?? []).map((s) => s.source_id))
    .eq("publish_status", "published");
  if (bErr) throw new Error(bErr.message);
  for (const row of brochureRows ?? []) {
    await move(
      row.entry_id,
      "rejected",
      "rejected",
      "Source is marked 'Sensitivity: MTN Internal' on every page. Although mtn.com hosts it publicly, the methodology page commits to nothing from material a company labels internal."
    );
    console.log(`REJECTED ${row.category}.${row.field} = ${row.value}`);
  }

  const { data: lowRows, error: lErr } = await supabase
    .from("benefit_entries")
    .select("entry_id, category, field, value, companies ( name )")
    .eq("publish_status", "published")
    .eq("confidence_score", "low");
  if (lErr) throw new Error(lErr.message);
  for (const row of lowRows ?? []) {
    await move(
      row.entry_id,
      "pending_verification",
      "reconciled",
      "Held: Low-confidence findings are not published as facts (methodology page). Publish only if corroborated to Medium or better."
    );
    const company = (row.companies as { name?: string } | null)?.name ?? "";
    console.log(`HELD     ${company}: ${row.category}.${row.field} = ${row.value}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
