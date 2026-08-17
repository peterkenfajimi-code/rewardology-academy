import type { DisclosureExchange, SourceType } from "@/lib/repository/types";

export type DisclosureCompany = {
  ticker: string;
  name: string;
  exchange: DisclosureExchange;
  sector?: string | null;
  website?: string | null;
  /** FMDQ issuer page slug under /exchange/issuer/{slug}/ */
  fmdq_issuer_path?: string | null;
};

/** @deprecated use DisclosureCompany */
export type NgxCompany = DisclosureCompany;

export type DiscoveredSource = {
  source_type: SourceType;
  source_url: string;
  source_title: string;
  publication_date?: string | null;
};

const USER_AGENT = "Rewardology-Repository-Batch/1.0";

export const AUTOMATED_SOURCE_TYPES: SourceType[] = [
  "annual_report",
  "sustainability_report",
  "careers_page",
  "press_release",
  "regulatory_filing",
  "linkedin",
  "award_recognition",
];

const ANNUAL_PATTERNS =
  /\b(annual\s+report|integrated\s+report|financial\s+statements|investor\s+presentation|ar\s*20\d{2}|fy\s*20\d{2}|20\d{2}\s+annual)\b/i;
const SUSTAINABILITY_PATTERNS =
  /\b(sustainability|esg|csr|impact\s+report|corporate\s+responsibility|non[- ]financial)\b/i;
const AWARD_PATTERNS =
  /\b(best\s+employer|great\s+place\s+to\s+work|employer\s+of\s+choice|workplace\s+award|hr\s+award)\b/i;

