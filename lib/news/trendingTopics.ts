import type { NewsItem } from "@/lib/news/feedConfig";

export type TrendingTopic = {
  label: string;
  count: number;
};

/** Domain phrases — longer patterns first where topics overlap. */
const TOPIC_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "Pay Transparency Laws", pattern: /\bpay transparency\b/i },
  { label: "Executive Compensation", pattern: /\bexecutive compensation\b/i },
  { label: "Skills-Based Pay", pattern: /\bskills[- ]based pay\b/i },
  { label: "Pay Equity Audits", pattern: /\bpay equity\b/i },
  { label: "Total Rewards Strategy", pattern: /\btotal rewards\b/i },
  { label: "Salary Surveys", pattern: /\bsalary survey\b/i },
  { label: "Merit Increases", pattern: /\bmerit (increase|raise|pay)\b/i },
  { label: "Minimum Wage", pattern: /\bminimum wage\b/i },
  { label: "Open Enrollment", pattern: /\bopen enrollment\b/i },
  { label: "Mental Health Benefits", pattern: /\bmental health benefits?\b/i },
  { label: "Health Plan Design", pattern: /\bhealth (plan|benefits?)\b/i },
  { label: "401(k) & Retirement", pattern: /\b401\s*\(?k\)?\b|\bretirement plan\b/i },
  { label: "Employee Benefits", pattern: /\bemployee benefits?\b/i },
  { label: "Talent Management", pattern: /\btalent management\b/i },
  { label: "Workforce Planning", pattern: /\bworkforce planning\b/i },
  { label: "Employee Engagement", pattern: /\bemployee engagement\b/i },
  { label: "People Analytics", pattern: /\bpeople analytics\b/i },
  { label: "AI in HR", pattern: /\b(ai|artificial intelligence).{0,40}\b(hr|human resources|compensation|pay)\b|\b(hr|human resources|compensation).{0,40}\b(ai|artificial intelligence)\b/i },
  { label: "Workplace Culture", pattern: /\bworkplace culture\b/i },
  { label: "Remote & Hybrid Work", pattern: /\b(remote|hybrid) work\b/i },
];

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function articleText(item: NewsItem): string {
  return `${item.title} ${plainText(item.description)}`;
}

export function deriveTrendingTopics(items: NewsItem[], limit = 5): TrendingTopic[] {
  if (!items.length) return [];

  const counts = new Map<string, number>();

  for (const item of items) {
    const text = articleText(item);
    const matched = new Set<string>();

    for (const { label, pattern } of TOPIC_PATTERNS) {
      if (pattern.test(text)) {
        matched.add(label);
      }
    }

    for (const label of matched) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const tag = item.tag?.trim();
    if (tag) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function formatTrendingCount(count: number): string {
  return count === 1 ? "1 article in feeds" : `${count} articles in feeds`;
}
