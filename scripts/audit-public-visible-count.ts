/** Which published rows are excluded by public API recency filter? */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { isEntryWithinRecencyWindow, isExcludedBenefitField } from "../lib/repository/collection-policy";

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

  const { data } = await supabase
    .from("benefit_entries")
    .select(
      "entry_id, category, field, fiscal_year_or_effective_date, companies(name), sources(publication_date, source_url, source_title)"
    )
    .eq("publish_status", "published");

  let visible = 0;
  for (const row of data ?? []) {
    if (isExcludedBenefitField(row.field)) continue;
    const source = row.sources as {
      publication_date?: string | null;
      source_url?: string | null;
      source_title?: string | null;
    };
    const ok = isEntryWithinRecencyWindow(
      { fiscal_year_or_effective_date: row.fiscal_year_or_effective_date },
      source
    );
    if (ok) visible++;
    else {
      const c = row.companies as { name?: string };
      console.log(
        `EXCLUDED: ${c.name} ${row.category}.${row.field} fy=${row.fiscal_year_or_effective_date} pub=${source.publication_date}`
      );
    }
  }
  console.log(`published=${data?.length ?? 0} visible_after_recency=${visible}`);
}

main().catch(console.error);