function normalizeUrl(href: string, base: URL): string | null {
  try {
    const resolved = new URL(href, base);
    if (!["http:", "https:"].includes(resolved.protocol)) return null;
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}

function extractYear(text: string): string | null {
  const match = text.match(/\b(20\d{2})\b/);
  return match ? `${match[1]}-12-31` : null;
}

function classifyLink(
  url: string,
  linkText: string
): { source_type: SourceType; title: string } | null {
  const combined = `${linkText} ${url}`;
  const lowerPath = new URL(url).pathname.toLowerCase();

  if (url.includes("linkedin.com/company")) {
    return { source_type: "linkedin", title: linkText.trim() || "LinkedIn company page" };
  }

  if (
    /\/(careers|jobs|work-with-us|join-us|vacancies)(\/|$)/i.test(lowerPath) ||
    /\b(careers|jobs|vacancies)\b/i.test(linkText)
  ) {
    return { source_type: "careers_page", title: linkText.trim() || "Careers page" };
  }

  if (
    /\/(news|media|press|announcements|investor-news)(\/|$)/i.test(lowerPath) ||
    /\b(press release|news release|media release)\b/i.test(combined)
  ) {
    return { source_type: "press_release", title: linkText.trim() || "Press / news" };
  }

  if (AWARD_PATTERNS.test(combined)) {
    return { source_type: "award_recognition", title: linkText.trim() || "Award / recognition" };
  }

  if (
    SUSTAINABILITY_PATTERNS.test(combined) &&
    (lowerPath.endsWith(".pdf") || SUSTAINABILITY_PATTERNS.test(linkText))
  ) {
    return {
      source_type: "sustainability_report",
      title: linkText.trim() || "Sustainability / ESG report",
    };
  }

  if (
    ANNUAL_PATTERNS.test(combined) &&
    (lowerPath.endsWith(".pdf") || ANNUAL_PATTERNS.test(linkText))
  ) {
    return { source_type: "annual_report", title: linkText.trim() || "Annual report" };
  }

  if (lowerPath.endsWith(".pdf")) {
    if (SUSTAINABILITY_PATTERNS.test(combined)) {
      return { source_type: "sustainability_report", title: linkText.trim() || "PDF report" };
    }
    if (ANNUAL_PATTERNS.test(combined)) {
      return { source_type: "annual_report", title: linkText.trim() || "PDF report" };
    }
  }

  return null;
}

function extractLinks(html: string, baseUrl: URL): { url: string; text: string }[] {
  const links: { url: string; text: string }[] = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const url = normalizeUrl(match[1], baseUrl);
    if (!url) continue;
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    links.push({ url, text });
  }
  return links;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "").toLowerCase();
    if (type.includes("pdf")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function investorPaths(origin: string): string[] {
  return [
    origin,
    `${origin}/investors`,
    `${origin}/investor-relations`,
    `${origin}/investor-relations/reports`,
    `${origin}/about/investors`,
    `${origin}/corporate/investors`,
    `${origin}/careers`,
    `${origin}/news`,
    `${origin}/media`,
    `${origin}/sustainability`,
    `${origin}/esg`,
  ];
}

function ngxDisclosureUrl(ticker: string): string {
  return `https://ngxgroup.com/exchange/trade/equities/${encodeURIComponent(ticker.toLowerCase())}/`;
}

const FMDQ_COMPLIANCE_URL = "https://fmdqgroup.com/exchange/listing-quotations-compliance/";

function fmdqIssuerUrl(issuerPath: string): string {
  const slug = issuerPath.replace(/^\/+|\/+$/g, "");
  return `https://fmdqgroup.com/exchange/issuer/${slug}/`;
}

const NASD_SECURITIES_URL = "https://nasdng.com/prices-markets/securities-categorization/";
const NASD_PRICES_URL = "https://nasdng.com/prices-markets/companies-prices/";

function exchangeRegulatorySources(company: DisclosureCompany): DiscoveredSource[] {
  switch (company.exchange) {
    case "NGX":
      return company.ticker
        ? [
            {
              source_type: "regulatory_filing",
              source_url: ngxDisclosureUrl(company.ticker),
              source_title: `NGX equity page — ${company.ticker}`,
              publication_date: null,
            },
          ]
        : [];
    case "FMDQ": {
      const sources: DiscoveredSource[] = [
        {
          source_type: "regulatory_filing",
          source_url: FMDQ_COMPLIANCE_URL,
          source_title: "FMDQ post-listing compliance disclosures",
          publication_date: null,
        },
      ];
      if (company.fmdq_issuer_path?.trim()) {
        sources.push({
          source_type: "regulatory_filing",
          source_url: fmdqIssuerUrl(company.fmdq_issuer_path),
          source_title: `FMDQ issuer page — ${company.name}`,
          publication_date: null,
        });
      }
      return sources;
    }
    case "NASD":
      return [
        {
          source_type: "regulatory_filing",
          source_url: NASD_SECURITIES_URL,
          source_title: `NASD securities categorization — ${company.ticker}`,
          publication_date: null,
        },
        {
          source_type: "regulatory_filing",
          source_url: NASD_PRICES_URL,
          source_title: `NASD company prices — ${company.ticker}`,
          publication_date: null,
        },
      ];
    default:
      return [];
  }
}

export async function discoverSourcesForCompany(company: DisclosureCompany): Promise<DiscoveredSource[]> {
  const found = new Map<string, DiscoveredSource>();
  const website = company.website?.trim();

  const add = (source: DiscoveredSource) => {
    const key = `${source.source_type}::${source.source_url}`;
    if (!found.has(key)) found.set(key, source);
  };

  if (company.ticker || company.exchange !== "NGX") {
    for (const source of exchangeRegulatorySources(company)) {
      add(source);
    }
  }

  if (!website) {
    return [...found.values()];
  }

  let base: URL;
  try {
    base = new URL(website.startsWith("http") ? website : `https://${website}`);
  } catch {
    return [...found.values()];
  }

  const visited = new Set<string>();
  const queue = investorPaths(base.origin).slice(0, 12);

  for (const pageUrl of queue) {
    if (visited.has(pageUrl)) continue;
    visited.add(pageUrl);

    const html = await fetchHtml(pageUrl);
    if (!html) continue;

    for (const link of extractLinks(html, new URL(pageUrl))) {
      const classified = classifyLink(link.url, link.text);
      if (classified) {
        add({
          source_type: classified.source_type,
          source_url: link.url,
          source_title: classified.title,
          publication_date: extractYear(`${classified.title} ${link.url}`),
        });
      }
    }

    if (found.size >= 24) break;
  }

  return [...found.values()].filter((s) => AUTOMATED_SOURCE_TYPES.includes(s.source_type));
}

export function filterSourcesByTypes(
  sources: DiscoveredSource[],
  sourceTypes?: SourceType[]
): DiscoveredSource[] {
  if (!sourceTypes?.length) return sources;
  const allowed = new Set(sourceTypes);
  return sources.filter((s) => allowed.has(s.source_type));
}
