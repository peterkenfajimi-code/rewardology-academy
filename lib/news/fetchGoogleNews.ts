import type { NewsItem } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";
import { parseRssXml } from "@/lib/news/parseRss";

const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search";

function googleSourceFromTitle(title: string): string {
  const match = title.match(/\s-\s([^-]+)$/);
  return match ? match[1].trim() : "Google News";
}

export async function fetchTabFromGoogleNews(tabKey: string): Promise<NewsItem[]> {
  const config = FEEDS[tabKey];
  if (!config) throw new Error("Unknown tab");

  const params = new URLSearchParams({
    q: config.googleNewsQuery,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  });

  const res = await fetch(`${GOOGLE_NEWS_RSS}?${params}`, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml", "User-Agent": "RewardologyAcademy/1.0" },
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 1800 },
  });

  if (!res.ok) throw new Error(`Google News: HTTP ${res.status}`);

  const xml = await res.text();
  const defaultTag = config.sources[0]?.tag || "News";

  return parseRssXml(xml).map((item) => ({
    title: item.title,
    description: item.description,
    link: item.link,
    pubDate: item.pubDate,
    source: googleSourceFromTitle(item.title),
    tag: defaultTag,
  }));
}
