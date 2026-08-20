/** Count pending_verification entries from careers reconciliation test. */
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

  const { count } = await supabase
    .from("benefit_entries")
    .select("entry_id", { count: "exact", head: true })
    .eq("publish_status", "pending_verification");

  const { data } = await supabase
    .from("benefit_entries")
    .select("category, field, value, sources!inner(source_type)")
    .eq("publish_status", "pending_verification");

  console.log(`pending_verification count: ${count}`);
  for (const row of data ?? []) {
    const s = row.sources as { source_type?: string };
    console.log(`  ${row.category}.${row.field} (${s.source_type}): ${row.value?.slice(0, 50)}`);
  }
}

main().catch(console.error);
