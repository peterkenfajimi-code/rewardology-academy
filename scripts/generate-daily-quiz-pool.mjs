/**
 * Build lib/daily-quiz/dailyQuizPool.json from Rewardology Daily Quiz Bank docx files.
 * Sources: Vol 1–4 docx (365 questions) with seed-pool.json fallback for gaps.
 *
 * Place docx files in Downloads or set QUIZ_BANK_DIR.
 * Run: npm run generate:daily-quiz
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseAllQuizDocx } from "./parse-quiz-docx.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const TARGET = 365;

const DEFAULT_FILES = [
  { vol: 1, path: "Rewardology_Daily_Quiz_Bank.docx" },
  { vol: 2, path: "Rewardology_Daily_Quiz_Bank_Vol2.docx" },
  { vol: 3, path: "Rewardology_Daily_Quiz_Bank_Vol3.docx" },
  { vol: 4, path: "Rewardology_Daily_Quiz_Bank_Vol4.docx" },
];

function resolveDocxFiles() {
  const repoDir = path.join(root, "data", "daily-quiz-bank");
  const downloadDir =
    process.env.QUIZ_BANK_DIR ||
    path.join(process.env.USERPROFILE || process.env.HOME || "", "Downloads");

  return DEFAULT_FILES.map(({ vol, path: name }) => {
    const repoPath = path.join(repoDir, name);
    const downloadPath = path.join(downloadDir, name);
    return { vol, path: fs.existsSync(repoPath) ? repoPath : downloadPath };
  });
}

function normalizeQuestion(q) {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}

function dedupeAndFill(sources) {
  const seen = new Set();
  const pool = [];

  for (const src of sources) {
    for (const item of src) {
      const key = normalizeQuestion(item.question);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push(item);
      if (pool.length >= TARGET) return pool;
    }
  }
  return pool;
}

function stripExplanation(item) {
  const { explanation: _e, ...rest } = item;
  return rest;
}

function main() {
  const seedPath = path.join(root, "lib", "daily-quiz", "seed-pool.json");
  const outPath = path.join(root, "lib", "daily-quiz", "dailyQuizPool.json");

  const batches = parseAllQuizDocx(resolveDocxFiles());
  const docxQuestions = batches.flatMap((b) => b.questions);

  for (const b of batches) {
    console.log(`  ${b.file}: ${b.count} questions`);
  }
  console.log(`Docx total: ${docxQuestions.length}`);

  let seedQuestions = [];
  if (fs.existsSync(seedPath)) {
    seedQuestions = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  }

  const pool = dedupeAndFill([docxQuestions, seedQuestions]);

  if (pool.length < TARGET) {
    console.error(`Only ${pool.length} unique questions (need ${TARGET}). Check docx paths in Downloads.`);
    process.exit(1);
  }

  const finalPool = pool.slice(0, TARGET);
  fs.writeFileSync(outPath, `${JSON.stringify(finalPool, null, 2)}\n`, "utf8");
  console.log(`Wrote ${finalPool.length} questions to ${outPath}`);
  console.log(`With explanations: ${finalPool.filter((q) => q.explanation).length}`);
}

main();
