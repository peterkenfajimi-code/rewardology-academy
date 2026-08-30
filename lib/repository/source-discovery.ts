import type { CountryCode, DisclosureExchange, SourceType } from "@/lib/repository/types";
import { isSourceWithinRecencyWindow } from "@/lib/repository/collection-policy";
import { regulatoryFilingUrl } from "@/lib/repository/exchange-config";

export type DisclosureCompany = {
  ticker: string;
  name: string;
  exchange: DisclosureExchange;
  country?: CountryCode;
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

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Bot-protected sites often block the corporate site; crawl the holdco IR site too. */
const WEBSITE_FALLBACK_ORIGINS: Record<string, string[]> = {
  "gtbank.com": ["https://gtcoplc.com", "https://www.gtcoplc.com"],
  "www.gtbank.com": ["https://gtcoplc.com", "https://www.gtcoplc.com"],
};

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
  let host = "";
  try {
    host = new URL(origin).hostname.toLowerCase();
  } catch {
    /* ignore */
  }

  if (host.includes("gtcoplc.com")) {
    return [
      origin,
      `${origin}/who-we-are/careers`,
      `${origin}/who-we-are/our-people`,
      `${origin}/how-we-give-back/csr-reports`,
      `${origin}/investor-relations`,
      `${origin}/investor-relations/annual-reports`,
      `${origin}/investor-relations/financial-resources`,
      `${origin}/what-we-think/in-the-news`,
      `${origin}/investor-relations/outlook-insights`,
    ];
  }

  if (host.includes("gcbbank.com.gh")) {
    return [
      origin,
      `${origin}/downloadable-reports`,
      `${origin}/downloads/reports`,
      `${origin}/group-results-and-reporting`,
      `${origin}/careers`,
    ];
  }

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

function crawlOrigins(website: string): string[] {
  const origins: string[] = [];
  const seen = new Set<string>();

  const add = (raw: string) => {
    try {
      const origin = new URL(raw.startsWith("http") ? raw : `https://${raw}`).origin;
      if (!seen.has(origin)) {
        seen.add(origin);
        origins.push(origin);
      }
    } catch {
      /* ignore */
    }
  };

  add(website);
  try {
    const host = new URL(website.startsWith("http") ? website : `https://${website}`).hostname
      .toLowerCase();
    for (const fallback of WEBSITE_FALLBACK_ORIGINS[host] ?? []) {
      add(fallback);
    }
  } catch {
    /* ignore */
  }

  return origins;
}

const FMDQ_COMPLIANCE_URL = "https://fmdqgroup.com/exchange/listing-quotations-compliance/";

function fmdqIssuerUrl(issuerPath: string): string {
  const slug = issuerPath.replace(/^\/+|\/+$/g, "");
  return `https://fmdqgroup.com/exchange/issuer/${slug}/`;
}

const NASD_PRICES_URL = "https://nasdng.com/prices-markets/companies-prices/";

function exchangeRegulatorySources(company: DisclosureCompany): DiscoveredSource[] {
  if (!company.ticker?.trim()) return [];

  const label = company.exchange;
  const sources: DiscoveredSource[] = [
    {
      source_type: "regulatory_filing",
      source_url: regulatoryFilingUrl(company.exchange, company.ticker),
      source_title: `${label} listing — ${company.ticker}`,
      publication_date: null,
    },
  ];

  if (company.exchange === "FMDQ" && company.fmdq_issuer_path?.trim()) {
    sources.push({
      source_type: "regulatory_filing",
      source_url: fmdqIssuerUrl(company.fmdq_issuer_path),
      source_title: `FMDQ issuer page — ${company.name}`,
      publication_date: null,
    });
  }

  if (company.exchange === "NASD") {
    sources.push({
      source_type: "regulatory_filing",
      source_url: NASD_PRICES_URL,
      source_title: `NASD company prices — ${company.ticker}`,
      publication_date: null,
    });
  }

  if (company.exchange === "FMDQ") {
    sources[0] = {
      source_type: "regulatory_filing",
      source_url: FMDQ_COMPLIANCE_URL,
      source_title: "FMDQ post-listing compliance disclosures",
      publication_date: null,
    };
  }

  return sources;
}

export async function discoverSourcesForCompany(company: DisclosureCompany): Promise<DiscoveredSource[]> {
  const found = new Map<string, DiscoveredSource>();
  const website = company.website?.trim();

  const add = (source: DiscoveredSource) => {
    const key = `${source.source_type}::${source.source_url}`;
    if (!found.has(key)) found.set(key, source);
  };

  for (const source of exchangeRegulatorySources(company)) {
    add(source);
  }

  if (!website) {
    return [...found.values()];
  }

  const visited = new Set<string>();
  const queue: string[] = [];
  for (const origin of crawlOrigins(website)) {
    for (const path of investorPaths(origin)) {
      if (!queue.includes(path)) queue.push(path);
    }
  }

  for (const pageUrl of queue.slice(0, 20)) {
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

function isPdfUrl(url: string): boolean {
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return /\.pdf(?:\?|$)/i.test(url);
  }
}

export function prioritizeDiscoveredSources(
  sources: DiscoveredSource[],
  maxPdfPerType = 3
): DiscoveredSource[] {
  function yearFrom(source: DiscoveredSource): number {
    const haystack = `${source.publication_date ?? ""} ${source.source_url} ${source.source_title}`;
    const years = [...haystack.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
    return years.length ? Math.max(...years) : 0;
  }

  const html = sources.filter((s) => !isPdfUrl(s.source_url));
  const pdfs = sources.filter((s) => isPdfUrl(s.source_url));
  const byType = new Map<SourceType, DiscoveredSource[]>();

  for (const source of pdfs) {
    const bucket = byType.get(source.source_type) ?? [];
    bucket.push(source);
    byType.set(source.source_type, bucket);
  }

  const keptPdfs: DiscoveredSource[] = [];
  for (const list of byType.values()) {
    list.sort((a, b) => yearFrom(b) - yearFrom(a));
    keptPdfs.push(...list.slice(0, maxPdfPerType));
  }

  return [...html, ...keptPdfs];
}

export function filterSourcesByRecency(
  sources: DiscoveredSource[],
  referenceDate = new Date()
): DiscoveredSource[] {
  return sources.filter((s) => isSourceWithinRecencyWindow(s, referenceDate));
}

export function filterSourcesByTypes(
  sources: DiscoveredSource[],
  sourceTypes?: SourceType[]
): DiscoveredSource[] {
  if (!sourceTypes?.length) return sources;
  const allowed = new Set(sourceTypes);
  return sources.filter((s) => allowed.has(s.source_type));
}
