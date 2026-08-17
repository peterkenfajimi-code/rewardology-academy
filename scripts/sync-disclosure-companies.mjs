/**
 * Sync Nigeria disclosure company lists (NGX + FMDQ + NASD) to data/*.json
 *
 * Usage: node scripts/sync-disclosure-companies.mjs
 * Also: npm run sync:ngx-companies (alias)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getProjectRoot, loadEnvLocal, resolveProjectRoot } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const dataDir = path.join(root, "data");

function readSeed(name) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(name, rows) {
  fs.writeFileSync(path.join(dataDir, name), `${JSON.stringify(rows, null, 2)}\n`);
}

function normalize(row, exchange) {
  const ticker = (row.ticker ?? "").trim().toUpperCase();
  const name = (row.name ?? "").trim();
  if (!ticker || !name) return null;
  return {
    ticker,
    name,
    exchange: row.exchange ?? exchange,
    sector: row.sector ?? null,
    website: row.website ?? null,
    fmdq_issuer_path: row.fmdq_issuer_path ?? null,
  };
}

async function fetchNgx(apiKey) {
  const res = await fetch("https://api.ngnmarket.com/v1/companies?limit=500", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return null;
  const payload = await res.json();
  const rows = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.data?.items)
      ? payload.data.items
      : null;
  if (!rows?.length) return null;
  return rows
    .map((row) =>
      normalize(
        {
          ticker: row.symbol ?? row.ticker,
          name: row.name,
          sector: row.sector,
          website: row.website ?? row.website_url,
          exchange: "NGX",
        },
        "NGX"
      )
    )
    .filter(Boolean);
}

async function main() {
  const apiKey = process.env.NGN_MARKET_API_KEY || env.NGN_MARKET_API_KEY;
  let ngx = apiKey ? await fetchNgx(apiKey) : null;
  if (!ngx?.length) {
    ngx = readSeed("ngx-companies-seed.json").map((r) => normalize(r, "NGX")).filter(Boolean);
    console.log(`NGX: ${ngx.length} from seed`);
  } else {
    console.log(`NGX: ${ngx.length} from NGN Market API`);
  }

  const fmdq = readSeed("fmdq-issuers-seed.json").map((r) => normalize(r, "FMDQ")).filter(Boolean);
  const nasd = readSeed("nasd-companies-seed.json").map((r) => normalize(r, "NASD")).filter(Boolean);
  const all = [...ngx, ...fmdq, ...nasd];

  fs.mkdirSync(dataDir, { recursive: true });
  writeJson("ngx-companies.json", ngx);
  writeJson("fmdq-issuers.json", fmdq);
  writeJson("nasd-companies.json", nasd);
  writeJson("nigeria-disclosure-companies.json", all);

  console.log(`FMDQ: ${fmdq.length} issuers`);
  console.log(`NASD: ${nasd.length} companies (NASD Blue-focused seed)`);
  console.log(`Combined: ${all.length} → data/nigeria-disclosure-companies.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
