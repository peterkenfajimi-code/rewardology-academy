import type { NewsItem } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";

const NEWSDATA_API = "https://newsdata.io/api/1/latest";
const MAX_ITEMS_PER_TAB = 8;

type NewsDataArticle = {
  title?: string;
  link?: string;
  description?: string;
  content?: string;
  pubDate?: string;
  source_name?: string;
  source_id?: string;
};

type NewsDataResponse = {
  status?: string;
  code?: string | number;
  message?: string;
  results?: NewsDataArticle[];
};

export class NewsDataLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NewsDataLimitError";
  }
}

export function isNewsDataLimitError(error: unknown): boolean {
  if (error instanceof NewsDataLimitError) return true;
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("api credit") ||
    message.includes("credit limit") ||
    message.includes("quota")
  );
}

function isLimitResponse(res: Response, data: NewsDataResponse): boolean {
  if (res.status === 429) return true;
  if (String(data.code) === "429") return true;

  const message = (data.message || "").toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("api credit") ||
    message.includes("credit limit") ||
    message.includes("quota")
  );
}

export async function fetchTabFromNewsData(tabKey: string): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const config = FEEDS[tabKey];
  if (!config) throw new Error("Unknown tab");

  const params = new URLSearchParams({
    apikey: apiKey,
    q: config.newsDataQuery,
    language: "en",
    size: String(MAX_ITEMS_PER_TAB),
    timeframe: "48",
  });

  const res = await fetch(`${NEWSDATA_API}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "RewardologyAcademy/1.0" },
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 300 },
  });

  const data = (await res.json()) as NewsDataResponse;

  if (isLimitResponse(res, data)) {
    throw new NewsDataLimitError(data.message || "NewsData.io rate limit exceeded");
  }

  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || `NewsData.io: HTTP ${res.status}`);
  }

  const defaultTag = config.sources[0]?.tag || "News";

  return (data.results || [])
    .filter((article) => article.title && article.link)
    .slice(0, MAX_ITEMS_PER_TAB)
    .map((article) => ({
      title: article.title || "",
      description: article.description || article.content || "",
      link: article.link || "#",
      pubDate: article.pubDate || "",
      source: article.source_name || article.source_id || "NewsData.io",
      tag: defaultTag,
    }));
}
