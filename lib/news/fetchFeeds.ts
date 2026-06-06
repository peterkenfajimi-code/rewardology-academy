import type { NewsItem, NewsSource } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";
const MAX_ITEMS_PER_SOURCE = 4;
const MAX_ITEMS_PER_TAB = 8;

export type FetchTabResult = {
  items: NewsItem[];
  warnings: string[];
};

async function fetchOneSource(source: NewsSource): Promise<NewsItem[]> {
  const params = new URLSearchParams({ rss_url: source.url });
  const apiKey = process.env.RSS2JSON_API_KEY;
  if (apiKey) {
    params.set("api_key", apiKey);
    params.set("count", String(MAX_ITEMS_PER_SOURCE));
  }

  const res = await fetch(`${RSS2JSON}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "RewardologyAcademy/1.0" },
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);

  const data = (await res.json()) as {
    status?: string;
    message?: string;
    items?: Record<string, string>[];
  };

  if (data.status !== "ok") {
    throw new Error(data.message || `${source.name}: feed error`);
  }

  return (data.items || []).slice(0, MAX_ITEMS_PER_SOURCE).map((item) => ({
    title: item.title || "",
    description: item.description || item.content || "",
    link: item.link || "#",
    pubDate: item.pubDate || "",
    source: source.name,
    tag: source.tag,
  }));
}

export async function fetchTabNews(tabKey: string): Promise<FetchTabResult> {
  const config = FEEDS[tabKey];
  if (!config) throw new Error("Unknown tab");

  const results = await Promise.allSettled(config.sources.map((s) => fetchOneSource(s)));
  const collected: NewsItem[] = [];
  const warnings: string[] = [];

  results.forEach((r, i) => {
    const sourceName = config.sources[i].name;
    if (r.status === "fulfilled") {
      if (r.value.length) collected.push(...r.value);
      else warnings.push(`${sourceName}: no articles returned`);
      return;
    }
    warnings.push(r.reason?.message || `${sourceName}: feed unavailable`);
  });

  const seen = new Set<string>();
  const items = collected
    .filter((i) => {
      if (!i.title || seen.has(i.title)) return false;
      seen.add(i.title);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, MAX_ITEMS_PER_TAB);

  if (!items.length) {
    throw new Error(warnings.join("; ") || "No articles loaded");
  }

  return { items, warnings };
}
