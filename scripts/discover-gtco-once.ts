import { discoverSourcesForCompany } from "../lib/repository/source-discovery";

const company = {
  ticker: "GTCO",
  name: "Guaranty Trust Holding Company Plc",
  exchange: "NGX" as const,
  country: "NG" as const,
  website: process.argv[2] ?? "https://www.gtbank.com",
};

async function main() {
  const sources = await discoverSourcesForCompany(company);
  for (const s of sources) {
    console.log(`${s.source_type}\t${s.source_url}`);
  }
  console.log(`\nTotal: ${sources.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
