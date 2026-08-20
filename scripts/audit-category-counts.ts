/**
 * Audit published entry counts by category (33 vs 34 discrepancy check).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

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
    .select("entry_id, category, field, companies(name)")
    .eq("publish_status", "published");

  const byCategory = new Map<string, number>();
  for (const row of data ?? []) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1);
  }

  console.log("Published entries by category:");
  let sum = 0;
  for (const [cat, n] of [...byCategory.entries()].sort()) {
    console.log(`  ${cat}: ${n}`);
    sum += n;
  }
  console.log(`Total: ${data?.length ?? 0}, sum of categories: ${sum}`);
}

main().catch(console.error);
