import type { CountryCode, DisclosureExchange } from "@/lib/repository/types";

/** Country for each disclosure venue (NG has three venues). */
export const EXCHANGE_COUNTRY: Record<DisclosureExchange, CountryCode> = {
  NGX: "NG",
  FMDQ: "NG",
  NASD: "NG",
  JSE: "ZA",
  NSE: "KE",
  GSE: "GH",
  EGX: "EG",
  RSE: "RW",
};

/** Recommended Guide 1 collection sequence (1 = first after Nigeria baseline). */
export const COLLECTION_PRIORITY: Record<CountryCode, number> = {
  NG: 1,
  ZA: 2,
  KE: 3,
  GH: 4,
  EG: 5,
  RW: 6,
};

export const COLLECTION_ROLLOUT_NOTES: Record<CountryCode, string> = {
  NG: "Primary market. NGX + FMDQ + NASD widen pool beyond listed equity. ~15% of large issuers publish sustainability reports beyond financials.",
  ZA: "Strongest second market — JSE (~430 listed). Best sub-Saharan sustainability/ESG depth. Expect rich voluntary-benefit narrative.",
  KE: "NSE — IFRS-based annual reports, similar structure to NGX. Mandatory IAS 19 notes reliable; sustainability less universal.",
  GH: "GSE — smaller than NGX/JSE. Solid pension/gratuity notes; fewer listed companies.",
  EG: "EGX — FRA oversight, EAS/IFRS-aligned. Mandatory financial disclosure; voluntary benefits sparser outside largest names.",
  RW: "RSE — very few listed companies. Guide 1 alone weak; lean on Guides 2, 3, and 7.",
};

export function regulatoryFilingUrl(exchange: DisclosureExchange, ticker: string): string {
  const t = encodeURIComponent(ticker.trim());
  switch (exchange) {
    case "NGX":
      return `https://ngxgroup.com/exchange/data/company-profile/?symbol=${encodeURIComponent(ticker.trim().toUpperCase())}&directory=companydirectory`;
    case "FMDQ":
      return "https://fmdqgroup.com/exchange/listing-quotations-compliance/";
    case "NASD":
      return "https://nasdng.com/prices-markets/securities-categorization/";
    case "JSE":
      return `https://www.jse.co.za/trade/equities/${t.toLowerCase()}`;
    case "NSE":
      return `https://www.nse.co.ke/datasite/company-profile?CompanyCode=${t}`;
    case "GSE":
      return "https://gse.com.gh/listed-companies/";
    case "EGX":
      return `https://www.egx.com.eg/en/DisplayCompany.aspx?company=${t}`;
    case "RSE":
      return "https://rse.rw/listed-companies/";
    default:
      return "";
  }
}

export function exchangesForCountries(countries: CountryCode[]): DisclosureExchange[] {
  return (Object.entries(EXCHANGE_COUNTRY) as [DisclosureExchange, CountryCode][])
    .filter(([, country]) => countries.includes(country))
    .map(([exchange]) => exchange);
}

export const ALL_DISCLOSURE_EXCHANGES = Object.keys(EXCHANGE_COUNTRY) as DisclosureExchange[];
