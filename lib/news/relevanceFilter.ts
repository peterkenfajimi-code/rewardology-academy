import type { NewsItem } from "@/lib/news/feedConfig";

const JOB_BOARD_SPAM =
  /\b(now hiring|multiple .{0,50} jobs|jobs in [a-z][a-z\s,.-]{2,60})\b/i;
const OFF_TOPIC =
  /\b(wages war|land regulari|encroachment|himachal|cabinet approves land)\b/i;

const TAB_RELEVANCE: Record<string, RegExp> = {
  "total-rewards":
    /\b(total rewards|executive compensation|pay equity|remuneration|compensation and benefits|rewards strategy|compensation strategy)\b/i,
  compensation:
    /\b(compensation|salary|pay transparency|pay equity|executive compensation|merit increase|salary survey|wage growth|minimum wage)\b/i,
  benefits:
    /\b(employee benefits|workplace benefits|health plan|open enrollment|401k|health benefits|benefits plan|wellbeing|wellness)\b/i,
  "pay-transparency":
    /\b(pay transparency|salary transparency|pay equity|gender pay gap|salary range|wage disclosure|compensation disclosure)\b/i,
};

const TAB_KEYWORDS: Record<string, string[]> = {
  "total-rewards": ["total rewards", "compensation", "benefits", "pay", "reward", "remuneration"],
  compensation: ["salary", "pay", "wage", "compensation", "incentive", "bonus", "merit"],
  benefits: ["benefits", "insurance", "pension", "wellbeing", "leave", "401k", "health plan"],
  "pay-transparency": [
    "pay transparency",
    "salary transparency",
    "pay equity",
    "gender pay",
    "salary range",
    "wage disclosure",
  ],
};

function articleText(title: string, description: string): string {
  const plain = description.replace(/<[^>]+>/g, " ");
  return `${title} ${plain}`.toLowerCase();
}

export function isRelevantArticle(tabKey: string, title: string, description: string): boolean {
  const text = articleText(title, description);
  if (JOB_BOARD_SPAM.test(text) || OFF_TOPIC.test(text)) return false;

  const pattern = TAB_RELEVANCE[tabKey];
  if (pattern?.test(text)) return true;

  const keywords = TAB_KEYWORDS[tabKey];
  return keywords?.some((kw) => text.includes(kw)) ?? false;
}

export function filterRelevantItems(tabKey: string, items: NewsItem[]): NewsItem[] {
  return items.filter((item) => isRelevantArticle(tabKey, item.title, item.description));
}
