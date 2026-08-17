/**
 * Sync disclosure company lists for all six markets to data/*.json
 *
 * Usage: npm run sync:disclosure-companies
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getProjectRoot, loadEnvLocal, resolveProjectRoot } from "./lib/load-env-local.mjs";

const EXCHANGES = [
  { exchange: "NGX", seed: "ngx-companies-seed.json", cache: "ngx-companies.json", country: "NG" },
  { exchange: "FMDQ", seed: "fmdq-issuers-seed.json", cache: "fmdq-issuers.json", country: "NG" },
  { exchange: "NASD", seed: "nasd-companies-seed.json", cache: "nasd-companies.json", country: "NG" },
  { exchange: "JSE", seed: "jse-companies-seed.json", cache: "jse-companies.json", country: "ZA" },
  { exchange: "NSE", seed: "nse-companies-seed.json", cache: "nse-companies.json", country: "KE" },
  { exchange: "GSE", seed: "gse-companies-seed.json", cache: "gse-companies.json", country: "GH" },
  { exchange: "EGX", seed: "egx-companies-seed.json", cache: "egx-companies.json", country: "EG" },
  { exchange: "RSE", seed: "rse-companies-seed.json", cache: "rse-companies.json", country: "RW" },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const dataDir = path.join(root, "data");

function normalize(row, exchange, country) {
  const ticker = (row.ticker ?? "").trim().toUpperCase();
  const name = (row.name ?? "").trim();
  if (!ticker || !name) return null;
  return {
    ticker,
    name,
    exchange: row.exchange ?? exchange,
    country: row.country ?? country,
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
          country: "NG",
        },
        "NGX",
        "NG"
      )
    )
    .filter(Boolean);
}

async function main() {
  const apiKey = process.env.NGN_MARKET_API_KEY || env.NGN_MARKET_API_KEY;
  const all = [];

  for (const { exchange, seed, cache, country } of EXCHANGES) {
    let rows;
    if (exchange === "NGX") {
      rows = apiKey ? await fetchNgx(apiKey) : null;
      if (!rows?.length) {
        rows = JSON.parse(fs.readFileSync(path.join(dataDir, seed), "utf8"))
          .map((r) => normalize(r, exchange, country))
          .filter(Boolean);
        console.log(`NGX: ${rows.length} from seed`);
      } else {
        console.log(`NGX: ${rows.length} from NGN Market API`);
      }
    } else {
      rows = JSON.parse(fs.readFileSync(path.join(dataDir, seed), "utf8"))
        .map((r) => normalize(r, exchange, country))
        .filter(Boolean);
      console.log(`${exchange}: ${rows.length} from seed`);
    }

    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, cache), `${JSON.stringify(rows, null, 2)}\n`);
    all.push(...rows);
  }

  fs.writeFileSync(path.join(dataDir, "disclosure-companies.json"), `${JSON.stringify(all, null, 2)}\n`);
  console.log(`Combined: ${all.length} companies → data/disclosure-companies.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
