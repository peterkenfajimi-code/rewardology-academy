import { describe, expect, it } from "vitest";
import { deriveTrendingTopics, formatTrendingCount } from "./trendingTopics";
import type { NewsItem } from "./feedConfig";

function item(partial: Partial<NewsItem> & Pick<NewsItem, "title">): NewsItem {
  return {
    description: "",
    link: partial.link ?? "https://example.com",
    pubDate: "",
    source: "Test",
    tag: "HR",
    ...partial,
  };
}

describe("deriveTrendingTopics", () => {
  it("ranks topics by keyword frequency in titles and descriptions", () => {
    const items = [
      item({ title: "New pay transparency law passes", tag: "Compensation" }),
      item({ title: "Pay transparency updates for 2026", tag: "Compensation" }),
      item({ title: "Open enrollment checklist", tag: "Benefits" }),
    ];

    const topics = deriveTrendingTopics(items, 5);

    expect(topics.find((t) => t.label === "Pay Transparency Laws")).toEqual({
      label: "Pay Transparency Laws",
      count: 2,
    });
    expect(topics.some((t) => t.label === "Open Enrollment")).toBe(true);
  });

  it("counts feed tags alongside matched keywords", () => {
    const items = [item({ title: "HR leadership trends", tag: "HR News" })];

    const topics = deriveTrendingTopics(items, 5);

    expect(topics.some((t) => t.label === "HR News" && t.count === 1)).toBe(true);
  });

  it("returns an empty list when there are no articles", () => {
    expect(deriveTrendingTopics([])).toEqual([]);
  });
});

describe("formatTrendingCount", () => {
  it("uses singular copy for one article", () => {
    expect(formatTrendingCount(1)).toBe("1 article in feeds");
  });

  it("uses plural copy for multiple articles", () => {
    expect(formatTrendingCount(3)).toBe("3 articles in feeds");
  });
});
