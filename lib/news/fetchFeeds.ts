import type { NewsItem } from "@/lib/news/feedConfig";
import { getFallbackArticles } from "@/lib/news/fallbackArticles";
import { fetchTabFromGoogleNews } from "@/lib/news/fetchGoogleNews";
import { fetchTabFromNewsData, isNewsDataLimitError } from "@/lib/news/fetchNewsData";
import { fetchTabFromRss } from "@/lib/news/fetchRssFeeds";
import { mergeAndRankItems } from "@/lib/news/mergeItems";
import { filterRelevantItems } from "@/lib/news/relevanceFilter";

export type FetchTabResult = {
  items: NewsItem[];
  warnings: string[];
  provider: "google" | "newsdata" | "rss" | "mixed" | "fallback";
};

async function fetchNewsDataSafe(tabKey: string): Promise<{ items: NewsItem[]; warning?: string }> {
  if (!process.env.NEWSDATA_API_KEY) return { items: [] };
  try {
    const items = await fetchTabFromNewsData(tabKey);
    return { items };
  } catch (error) {
    const message = error instanceof Error ? error.message : "NewsData.io unavailable";
    if (isNewsDataLimitError(error)) {
      return { items: [], warning: `${message} — skipped NewsData.io` };
    }
    return { items: [], warning: `${message} — skipped NewsData.io` };
  }
}

function resolveProvider(sources: { google: number; newsdata: number; rss: number }): FetchTabResult["provider"] {
  const active = [sources.google, sources.newsdata, sources.rss].filter((n) => n > 0).length;
  if (active > 1) return "mixed";
  if (sources.google > 0) return "google";
  if (sources.newsdata > 0) return "newsdata";
  if (sources.rss > 0) return "rss";
  return "fallback";
}

export async function fetchTabNews(tabKey: string): Promise<FetchTabResult> {
  const warnings: string[] = [];
  const collected: NewsItem[] = [];
  const sourceCounts = { google: 0, newsdata: 0, rss: 0 };

  const [googleResult, rssResult, newsDataResult] = await Promise.allSettled([
    fetchTabFromGoogleNews(tabKey),
    fetchTabFromRss(tabKey),
    fetchNewsDataSafe(tabKey),
  ]);

  if (googleResult.status === "fulfilled") {
    sourceCounts.google = googleResult.value.length;
    collected.push(...googleResult.value);
  } else {
    warnings.push(googleResult.reason?.message || "Google News unavailable");
  }

  if (rssResult.status === "fulfilled") {
    sourceCounts.rss = rssResult.value.items.length;
    collected.push(...rssResult.value.items);
    warnings.push(...rssResult.value.warnings);
  } else {
    warnings.push(rssResult.reason?.message || "RSS feeds unavailable");
  }

  if (newsDataResult.status === "fulfilled") {
    sourceCounts.newsdata = newsDataResult.value.items.length;
    collected.push(...newsDataResult.value.items);
    if (newsDataResult.value.warning) warnings.push(newsDataResult.value.warning);
  } else {
    warnings.push(newsDataResult.reason?.message || "NewsData.io unavailable");
  }

  const relevant = filterRelevantItems(tabKey, collected);
  const merged = mergeAndRankItems(relevant);

  if (merged.length) {
    return {
      items: merged,
      warnings: [...new Set(warnings.filter(Boolean))],
      provider: resolveProvider(sourceCounts),
    };
  }

  return {
    items: getFallbackArticles(tabKey),
    warnings: [...new Set([...warnings, "Live feeds unavailable — showing curated articles"].filter(Boolean))],
    provider: "fallback",
  };
}
