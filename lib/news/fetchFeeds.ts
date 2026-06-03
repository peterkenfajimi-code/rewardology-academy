import type { NewsItem, NewsSource } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";

const RSS2JSON = "https://api.rss2json.com/v1/api.json";

async function fetchOneSource(source: NewsSource): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    rss_url: source.url,
    count: "4",
  });
  const apiKey = process.env.RSS2JSON_API_KEY;
  if (apiKey) params.set("api_key", apiKey);

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

  return (data.items || []).slice(0, 4).map((item) => ({
    title: item.title || "",
    description: item.description || item.content || "",
    link: item.link || "#",
    pubDate: item.pubDate || "",
    source: source.name,
    tag: source.tag,
  }));
}

export async function fetchTabNews(tabKey: string): Promise<NewsItem[]> {
  const config = FEEDS[tabKey];
  if (!config) throw new Error("Unknown tab");

  const results = await Promise.allSettled(config.sources.map((s) => fetchOneSource(s)));
  const collected: NewsItem[] = [];
  const errors: string[] = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") collected.push(...r.value);
    else errors.push(r.reason?.message || config.sources[i].name);
  });

  const seen = new Set<string>();
  const unique = collected
    .filter((i) => {
      if (!i.title || seen.has(i.title)) return false;
      seen.add(i.title);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 8);

  if (!unique.length) {
    throw new Error(errors[0] || "No articles loaded");
  }

  return unique;
}
