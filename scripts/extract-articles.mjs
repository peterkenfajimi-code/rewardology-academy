/**
 * One-time extractor: run with node scripts/extract-articles.mjs
 * Reads rewardology-articles.html and writes lib/articles/essentials.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath =
  process.argv[2] ||
  "C:/Users/pfajimi/Downloads/rewardology-articles.html";
const outPath = path.join(__dirname, "../lib/articles/essentials.ts");

const html = fs.readFileSync(htmlPath, "utf8");

const cardRe =
  /<div class="idx-card" onclick="goArt\((\d+)\)" style="--cc:([^"]+)"><div class="idx-n">(\d+)<\/div><div class="idx-cat" style="color:[^"]+">([^<]+)<\/div><div class="idx-ti">([^<]+)<\/div>/g;

const meta = [];
let m;
while ((m = cardRe.exec(html)) !== null) {
  meta.push({
    id: parseInt(m[1], 10),
    color: m[2],
    num: m[3],
    category: m[4],
    title: m[5],
  });
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const articles = [];

for (const item of meta) {
  const artRe = new RegExp(
    `<article class="art-page" id="art-${item.id}"[\\s\\S]*?</article>`,
    "i"
  );
  const block = html.match(artRe)?.[0];
  if (!block) continue;

  const subtitle = block.match(/<p class="art-sub">([^<]+)<\/p>/)?.[1] ?? "";

  const bodyMatch = block.match(/<div class="art-body">([\s\S]*?)<\/div><\/article>/);
  const bodyHtml = bodyMatch?.[1] ?? "";

  const paragraphs = [...bodyHtml.matchAll(/<p>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>[^<]*)*)<\/p>/g)]
    .map((x) => x[1].replace(/<[^>]+>/g, "").trim())
    .filter((p) => p.length > 20);

  const pqMatch = bodyHtml.match(
    /<blockquote class="pullquote">[\s\S]*?<span class="pq-open">[^<]*<\/span>([\s\S]*?)<span class="pq-close">/
  );
  const pullquote = pqMatch?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";

  const takeaways = [...bodyHtml.matchAll(/<li><span class="tk-arrow">[^<]*<\/span>([^<]+)<\/li>/g)].map(
    (x) => x[1].trim()
  );

  articles.push({
    id: item.id,
    slug: slugify(item.title),
    num: item.num,
    color: item.color,
    category: item.category,
    title: item.title,
    subtitle,
    paragraphs,
    pullquote,
    takeaways,
  });
}

const ts = `/** Auto-generated from rewardology-articles.html — do not edit by hand */

export type EssentialArticle = {
  id: number;
  slug: string;
  num: string;
  color: string;
  category: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  pullquote: string;
  takeaways: string[];
};

export const ESSENTIALS_ARTICLES: EssentialArticle[] = ${JSON.stringify(articles, null, 2)};

export function getEssentialBySlug(slug: string) {
  return ESSENTIALS_ARTICLES.find((a) => a.slug === slug);
}

export function getEssentialById(id: number) {
  return ESSENTIALS_ARTICLES.find((a) => a.id === id);
}

export const ESSENTIALS_TOPICS = ${JSON.stringify([...new Set(articles.map((a) => a.category))], null, 2)};
`;

fs.writeFileSync(outPath, ts);
console.log(`Wrote ${articles.length} articles to ${outPath}`);
