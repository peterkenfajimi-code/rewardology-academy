export type NewsSource = { name: string; url: string; tag: string };

export type LiveSource = { name: string; href: string; tag: string };

export type FeedConfig = {
  color: string;
  label: string;
  /** NewsData.io title search (qInTitle) */
  newsDataTitleQuery: string;
  /** RSS fallback feeds (rss2json) */
  sources: NewsSource[];
  /** Sidebar links for the active tab */
  liveSources: LiveSource[];
};

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
    newsDataTitleQuery: '"total rewards" OR "compensation strategy" OR "pay equity" OR payroll',
    sources: [{ name: "WorldatWork", url: "https://www.worldatwork.org/rss.xml", tag: "Total Rewards" }],
    liveSources: [{ name: "WorldatWork", href: "https://www.worldatwork.org", tag: "Total Rewards" }],
  },
  compensation: {
    color: "#2E7D8C",
    label: "Compensation",
    newsDataTitleQuery: '"employee compensation" OR "salary survey" OR "pay transparency" OR wages',
    sources: [
      { name: "Compensation Café", url: "https://compensationcafe.com/feed/", tag: "Compensation" },
      { name: "PayScale", url: "https://www.payscale.com/compensation-today/feed/", tag: "Pay" },
    ],
    liveSources: [
      { name: "Compensation Café", href: "https://compensationcafe.com", tag: "Compensation" },
      { name: "PayScale", href: "https://www.payscale.com/compensation-today", tag: "Pay" },
    ],
  },
  benefits: {
    color: "#3A7D44",
    label: "Benefits",
    newsDataTitleQuery:
      '"employee benefits" OR "workplace benefits" OR "health plan" OR "open enrollment" OR 401k',
    sources: [
      { name: "BenefitsPRO", url: "https://www.benefitspro.com/feed/", tag: "Benefits" },
      { name: "Benefit News", url: "https://www.benefitnews.com/feed", tag: "Benefits" },
    ],
    liveSources: [
      { name: "BenefitsPRO", href: "https://www.benefitspro.com", tag: "Benefits" },
      { name: "Benefit News", href: "https://www.benefitnews.com", tag: "Benefits" },
    ],
  },
  "general-hr": {
    color: "#6B4C9A",
    label: "General HR News",
    newsDataTitleQuery: '"human resources" OR "talent management" OR "workforce planning" OR hiring',
    sources: [
      { name: "HR Daily Advisor", url: "https://hrdailyadvisor.blr.com/feed/", tag: "HR" },
      { name: "AIHR Blog", url: "https://aihr.com/blog/feed/", tag: "HR" },
      { name: "HR Morning", url: "https://www.hrmorning.com/feed/", tag: "HR News" },
    ],
    liveSources: [
      { name: "HR Daily Advisor", href: "https://hrdailyadvisor.blr.com", tag: "HR" },
      { name: "AIHR Blog", href: "https://www.aihr.com/blog", tag: "HR" },
      { name: "HR Morning", href: "https://www.hrmorning.com", tag: "HR News" },
    ],
  },
};

export const NEWS_TAB_KEYS = ["total-rewards", "compensation", "benefits", "general-hr"] as const;

export function isValidNewsTab(tab: string | null): tab is keyof typeof FEEDS {
  return Boolean(tab && tab in FEEDS);
}
