import { describe, expect, it } from "vitest";
import { parseRssXml, resolveGoogleNewsLink, stripHtml } from "./parseRss";

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

  it("uses the source url instead of a Google News redirect link", () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Pay equity trends - HR Exchange</title>
      <link>https://news.google.com/rss/articles/CBMiabc123?oc=5</link>
      <description>Plain summary text.</description>
      <source url="https://www.hrexchangenetwork.com/pay/article">HR Exchange Network</source>
      <pubDate>Mon, 01 Jun 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    const items = parseRssXml(xml);
    expect(items[0].link).toBe("https://www.hrexchangenetwork.com/pay/article");
  });

  it("strips HTML from descriptions", () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Benefits update</title>
      <link>https://example.com/benefits</link>
      <description><a href="https://example.com/benefits">Read more</a> about open enrollment.</description>
      <pubDate>Mon, 01 Jun 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    const items = parseRssXml(xml);
    expect(items[0].description).toBe("Read more about open enrollment.");
  });
});

describe("stripHtml", () => {
  it("removes tags and decodes entities", () => {
    expect(stripHtml("&lt;p&gt;Hello &amp; goodbye&lt;/p&gt;")).toBe("Hello & goodbye");
  });
});

describe("resolveGoogleNewsLink", () => {
  it("prefers the publisher source url over the Google redirect", () => {
    const block = `<source url="https://www.worldatwork.org/article">WorldatWork</source>`;
    const link = "https://news.google.com/rss/articles/CBMiabc123";

    expect(resolveGoogleNewsLink(block, link)).toBe("https://www.worldatwork.org/article");
  });
});
