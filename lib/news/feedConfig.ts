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
      { name: "SHRM", url: "https://www.shrm.org/rss/pages/compensation.aspx", tag: "Compensation" },
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "HR News" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Total Rewards" },
    ],
  },
  compensation: {
    color: "#2E7D8C",
    label: "Compensation",
    sources: [
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Compensation" },
      { name: "Workforce", url: "https://www.workforce.com/feed", tag: "Pay" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Pay Strategy" },
    ],
  },
  benefits: {
    color: "#3A7D44",
    label: "Benefits",
    sources: [
      { name: "BenefitsPRO", url: "https://www.benefitspro.com/feed/", tag: "Benefits" },
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Benefits" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Wellbeing" },
    ],
  },
};

export const NEWS_TAB_KEYS = ["total-rewards", "compensation", "benefits"] as const;

export function isValidNewsTab(tab: string | null): tab is keyof typeof FEEDS {
  return Boolean(tab && tab in FEEDS);
}
