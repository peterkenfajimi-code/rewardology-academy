import type { NewsItem, NewsSource } from "@/lib/news/feedConfig";
import { FEEDS } from "@/lib/news/feedConfig";
import { parseRssXml } from "@/lib/news/parseRss";

const MAX_ITEMS_PER_SOURCE = 4;

async function fetchOneSource(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetch(source.url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml", "User-Agent": "RewardologyAcademy/1.0" },
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 1800 },
  });

  if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);

  const xml = await res.text();
  const items = parseRssXml(xml);

  if (!items.length) throw new Error(`${source.name}: no articles in feed`);

  return items.slice(0, MAX_ITEMS_PER_SOURCE).map((item) => ({
    title: item.title,
    description: item.description,
    link: item.link,
    pubDate: item.pubDate,
    source: source.name,
    tag: source.tag,
  }));
}

export async function fetchTabFromRss(tabKey: string): Promise<{ items: NewsItem[]; warnings: string[] }> {
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

  return { items: collected, warnings };
}
