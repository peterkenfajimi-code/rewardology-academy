/**
 * Reject MTN non_discrimination_policy misroute and move stats to workforce_composition_entries.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { inferWorkforceMetricsFromText } from "../lib/repository/workforce-metrics";

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

  const { data: company } = await supabase
    .from("companies")
    .select("company_id")
    .eq("exchange_ticker", "MTN")
    .single();

  if (!company) throw new Error("MTN not found");

  const { data: bad } = await supabase
    .from("benefit_entries")
    .select("entry_id, value, source_id")
    .eq("company_id", company.company_id)
    .eq("field", "non_discrimination_policy")
    .eq("publish_status", "published")
    .maybeSingle();

  if (!bad) {
    console.log("No published MTN non_discrimination_policy entry found.");
    return;
  }

  const metrics = inferWorkforceMetricsFromText(bad.value ?? "", "2024");
  console.log(`Rejecting misrouted entry ${bad.entry_id}`);
  console.log(`Routing ${metrics.length} workforce metrics`);

  await supabase
    .from("benefit_entries")
    .update({ publish_status: "rejected", notes: "Misrouted workforce demographics — moved to workforce_composition_entries" })
    .eq("entry_id", bad.entry_id);

  for (const metric of metrics) {
    await supabase.from("workforce_composition_entries").insert({
      company_id: company.company_id,
      source_id: bad.source_id,
      metric_key: metric.metric_key,
      value: metric.value,
      reporting_period: metric.reporting_period,
      confidence_score: metric.confidence_score,
      publish_status: "published",
      notes: "Migrated from misrouted non_discrimination_policy benefit entry",
    });
    console.log(`  workforce: ${metric.metric_key} = ${metric.value}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
