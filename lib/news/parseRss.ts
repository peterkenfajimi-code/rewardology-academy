export type ParsedRssItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
};

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .trim();
}

function readTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function readAtomLink(block: string): string {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefMatch) return hrefMatch[1];
  return readTag(block, "link");
}

function splitBlocks(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi"))].map((m) => m[0]);
}

function isGoogleNewsUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "news.google.com";
  } catch {
    return false;
  }
}

function readSourceUrl(block: string): string {
  const match = block.match(/<source[^>]+url=["']([^"']+)["'][^>]*>/i);
  return match ? decodeXml(match[1]) : "";
}

/** Strip HTML tags and collapse whitespace for plain-text descriptions. */
export function stripHtml(text: string): string {
  return decodeXml(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve Google News redirect URLs to the publisher article URL when possible. */
export function resolveGoogleNewsLink(block: string, link: string): string {
  if (!link || !isGoogleNewsUrl(link)) return link;

  const sourceUrl = readSourceUrl(block);
  if (sourceUrl && !isGoogleNewsUrl(sourceUrl)) return sourceUrl;

  const guid = readTag(block, "guid");
  if (guid && !isGoogleNewsUrl(guid)) return guid;

  const decoded = decodeGoogleNewsArticleUrl(link);
  if (decoded) return decoded;

  return link;
}

function decodeGoogleNewsArticleUrl(url: string): string | null {
  const match = url.match(/\/articles\/([^?]+)/);
  if (!match) return null;

  const encoded = match[1];
  const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);

  try {
    const decoded = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("latin1");
    const found = decoded.match(/https?:\/\/[^\s\x00-\x1f"'<>\\]+/);
    if (!found) return null;
    return found[0].replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%]+$/, "");
  } catch {
    return null;
  }
}

/** Parse RSS 2.0 or Atom XML into normalized feed items. */
export function parseRssXml(xml: string): ParsedRssItem[] {
  if (!xml.trim()) return [];

  const blocks = splitBlocks(xml, "item");
  const atomBlocks = blocks.length ? [] : splitBlocks(xml, "entry");
  const sourceBlocks = blocks.length ? blocks : atomBlocks;

  return sourceBlocks
    .map((block) => {
      const title = stripHtml(readTag(block, "title"));
      const rawLink = blocks.length ? readTag(block, "link") : readAtomLink(block);
      const link = resolveGoogleNewsLink(block, rawLink);
      const description = stripHtml(
        readTag(block, "description") ||
          readTag(block, "summary") ||
          readTag(block, "content")
      );
      const pubDate =
        readTag(block, "pubDate") ||
        readTag(block, "published") ||
        readTag(block, "updated");

      return { title, description, link, pubDate };
    })
    .filter((item) => item.title && item.link);
}
