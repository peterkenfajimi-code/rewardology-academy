/**
 * Sync NGX listed companies to data/ngx-companies.json
 *
 * Uses NGN_MARKET_API_KEY from .env.local when set; otherwise copies seed file.
 *
 * Usage: node scripts/sync-ngx-companies.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getProjectRoot, loadEnvLocal, resolveProjectRoot } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);

const seedPath = path.join(root, "data", "ngx-companies-seed.json");
const outputPath = path.join(root, "data", "ngx-companies.json");

async function fetchFromNgnMarket(apiKey) {
  const res = await fetch("https://api.ngnmarket.com/v1/companies?limit=500", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.warn(`NGN Market API returned ${res.status} — using seed file`);
    return null;
  }
  const payload = await res.json();
  const rows = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.data?.items)
      ? payload.data.items
      : null;
  if (!rows?.length) return null;
  return rows
    .map((row) => ({
      ticker: (row.symbol ?? row.ticker ?? "").trim().toUpperCase(),
      name: (row.name ?? "").trim(),
      sector: row.sector ?? null,
      website: row.website ?? row.website_url ?? null,
    }))
    .filter((c) => c.ticker && c.name);
}

function dedupe(companies) {
  const seen = new Map();
  for (const c of companies) {
    if (!seen.has(c.ticker)) seen.set(c.ticker, c);
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const apiKey = process.env.NGN_MARKET_API_KEY || env.NGN_MARKET_API_KEY;
  let companies = apiKey ? await fetchFromNgnMarket(apiKey) : null;

  if (!companies?.length) {
    if (!fs.existsSync(seedPath)) {
      console.error(`Missing seed file: ${seedPath}`);
      process.exit(1);
    }
    companies = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    console.log(`Using seed file (${companies.length} companies)`);
  } else {
    console.log(`Fetched ${companies.length} companies from NGN Market API`);
  }

  companies = dedupe(companies);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(companies, null, 2)}\n`, "utf8");
  console.log(`Wrote ${companies.length} companies → ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
