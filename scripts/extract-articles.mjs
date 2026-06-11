/**
 * Extract articles from rewardology-articles-full.html → lib/articles/essentials.ts
 *
 * Usage:
 *   node scripts/extract-articles.mjs
 *   node scripts/extract-articles.mjs path/to/rewardology-articles-full.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_PATHS = [
  path.join(root, "data", "rewardology-articles-full.html"),
  path.join(process.env.USERPROFILE || "", "Downloads", "rewardology-articles-full.html"),
];

function resolveHtmlPath() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  for (const p of DEFAULT_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("rewardology-articles-full.html not found — pass path as argument");
}

/** Extract a JS array/object literal assigned to `const NAME =`. */
function extractJsLiteral(html, name) {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${marker} in HTML`);

  let i = start + marker.length;
  while (html[i] === " ") i++;

  const open = html[i];
  const close = open === "[" ? "]" : open === "{" ? "}" : null;
  if (!close) throw new Error(`Expected [ or { after ${name}`);

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return html.slice(i, j + 1);
    }
  }
  throw new Error(`Unclosed literal for ${name}`);
}

function normalizeArticle(raw, description) {
  return {
    id: raw.id,
    slug: raw.slug,
    num: String(raw.id).padStart(2, "0"),
    color: raw.color,
    category: raw.cat,
    catKey: raw.catKey,
    title: raw.title,
    subtitle: raw.subtitle,
    description: description ?? "",
    readTime: raw.time,
    xp: raw.xp,
    intro: raw.intro,
    toc: raw.toc ?? [],
    sections: raw.sections ?? [],
    scenario: raw.scenario,
    mistakes: raw.mistakes ?? [],
    practical: raw.practical,
    pullquote: raw.pullquote ?? "",
    closingNote: raw.closingNote ?? "",
    takeaways: raw.takeaways ?? [],
    related: raw.related ?? [],
    course: raw.course ?? "",
    quiz: raw.quiz ?? "",
  };
}

function parseJsLiteral(literal) {
  try {
    return JSON.parse(literal);
  } catch {
    // DESCRIPTIONS uses numeric keys (1: "...") — valid JS, not JSON
    return new Function(`return ${literal}`)();
  }
}

function main() {
  const htmlPath = resolveHtmlPath();
  const outPath = path.join(root, "lib", "articles", "essentials.ts");
  const html = fs.readFileSync(htmlPath, "utf8");

  const rawArticles = parseJsLiteral(extractJsLiteral(html, "ARTICLES"));
  const descriptions = parseJsLiteral(extractJsLiteral(html, "DESCRIPTIONS"));

  const articles = rawArticles.map((a) => normalizeArticle(a, descriptions[String(a.id)]));

  const topics = [...new Set(articles.map((a) => a.category))];

  const ts = `/** Auto-generated from rewardology-articles-full.html — do not edit by hand */

export type ArticleCallout = { label: string; body: string };

export type ArticleSection = {
  h2: string;
  body: string;
  callout?: ArticleCallout;
};

export type EssentialArticle = {
  id: number;
  slug: string;
  num: string;
  color: string;
  category: string;
  catKey: string;
  title: string;
  subtitle: string;
  description: string;
  readTime: string;
  xp: number;
  intro: string;
  toc: string[];
  sections: ArticleSection[];
  scenario: { title: string; body: string };
  mistakes: { t: string; d: string }[];
  practical: { title: string; steps: string[] };
  pullquote: string;
  closingNote: string;
  takeaways: string[];
  related: number[];
  course: string;
  quiz: string;
};

export const ESSENTIALS_ARTICLES: EssentialArticle[] = ${JSON.stringify(articles, null, 2)};

export function getEssentialBySlug(slug: string) {
  return ESSENTIALS_ARTICLES.find((a) => a.slug === slug);
}

export function getEssentialById(id: number) {
  return ESSENTIALS_ARTICLES.find((a) => a.id === id);
}

export const ESSENTIALS_TOPICS = ${JSON.stringify(topics, null, 2)};
`;

  fs.writeFileSync(outPath, ts);
  console.log(`Read ${htmlPath}`);
  console.log(`Wrote ${articles.length} articles to ${outPath}`);
}

main();
