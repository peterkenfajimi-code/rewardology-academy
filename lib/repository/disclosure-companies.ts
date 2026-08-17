import fs from "fs";
import path from "path";
import type { DisclosureCompany } from "@/lib/repository/source-discovery";
import type { DisclosureExchange } from "@/lib/repository/types";

const DATA_DIR = path.join(process.cwd(), "data");

const EXCHANGE_FILES: Record<DisclosureExchange, { seed: string; cache: string }> = {
  NGX: { seed: "ngx-companies-seed.json", cache: "ngx-companies.json" },
  FMDQ: { seed: "fmdq-issuers-seed.json", cache: "fmdq-issuers.json" },
  NASD: { seed: "nasd-companies-seed.json", cache: "nasd-companies.json" },
};

const COMBINED_CACHE = path.join(DATA_DIR, "nigeria-disclosure-companies.json");

type NgnMarketCompany = {
  symbol?: string;
  ticker?: string;
  name?: string;
  sector?: string;
  website?: string;
  website_url?: string;
};

function readJsonFile<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as T[];
  return Array.isArray(raw) ? raw : [];
}

function normalizeCompany(row: Partial<DisclosureCompany>, exchange: DisclosureExchange): DisclosureCompany | null {
  const ticker = row.ticker?.trim().toUpperCase() ?? "";
  const name = row.name?.trim() ?? "";
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

function loadExchangeCompanies(exchange: DisclosureExchange, preferCache: boolean): DisclosureCompany[] {
  const { seed, cache } = EXCHANGE_FILES[exchange];
  const cachePath = path.join(DATA_DIR, cache);
  const seedPath = path.join(DATA_DIR, seed);

  if (preferCache && fs.existsSync(cachePath)) {
    const cached = readJsonFile<Partial<DisclosureCompany>>(cachePath);
    if (cached.length) {
      return cached.map((r) => normalizeCompany(r, exchange)).filter(Boolean) as DisclosureCompany[];
    }
  }

  const seedRows = readJsonFile<Partial<DisclosureCompany>>(seedPath);
  return seedRows.map((r) => normalizeCompany(r, exchange)).filter(Boolean) as DisclosureCompany[];
}

async function fetchNgxFromNgnMarket(apiKey: string): Promise<DisclosureCompany[] | null> {
  const res = await fetch("https://api.ngnmarket.com/v1/companies?limit=500", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;

  const payload = (await res.json()) as {
    data?: NgnMarketCompany[] | { items?: NgnMarketCompany[] };
  };

  const rows = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray((payload.data as { items?: NgnMarketCompany[] })?.items)
      ? (payload.data as { items: NgnMarketCompany[] }).items
      : null;

  if (!rows?.length) return null;

  return rows
    .map((row) =>
      normalizeCompany(
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
    .filter(Boolean) as DisclosureCompany[];
}

export async function loadDisclosureCompanies(options?: {
  exchanges?: DisclosureExchange[];
  apiKey?: string;
  preferCache?: boolean;
}): Promise<DisclosureCompany[]> {
  const exchanges = options?.exchanges?.length
    ? options.exchanges
    : (["NGX", "FMDQ", "NASD"] as DisclosureExchange[]);

  const companies: DisclosureCompany[] = [];

  for (const exchange of exchanges) {
    if (exchange === "NGX") {
      const apiKey = options?.apiKey ?? process.env.NGN_MARKET_API_KEY?.trim();
      if (apiKey && !options?.preferCache) {
        const remote = await fetchNgxFromNgnMarket(apiKey);
        if (remote?.length) {
          companies.push(...remote);
          continue;
        }
      }
    }
    companies.push(...loadExchangeCompanies(exchange, options?.preferCache ?? true));
  }

  if (options?.preferCache && fs.existsSync(COMBINED_CACHE) && exchanges.length === 3) {
    const combined = readJsonFile<Partial<DisclosureCompany>>(COMBINED_CACHE);
    if (combined.length) {
      return combined.map((r) => normalizeCompany(r, r.exchange ?? "NGX")).filter(Boolean) as DisclosureCompany[];
    }
  }

  return companies;
}

export async function syncDisclosureCompaniesToFiles(apiKey?: string): Promise<DisclosureCompany[]> {
  const key = apiKey ?? process.env.NGN_MARKET_API_KEY?.trim();
  let ngx = key ? await fetchNgxFromNgnMarket(key) : null;
  if (!ngx?.length) ngx = loadExchangeCompanies("NGX", false);

  const fmdq = loadExchangeCompanies("FMDQ", false);
  const nasd = loadExchangeCompanies("NASD", false);
  const all = [...ngx, ...fmdq, ...nasd];

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, EXCHANGE_FILES.NGX.cache), `${JSON.stringify(ngx, null, 2)}\n`);
  fs.writeFileSync(path.join(DATA_DIR, EXCHANGE_FILES.FMDQ.cache), `${JSON.stringify(fmdq, null, 2)}\n`);
  fs.writeFileSync(path.join(DATA_DIR, EXCHANGE_FILES.NASD.cache), `${JSON.stringify(nasd, null, 2)}\n`);
  fs.writeFileSync(COMBINED_CACHE, `${JSON.stringify(all, null, 2)}\n`);

  return all;
}

/** @deprecated use loadDisclosureCompanies */
export async function loadNgxCompanies(options?: {
  apiKey?: string;
  preferCache?: boolean;
}): Promise<DisclosureCompany[]> {
  return loadDisclosureCompanies({ exchanges: ["NGX"], ...options });
}

export function disclosureCompanyPaths() {
  return { dataDir: DATA_DIR, combinedCache: COMBINED_CACHE, exchangeFiles: EXCHANGE_FILES };
}
