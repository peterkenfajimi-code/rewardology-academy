export type NewsSource = { name: string; url: string; tag: string };

export type LiveSource = { name: string; href: string; tag: string };

export type FeedConfig = {
  color: string;
  label: string;
  /** Google News RSS search query (supports when:7d etc.) */
  googleNewsQuery: string;
  /** NewsData.io title search (qInTitle) */
  newsDataTitleQuery: string;
  /** Direct RSS feeds */
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
    googleNewsQuery: "total rewards HR compensation when:7d",
    newsDataTitleQuery: '"total rewards" OR "executive compensation" OR "pay equity" OR remuneration',
    sources: [
      { name: "WorldatWork", url: "https://www.worldatwork.org/rss.xml", tag: "Total Rewards" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Total Rewards" },
      { name: "HR Exchange Network", url: "https://www.hrexchangenetwork.com/rss", tag: "C&B" },
    ],
    liveSources: [
      { name: "WorldatWork", href: "https://www.worldatwork.org", tag: "Total Rewards" },
      { name: "HR Executive", href: "https://hrexecutive.com", tag: "Total Rewards" },
      { name: "HR Exchange Network", href: "https://www.hrexchangenetwork.com", tag: "C&B" },
    ],
  },
  compensation: {
    color: "#2E7D8C",
    label: "Compensation",
    googleNewsQuery: "salary compensation pay equity wages when:7d",
    newsDataTitleQuery: '"salary survey" OR "pay transparency" OR "executive compensation" OR "pay equity"',
    sources: [
      { name: "Compensation Café", url: "https://compensationcafe.com/feed/", tag: "Compensation" },
      { name: "PayScale", url: "https://www.payscale.com/compensation-today/feed/", tag: "Pay" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Compensation" },
    ],
    liveSources: [
      { name: "Compensation Café", href: "https://compensationcafe.com", tag: "Compensation" },
      { name: "PayScale", href: "https://www.payscale.com/compensation-today", tag: "Pay" },
      { name: "HR Executive", href: "https://hrexecutive.com", tag: "Compensation" },
    ],
  },
  benefits: {
    color: "#3A7D44",
    label: "Benefits",
    googleNewsQuery: "employee benefits wellbeing health insurance when:7d",
    newsDataTitleQuery:
      '"employee benefits" OR "workplace benefits" OR "health plan" OR "open enrollment" OR 401k',
    sources: [
      { name: "BenefitsPRO", url: "https://www.benefitspro.com/feed/", tag: "Benefits" },
      { name: "Benefit News", url: "https://www.benefitnews.com/feed", tag: "Benefits" },
      { name: "PeopleKeep", url: "https://www.peoplekeep.com/blog/rss.xml", tag: "Benefits" },
    ],
    liveSources: [
      { name: "BenefitsPRO", href: "https://www.benefitspro.com", tag: "Benefits" },
      { name: "Benefit News", href: "https://www.benefitnews.com", tag: "Benefits" },
      { name: "SHRM Benefits", href: "https://www.shrm.org/topics-tools/news/benefits", tag: "Benefits" },
    ],
  },
  "pay-transparency": {
    color: "#6B4C9A",
    label: "Pay Transparency",
    googleNewsQuery: '"pay equity" OR "salary transparency" OR "pay transparency" when:30d',
    newsDataTitleQuery:
      '"pay transparency" OR "salary transparency" OR "pay equity" OR "gender pay gap"',
    sources: [
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Pay Transparency" },
      { name: "Workforce", url: "https://www.workforce.com/feed/", tag: "Pay Transparency" },
      { name: "HR Exchange Network", url: "https://www.hrexchangenetwork.com/rss", tag: "Pay Equity" },
    ],
    liveSources: [
      { name: "HR Dive", href: "https://www.hrdive.com", tag: "Pay Transparency" },
      { name: "Workforce", href: "https://www.workforce.com", tag: "Pay Transparency" },
      { name: "HR Exchange Network", href: "https://www.hrexchangenetwork.com", tag: "Pay Equity" },
    ],
  },
};

export const NEWS_TAB_KEYS = ["total-rewards", "compensation", "benefits", "pay-transparency"] as const;

export function isValidNewsTab(tab: string | null): tab is keyof typeof FEEDS {
  return Boolean(tab && tab in FEEDS);
}
