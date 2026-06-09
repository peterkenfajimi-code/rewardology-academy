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

/** Parse RSS 2.0 or Atom XML into normalized feed items. */
export function parseRssXml(xml: string): ParsedRssItem[] {
  if (!xml.trim()) return [];

  const blocks = splitBlocks(xml, "item");
  const atomBlocks = blocks.length ? [] : splitBlocks(xml, "entry");
  const sourceBlocks = blocks.length ? blocks : atomBlocks;

  return sourceBlocks
    .map((block) => {
      const title = readTag(block, "title");
      const link = blocks.length ? readTag(block, "link") : readAtomLink(block);
      const description =
        readTag(block, "description") ||
        readTag(block, "summary") ||
        readTag(block, "content");
      const pubDate =
        readTag(block, "pubDate") ||
        readTag(block, "published") ||
        readTag(block, "updated");

      return { title, description, link, pubDate };
    })
    .filter((item) => item.title && item.link);
}
