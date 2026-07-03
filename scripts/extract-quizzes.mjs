/**
 * Extract QUIZZES from rewardology-quizzes-fixed.html → lib/quizzes/quizCentre.ts
 *
 * Usage:
 *   node scripts/extract-quizzes.mjs
 *   node scripts/extract-quizzes.mjs path/to/rewardology-quizzes-fixed.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_PATHS = [
  path.join(root, "data", "rewardology-quizzes-fixed.html"),
  path.join(process.env.USERPROFILE || "", "Downloads", "rewardology-quizzes-fixed.html"),
];

function resolveHtmlPath() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  for (const p of DEFAULT_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("rewardology-quizzes-fixed.html not found — pass path as argument");
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
  const outPath = path.join(root, "lib", "quizzes", "quizCentre.ts");
  const html = fs.readFileSync(htmlPath, "utf8");
  const quizzes = JSON.parse(extractJsLiteral(html, "QUIZZES"));

  const ts = `export type QuizCentreQuestion = {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

export type QuizCentreQuiz = {
  id: number;
  title: string;
  category: string;
  color: string;
  bg: string;
  icon: string;
  xp: number;
  desc: string;
  questions: QuizCentreQuestion[];
};

export const QUIZ_CENTRE: QuizCentreQuiz[] = ${JSON.stringify(quizzes, null, 2)};
`;

  fs.writeFileSync(outPath, ts);
  console.log(`Read ${htmlPath}`);
  console.log(`Wrote ${quizzes.length} quizzes to ${outPath}`);
  quizzes.forEach((q) =>
    console.log(`  · ${q.id}. ${q.title} (${q.questions.length} questions, ${q.xp} XP)`)
  );
}

main();
