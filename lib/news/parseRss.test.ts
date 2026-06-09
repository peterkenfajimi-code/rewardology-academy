import { describe, expect, it } from "vitest";
import { parseRssXml } from "./parseRss";

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Pay transparency law update</title>
      <link>https://example.com/a</link>
      <description>States expand salary range rules.</description>
      <pubDate>Mon, 01 Jun 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe("parseRssXml", () => {
  it("parses RSS 2.0 items", () => {
    const items = parseRssXml(SAMPLE_RSS);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Pay transparency law update");
    expect(items[0].link).toBe("https://example.com/a");
  });

  it("returns an empty array for blank input", () => {
    expect(parseRssXml("")).toEqual([]);
  });
});
