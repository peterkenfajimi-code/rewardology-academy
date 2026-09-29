/**
 * Close out Safaricom Guide 2 (careers page): publish wellness / crèche / gym.
 * Live Chrome fetch of /careers/ is CloudFront 403; facts match the indexed excerpt
 * of the same URL and the Aug 2026 careers/LinkedIn pending rows.
 *
 * Does not publish "competitive salaries" (recruitment marketing) or the FY2024 AR
 * "medical aid contributions" row sitting on wellness_program_narrative (wrong field).
 *
 * Usage: npx tsx scripts/reconcile-safaricom-guide2.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "safaricom-guide2-review";

const PUBLISH = [
  {
    entry_id: "3d902e1f-0aa2-45f9-b76f-389dca6bdfb3",
    detail:
      "Guide 2 careers: crèche facilities. named_program / medium — careers_page trust 2, not an AR fact.",
  },
  {
    entry_id: "38d611eb-3443-4e89-8b4e-caf28e353c72",
    detail:
      "Guide 2 careers: subsidized gym facilities. named_program / medium. Prefer careers wording over LinkedIn duplicate and over the thinner Yes row.",
  },
  {
    entry_id: "337eb9c8-d9b5-455f-a604-8125fa058aae",
    detail:
      "Guide 2 indexed excerpt of /careers/ (live fetch CloudFront 403): wellness programme. narrative / low, as the registry caps this field.",
  },
] as const;

const SUPERSEDE = [
  {
    entry_id: "b061da32-7edd-426b-a17f-88ec84903d7b",
    superseded_by: "38d611eb-3443-4e89-8b4e-caf28e353c72",
    detail: "Thinner careers gym=Yes outranked by named 'Subsidized gym facilities'.",
  },
  {
    entry_id: "70406fe5-27d0-4e9e-8674-c477ccde5772",
    superseded_by: "38d611eb-3443-4e89-8b4e-caf28e353c72",
    detail: "LinkedIn gym duplicate of the careers named_program.",
  },
] as const;

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

  for (const row of PUBLISH) {
    const { data: existing, error: readErr } = await supabase
      .from("benefit_entries")
      .select("entry_id, category, field, value, publish_status")
      .eq("entry_id", row.entry_id)
      .single();
    if (readErr || !existing) throw new Error(readErr?.message ?? `missing ${row.entry_id}`);
    if (existing.publish_status === "published") {
      console.log(`SKIP already published ${existing.category}.${existing.field}`);
      continue;
    }
    const { error } = await supabase
      .from("benefit_entries")
      .update({ publish_status: "published", verified_by: ACTOR })
      .eq("entry_id", row.entry_id)
      .eq("publish_status", "pending_verification");
    if (error) throw new Error(`Publish ${row.entry_id}: ${error.message}`);
    await supabase.from("verification_log").insert({
      entry_id: row.entry_id,
      action: "published",
      actor: ACTOR,
      detail: row.detail,
    });
    console.log(`PUBLISHED  ${existing.category}.${existing.field} = ${existing.value}`);
  }

  for (const row of SUPERSEDE) {
    const { data: existing, error: readErr } = await supabase
      .from("benefit_entries")
      .select("entry_id, category, field, value, publish_status")
      .eq("entry_id", row.entry_id)
      .single();
    if (readErr || !existing) throw new Error(readErr?.message ?? `missing ${row.entry_id}`);
    if (existing.publish_status === "superseded") {
      console.log(`SKIP already superseded ${existing.category}.${existing.field}`);
      continue;
    }
    const { error } = await supabase
      .from("benefit_entries")
      .update({
        publish_status: "superseded",
        superseded_by_entry_id: row.superseded_by,
        verified_by: ACTOR,
      })
      .eq("entry_id", row.entry_id);
    if (error) throw new Error(`Supersede ${row.entry_id}: ${error.message}`);
    await supabase.from("verification_log").insert({
      entry_id: row.entry_id,
      action: "superseded",
      actor: ACTOR,
      detail: row.detail,
    });
    console.log(`SUPERSEDED ${existing.category}.${existing.field} = ${existing.value}`);
  }

  console.log(
    "Left pending: AR medical-aid row on wellness_program_narrative (wrong field); competitive-salaries compensation_philosophy (recruitment marketing)."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
