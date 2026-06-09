import type { NewsItem } from "@/lib/news/feedConfig";

/** Curated evergreen links shown when live feeds are unavailable. */
export const FALLBACK_ARTICLES: Record<string, NewsItem[]> = {
  "total-rewards": [
    {
      title: "What Is Total Rewards? A Practical Guide for HR Professionals",
      description: "The five pillars of modern Total Rewards — compensation, benefits, wellbeing, development, and experience.",
      link: "/articles/what-is-total-rewards",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Total Rewards",
    },
    {
      title: "Compensation and Benefits Explained",
      description: "How direct pay and indirect benefits work together as the foundation of Total Rewards.",
      link: "/articles/compensation-and-benefits-explained",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Total Rewards",
    },
    {
      title: "How to Build a Total Rewards Strategy",
      description: "Align rewards with business goals, workforce needs, and market competitiveness.",
      link: "/articles/total-rewards-trends-hr-professionals-should-watch",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Total Rewards",
    },
  ],
  compensation: [
    {
      title: "How to Build a Salary Structure from Scratch",
      description: "Grades, ranges, midpoints, and governance for fair, defensible pay design.",
      link: "/articles/how-to-build-a-salary-structure-from-scratch",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Compensation",
    },
    {
      title: "Salary Surveys: How to Use Market Data",
      description: "Benchmark roles with external data and apply findings to your pay structure.",
      link: "/articles/market-pricing",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Compensation",
    },
    {
      title: "Incentive Pay: When It Works and When It Fails",
      description: "Design short- and long-term incentives that drive the right behaviours.",
      link: "/articles/variable-pay-and-incentives",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Compensation",
    },
  ],
  benefits: [
    {
      title: "Employee Benefits Strategy: A Practical Framework",
      description: "Design benefits packages that support attraction, retention, and wellbeing.",
      link: "/articles/benefits-strategy",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Benefits",
    },
    {
      title: "Open Enrollment: Communication That Actually Works",
      description: "Help employees make confident benefits decisions with clear, timely messaging.",
      link: "/articles/benefits-enrollment",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Benefits",
    },
    {
      title: "Financial Wellbeing Benefits: What HR Should Know",
      description: "Retirement, emergency savings, and financial literacy as part of the rewards mix.",
      link: "/articles/financial-wellbeing-as-part-of-total-rewards",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Benefits",
    },
  ],
  "pay-transparency": [
    {
      title: "Pay Transparency Laws: What HR Needs to Know in 2026",
      description: "Prepare your organisation for disclosure requirements before you open the books.",
      link: "/articles/pay-transparency",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Pay Transparency",
    },
    {
      title: "Pay Equity Audits: A Step-by-Step Guide",
      description: "Identify gaps, run your first analysis, and build governance that prevents inequity.",
      link: "/articles/pay-equity-basics",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Pay Equity",
    },
    {
      title: "The Future of Compensation: Trends Shaping 2026 and Beyond",
      description: "Transparency, skills-based pay, and analytics reshaping how organisations reward talent.",
      link: "/articles/total-rewards-trends-hr-professionals-should-watch",
      pubDate: "",
      source: "Rewardology Academy",
      tag: "Pay Transparency",
    },
  ],
};

export function getFallbackArticles(tabKey: string): NewsItem[] {
  return FALLBACK_ARTICLES[tabKey] ?? [];
}
