import type { NewsItem } from "@/lib/news/feedConfig";

const MAX_ITEMS_PER_TAB = 8;

export function mergeAndRankItems(items: NewsItem[], max = MAX_ITEMS_PER_TAB): NewsItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = item.link || item.title;
      if (!item.title?.trim() || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aTime = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const bTime = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime;
    })
    .slice(0, max);
}
