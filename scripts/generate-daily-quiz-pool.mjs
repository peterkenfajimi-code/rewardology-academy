/**
 * Build lib/daily-quiz/dailyQuizPool.json with exactly 365 unique questions.
 * Sources: seed-pool.json (homepage originals) + expanded TR/comp bank only.
 * Does NOT pull from Quiz Centre (/quizzes).
 *
 * Run: npm run generate:daily-quiz
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildExpandedQuestions } from "./daily-quiz-expanded-bank.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const TARGET = 365;

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

function main() {
  const seedPath = path.join(root, "lib", "daily-quiz", "seed-pool.json");
  const outPath = path.join(root, "lib", "daily-quiz", "dailyQuizPool.json");

  let seedQuestions = [];
  if (fs.existsSync(seedPath)) {
    seedQuestions = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  } else {
    console.warn("Warning: seed-pool.json missing; pool will use expanded bank only.");
  }

  const expanded = buildExpandedQuestions();
  const pool = dedupeAndFill([seedQuestions, expanded]);

  if (pool.length < TARGET) {
    console.error(
      `Only ${pool.length} unique questions (seeds: ${seedQuestions.length}, expanded: ${expanded.length}). Need ${TARGET}. Add concepts to daily-quiz-expanded-bank.mjs.`
    );
    process.exit(1);
  }

  const finalPool = pool.slice(0, TARGET);
  fs.writeFileSync(outPath, `${JSON.stringify(finalPool, null, 2)}\n`, "utf8");
  console.log(`Wrote ${finalPool.length} questions to ${outPath}`);
  console.log(
    `Sources: ${seedQuestions.length} seeds + ${expanded.length} expanded (Quiz Centre excluded)`
  );
}

main();
