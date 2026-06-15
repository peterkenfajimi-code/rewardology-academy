/**
 * Extract TERMS from rewardology-dictionary.html → lib/dictionary/terms.ts
 *
 * Usage:
 *   node scripts/extract-dictionary.mjs
 *   node scripts/extract-dictionary.mjs path/to/rewardology-dictionary.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_PATHS = [
  path.join(root, "data", "rewardology-dictionary.html"),
  path.join(process.env.USERPROFILE || "", "Downloads", "rewardology-dictionary.html"),
];

function resolveHtmlPath() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  for (const p of DEFAULT_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("rewardology-dictionary.html not found — pass path as argument");
}

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

function main() {
  const htmlPath = resolveHtmlPath();
  const dataCopy = path.join(root, "data", "rewardology-dictionary.html");
  if (htmlPath !== dataCopy) {
    fs.mkdirSync(path.dirname(dataCopy), { recursive: true });
    fs.copyFileSync(htmlPath, dataCopy);
    console.log("Copied source HTML → data/rewardology-dictionary.html");
  }

  const outPath = path.join(root, "lib", "dictionary", "terms.ts");
  const html = fs.readFileSync(htmlPath, "utf8");
  const raw = JSON.parse(extractJsLiteral(html, "TERMS"));

  const ts = `export type DictionaryTerm = {
  term: string;
  abbr: string | null;
  cat: string;
  catKey: string;
  definition: string;
  note?: string | null;
  formula?: string | null;
  example?: string | null;
  see_also?: string[];
  article?: number | null;
  lesson?: string | null;
};

export const DICTIONARY_CATEGORIES = [
  "Total Rewards & EVP",
  "Compensation Design",
  "Market Pricing & Benchmarking",
  "Job Evaluation",
  "Variable Pay & Incentives",
  "Benefits & Wellbeing",
  "Pay Equity",
  "Pay Transparency & Communication",
  "HR Analytics",
  "Executive Compensation",
  "Global Rewards",
  "Career & Development",
] as const;

export const DICTIONARY_LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "W",
] as const;

export const DICTIONARY_XP_PER_TERM = 5;

export const DICTIONARY_TERMS: DictionaryTerm[] = ${JSON.stringify(raw, null, 2)};

export const DICTIONARY_TERM_COUNT = DICTIONARY_TERMS.length;
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ts, "utf8");
  console.log(`Wrote ${raw.length} terms → ${path.relative(root, outPath)}`);
}

main();
