import type { NewsItem } from "@/lib/news/feedConfig";
import { fetchTabFromNewsData, isNewsDataLimitError } from "@/lib/news/fetchNewsData";
import { fetchTabFromRss } from "@/lib/news/fetchRssFeeds";

export type FetchTabResult = {
  items: NewsItem[];
  warnings: string[];
  provider: "newsdata" | "rss";
};

export async function fetchTabNews(tabKey: string): Promise<FetchTabResult> {
  if (!process.env.NEWSDATA_API_KEY) {
    return fetchTabFromRss(tabKey);
  }

  try {
    const items = await fetchTabFromNewsData(tabKey);
    if (items.length) {
      return { items, warnings: [], provider: "newsdata" };
    }
  } catch (error) {
    if (isNewsDataLimitError(error)) {
      const message = error instanceof Error ? error.message : "NewsData.io limit exceeded";
      return fetchTabFromRss(tabKey, [`${message} — using RSS fallback`]);
    }
    throw error;
  }

  return fetchTabFromRss(tabKey, ["NewsData.io returned no articles — using RSS fallback"]);
}
