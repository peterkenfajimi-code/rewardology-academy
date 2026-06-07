import type { NewsItem } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";

const NEWSDATA_API = "https://newsdata.io/api/1/latest";
const MAX_ITEMS_PER_TAB = 8;
const FETCH_SIZE = 10;

const HR_RELEVANCE =
  /\b(hr|human resources|employer|employee|workplace|compensation|payroll|workforce|hiring|recruiting|benefits plan|open enrollment|401k|health plan|total rewards|pay equity|salary|wages|talent management)\b/i;

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
  results?: NewsDataArticle[] | { message?: string; code?: string };
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

function getErrorMessage(data: NewsDataResponse): string {
  if (data.message) return data.message;
  const results = data.results;
  if (results && !Array.isArray(results) && results.message) return results.message;
  return "";
}

function isLimitResponse(res: Response, data: NewsDataResponse): boolean {
  if (res.status === 429) return true;
  if (String(data.code) === "429") return true;

  const message = getErrorMessage(data).toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("api credit") ||
    message.includes("credit limit") ||
    message.includes("quota")
  );
}

function isHrRelevant(article: NewsDataArticle): boolean {
  const text = `${article.title || ""} ${article.description || ""} ${article.content || ""}`;
  return HR_RELEVANCE.test(text);
}

export async function fetchTabFromNewsData(tabKey: string): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const config = FEEDS[tabKey];
  if (!config) throw new Error("Unknown tab");

  const params = new URLSearchParams({
    apikey: apiKey,
    qInTitle: config.newsDataTitleQuery,
    q: config.newsDataQuery,
    language: "en",
    country: "us,gb,ca,au",
    size: String(FETCH_SIZE),
  });

  const res = await fetch(`${NEWSDATA_API}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "RewardologyAcademy/1.0" },
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 300 },
  });

  const data = (await res.json()) as NewsDataResponse;

  if (isLimitResponse(res, data)) {
    throw new NewsDataLimitError(getErrorMessage(data) || "NewsData.io rate limit exceeded");
  }

  if (!res.ok || data.status !== "success") {
    throw new Error(getErrorMessage(data) || `NewsData.io: HTTP ${res.status}`);
  }

  const defaultTag = config.sources[0]?.tag || "News";
  const articles = Array.isArray(data.results) ? data.results : [];

  return articles
    .filter((article) => article.title && article.link && isHrRelevant(article))
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
