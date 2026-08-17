/**
 * Run automated Nigeria disclosure batch locally (NGX + FMDQ + NASD).
 *
 * Usage:
 *   npx tsx scripts/run-benefits-repository-batch.ts
 *   npx tsx scripts/run-benefits-repository-batch.ts --max=5 --dry-run
 *   npx tsx scripts/run-benefits-repository-batch.ts --exchanges=FMDQ,NASD --publish
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (!process.env[key]) process.env[key] = t.slice(i + 1).trim();
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config: Record<string, unknown> = {
    maxCompanies: 0,
    tickers: undefined as string[] | undefined,
    exchanges: undefined as string[] | undefined,
    countries: undefined as string[] | undefined,
    publish: false,
    dryRun: false,
    delayMs: 3000,
    skipExistingSources: true,
    actor: "batch-cli",
  };

  for (const arg of args) {
    if (arg === "--publish") config.publish = true;
    else if (arg === "--dry-run") config.dryRun = true;
    else if (arg.startsWith("--max=")) config.maxCompanies = Number(arg.slice(6)) || 0;
    else if (arg.startsWith("--tickers=")) {
      config.tickers = arg
        .slice(10)
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
    } else if (arg.startsWith("--countries=")) {
      config.countries = arg
        .slice(12)
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
    } else if (arg.startsWith("--exchanges=")) {
      config.exchanges = arg
        .slice(12)
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
    } else if (arg.startsWith("--delay=")) config.delayMs = Number(arg.slice(8)) || 3000;
  }

  return config;
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL;
  const key = process.env.REPOSITORY_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_REPOSITORY_SUPABASE_URL or REPOSITORY_SUPABASE_SERVICE_KEY");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    console.error("Missing ANTHROPIC_API_KEY");
    process.exit(1);
  }

  const { runBenefitsRepositoryBatch } = await import("../lib/repository/batch-runner");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const config = parseArgs();

  console.log("Starting benefits repository batch with config:", config);

  const result = await runBenefitsRepositoryBatch(supabase, config, (progress, log) => {
    process.stdout.write(
      `\rCompanies ${progress.companiesDone}/${progress.companiesTotal} | sources ${progress.sourcesProcessed} | entries ${progress.entriesSaved} | errors ${progress.errors}   `
    );
  });

  console.log("\n\n--- Batch log ---\n");
  console.log(result.log);
  console.log("\n--- Summary ---");
  console.log(JSON.stringify(result.progress, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
