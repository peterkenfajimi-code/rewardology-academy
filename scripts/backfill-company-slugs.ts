/**
 * Backfill companies.slug from name + country (migration 010).
 * Usage: npx tsx scripts/backfill-company-slugs.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { companySlug } from "../lib/repository/company-slug";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
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
  const { data: companies, error } = await supabase
    .from("companies")
    .select("company_id, name, country, slug");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const used = new Set<string>();
  let updated = 0;

  for (const row of companies ?? []) {
    let slug = companySlug(row.name, row.country);
    if (used.has(slug)) {
      slug = `${slug}-${row.company_id.slice(0, 8)}`;
    }
    used.add(slug);

    if (row.slug === slug) continue;

    const { error: upErr } = await supabase
      .from("companies")
      .update({ slug })
      .eq("company_id", row.company_id);

    if (upErr) {
      console.error(row.name, upErr.message);
      continue;
    }
    console.log("Updated", row.name, "→", slug);
    updated += 1;
  }

  console.log(`Done. ${updated} slug(s) updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
