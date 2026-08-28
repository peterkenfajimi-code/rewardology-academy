/**
 * Backfill companies.slug from name + country (migration 010).
 * Usage: npx tsx scripts/backfill-company-slugs.ts
 */
import { companySlug } from "../lib/repository/company-slug";
import { createRepositoryAdminClient } from "../lib/supabase/repository/admin";

async function main() {
  const supabase = createRepositoryAdminClient();
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
