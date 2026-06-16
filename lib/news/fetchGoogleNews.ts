import type { NewsItem } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";
import { fetchRemoteXml } from "@/lib/news/fetchRemoteXml";
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

  const xml = await fetchRemoteXml(`${GOOGLE_NEWS_RSS}?${params}`);
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
