/**
 * Discovery-only pass for a second company in an already-tested regime.
 * Finds sources, downloads annual-report PDFs, does not extract or publish.
 *
 * Usage: npx tsx scripts/discover-and-download.ts --ticker=UBA
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadDisclosureCompanies } from "../lib/repository/disclosure-companies";
import {
  discoverSourcesForCompany,
  filterSourcesByRecency,
  prioritizeDiscoveredSources,
} from "../lib/repository/source-discovery";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tickerArg = process.argv.find((a) => a.startsWith("--ticker="))?.slice("--ticker=".length);
const TICKER = (tickerArg ?? "UBA").trim().toUpperCase();
const FALLBACK_PDFS: Record<string, { url: string; title: string }[]> = {
  UBA: [
    {
      url: "https://doclib.ngxgroup.com/Financial_NewsDocs/43402_UNITED_BANK_FOR_AFRICA_PLC-_QUARTER_5_-_FINANCIAL_STATEMENT_FOR_2024_FINANCIAL_STATEMENTS_MARCH_2025.pdf",
      title: "UBA Plc FY2024 financial statements (NGX filing)",
    },
  ],
};

async function downloadPdf(url: string, dest: string): Promise<number> {
  const res = await fetch(url, {
    headers: { "User-Agent": "RewardologyAcademyRepository/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000 || buf.subarray(0, 4).toString() !== "%PDF") {
    throw new Error(`Not a PDF (${buf.length} bytes) ${url}`);
  }
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const companies = await loadDisclosureCompanies({ preferCache: true });
  const company = companies.find((c) => c.ticker.toUpperCase() === TICKER);
  if (!company) throw new Error(`${TICKER} not in disclosure list`);

  const outDir = path.join(root, "data", `${TICKER.toLowerCase()}-downloads`);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`${company.name} ${company.exchange}:${company.ticker} ${company.website}`);

  const discovered = await discoverSourcesForCompany(company);
  const kept = filterSourcesByRecency(prioritizeDiscoveredSources(discovered));
  console.log(`Discovered ${discovered.length} sources, ${kept.length} after recency/priority`);
  for (const s of kept) {
    console.log(`  ${s.source_type.padEnd(22)} ${s.source_title} — ${s.source_url}`);
  }

  const pdfs = kept.filter((s) => s.source_type === "annual_report" && /\.pdf/i.test(s.source_url));
  const extras = FALLBACK_PDFS[TICKER] ?? [];
  for (const extra of extras) {
    if (!pdfs.some((p) => p.source_url === extra.url)) {
      pdfs.push({
        source_type: "annual_report",
        source_url: extra.url,
        source_title: extra.title,
        publication_date: "2024-12-31",
      });
      console.log(`FALLBACK PDF ${extra.title}`);
    }
  }

  if (!pdfs.length) {
    console.log("No annual-report PDFs in discovery — nothing to download.");
    return;
  }

  for (const pdf of pdfs.slice(0, 3)) {
    const name = path.basename(new URL(pdf.source_url).pathname) || `${TICKER}-report.pdf`;
    const dest = path.join(outDir, name);
    try {
      const bytes = await downloadPdf(pdf.source_url, dest);
      console.log(`DOWNLOADED ${dest} (${bytes} bytes)`);
    } catch (e) {
      console.log(`FAIL download ${pdf.source_url}: ${e instanceof Error ? e.message : e}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
