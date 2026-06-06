export type NewsSource = { name: string; url: string; tag: string };

export type FeedConfig = { color: string; label: string; sources: NewsSource[] };

export type NewsItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  tag: string;
};

export const FEEDS: Record<string, FeedConfig> = {
  "total-rewards": {
    color: "#C8963E",
    label: "Total Rewards",
    sources: [
      { name: "AIHR", url: "https://www.aihr.com/feed/", tag: "HR" },
      { name: "HR Morning", url: "https://www.hrmorning.com/feed/", tag: "HR News" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Total Rewards" },
    ],
  },
  compensation: {
    color: "#2E7D8C",
    label: "Compensation",
    sources: [
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Compensation" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Pay Strategy" },
      { name: "CNBC Business", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", tag: "Business" },
    ],
  },
  benefits: {
    color: "#3A7D44",
    label: "Benefits",
    sources: [
      { name: "HR Daily Advisor", url: "https://hrdailyadvisor.blr.com/feed/", tag: "Benefits" },
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Benefits" },
      { name: "Globe Newswire", url: "https://www.globenewswire.com/RssFeed/subjectcode/23-HREM", tag: "HR" },
    ],
  },
  "general-hr": {
    color: "#6B4C9A",
    label: "General HR News",
    sources: [
      { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", tag: "Business" },
      { name: "PR Newswire", url: "https://www.prnewswire.com/rss/news-releases-list.rss", tag: "HR" },
      { name: "Guardian Business", url: "https://www.theguardian.com/business/rss", tag: "Business" },
    ],
  },
};

export const NEWS_TAB_KEYS = ["total-rewards", "compensation", "benefits", "general-hr"] as const;

export function isValidNewsTab(tab: string | null): tab is keyof typeof FEEDS {
  return Boolean(tab && tab in FEEDS);
}
