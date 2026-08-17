import fs from "fs";
import path from "path";
import type { NgxCompany } from "@/lib/repository/source-discovery";

const SEED_PATH = path.join(process.cwd(), "data", "ngx-companies-seed.json");
const OUTPUT_PATH = path.join(process.cwd(), "data", "ngx-companies.json");

type NgnMarketCompany = {
  symbol?: string;
  ticker?: string;
  name?: string;
  sector?: string;
  website?: string;
  website_url?: string;
};

function readSeed(): NgxCompany[] {
  if (!fs.existsSync(SEED_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(SEED_PATH, "utf8")) as NgxCompany[];
  return raw.filter((c) => c.ticker && c.name);
}

async function fetchFromNgnMarket(apiKey: string): Promise<NgxCompany[] | null> {
  const res = await fetch("https://api.ngnmarket.com/v1/companies?limit=500", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return null;

  const payload = (await res.json()) as {
    success?: boolean;
    data?: NgnMarketCompany[] | { items?: NgnMarketCompany[] };
  };

  const rows = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray((payload.data as { items?: NgnMarketCompany[] })?.items)
      ? (payload.data as { items: NgnMarketCompany[] }).items
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

export async function loadNgxCompanies(options?: {
  apiKey?: string;
  preferCache?: boolean;
}): Promise<NgxCompany[]> {
  if (options?.preferCache && fs.existsSync(OUTPUT_PATH)) {
    const cached = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8")) as NgxCompany[];
    if (cached.length) return cached;
  }

  const apiKey = options?.apiKey ?? process.env.NGN_MARKET_API_KEY?.trim();
  if (apiKey) {
    const remote = await fetchFromNgnMarket(apiKey);
    if (remote?.length) return remote;
  }

  if (fs.existsSync(OUTPUT_PATH)) {
    const cached = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8")) as NgxCompany[];
    if (cached.length) return cached;
  }

  return readSeed();
}

export async function syncNgxCompaniesToFile(apiKey?: string): Promise<NgxCompany[]> {
  const key = apiKey ?? process.env.NGN_MARKET_API_KEY?.trim();
  let companies = key ? await fetchFromNgnMarket(key) : null;
  if (!companies?.length) companies = readSeed();

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(companies, null, 2)}\n`, "utf8");
  return companies;
}

export function ngxCompanyPaths() {
  return { seedPath: SEED_PATH, outputPath: OUTPUT_PATH };
}
