/**
 * Parse Rewardology Daily Quiz Bank docx files (Vol 1–4) into question objects.
 * Usage: node scripts/parse-quiz-docx.mjs [--json]
 */
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "url";

const FILES = [
  { vol: 1, path: "C:/Users/pfajimi/Downloads/Rewardology_Daily_Quiz_Bank.docx" },
  { vol: 2, path: "C:/Users/pfajimi/Downloads/Rewardology_Daily_Quiz_Bank_Vol2.docx" },
  { vol: 3, path: "C:/Users/pfajimi/Downloads/Rewardology_Daily_Quiz_Bank_Vol3.docx" },
  { vol: 4, path: "C:/Users/pfajimi/Downloads/Rewardology_Daily_Quiz_Bank_Vol4.docx" },
];

function decodeXml(text) {
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractParagraphs(docxPath) {
  const tmp = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    ".tmp-docx-" + path.basename(docxPath, ".docx").replace(/[^a-z0-9_-]/gi, "_")
  );
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });

  const zipCopy = path.join(tmp, "bank.zip");
  fs.copyFileSync(docxPath, zipCopy);
  execSync(`tar -xf "${zipCopy}" -C "${tmp}" word/document.xml`, { stdio: "pipe" });

  const xmlPath = path.join(tmp, "word", "document.xml");
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`No document.xml in ${docxPath}`);
  }
  const xml = fs.readFileSync(xmlPath, "utf8");
  fs.rmSync(tmp, { recursive: true, force: true });

  const paras = [];
  const pRe = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  for (const block of xml.match(pRe) ?? []) {
    const texts = [...block.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
    if (texts.length) paras.push(decodeXml(texts.join("")));
  }
  return paras;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function isTopicHeader(line) {
  const t = line.trim();
  if (!t || t.startsWith("Questions ") || /^Q\d/i.test(t)) return false;
  if (/^\d+$/.test(t)) return false;
  if (/^[A-D][.)]\s/.test(t)) return false;
  if (t === "ANS" || /^Answer:/i.test(t)) return false;
  if (/Topic Index|How to Use|Volume \d Notes|REWARDOLOGY|Daily Quiz|Answer key|Answer distribution|For use in/i.test(t)) {
    return false;
  }
  // Section titles are short topic names, often with leading/trailing spaces in source
  return t.length >= 8 && t.length <= 80 && !t.includes("Qs") && !/Q\d+\s*[–-]\s*Q\d+/.test(t);
}

function parseAnswerLine(line) {
  const m = line.match(/^Answer:\s*([A-D])\b/i);
  if (!m) return null;
  const correctKey = m[1].toUpperCase();
  const explanation = line.replace(/^Answer:\s*[A-D]\s*/i, "").replace(/^\|\s*/, "").trim() || undefined;
  return { correctKey, explanation };
}

export function parseQuizBankParagraphs(paras, vol = 1) {
  const questions = [];
  let topic = "Total Rewards";
  let i = 0;

  while (i < paras.length) {
    const line = paras[i].trim();

    if (isTopicHeader(line)) {
      topic = line.replace(/\s+/g, " ").trim();
      i++;
      continue;
    }

    if (/^\d+$/.test(line)) {
      const qNum = line;
      i++;
      if (i >= paras.length) break;

      let questionText = paras[i].trim();
      i++;
      while (i < paras.length && !paras[i].trim()) i++;

      const options = [];
      while (i < paras.length) {
        const row = paras[i].trim();
        if (!row) {
          i++;
          continue;
        }
        if (/^\d+$/.test(row) || isTopicHeader(row)) break;

        const opt = row.match(/^([A-D])[.)]\s*(.+)/i);
        if (opt) {
          options.push({ key: opt[1].toUpperCase(), label: opt[2].trim() });
          i++;
          continue;
        }

        if (row === "ANS") {
          i++;
          break;
        }

        if (/^Answer:/i.test(row)) {
          break;
        }

        if (options.length === 0 && questionText.length < 400) {
          questionText = `${questionText} ${row}`.trim();
          i++;
          continue;
        }
        break;
      }

      let correctKey = null;
      let explanation = undefined;
      if (i < paras.length && /^Answer:/i.test(paras[i].trim())) {
        const parsed = parseAnswerLine(paras[i].trim());
        if (parsed) {
          correctKey = parsed.correctKey;
          explanation = parsed.explanation;
        }
        i++;
      }

      if (questionText && options.length === 4 && correctKey) {
        const title = `${topic} Quiz`;
        questions.push({
          id: `v${vol}-q${qNum}-${slugify(topic)}`,
          label: topic,
          title,
          question: questionText,
          options,
          correctKey,
          ...(explanation ? { explanation } : {}),
        });
      }
      continue;
    }

    i++;
  }

  return questions;
}

export function parseAllQuizDocx(files = FILES) {
  const all = [];
  for (const { vol, path: docxPath } of files) {
    if (!fs.existsSync(docxPath)) {
      throw new Error(`Missing quiz bank file: ${docxPath}`);
    }
    const paras = extractParagraphs(docxPath);
    const parsed = parseQuizBankParagraphs(paras, vol);
    all.push({ vol, file: path.basename(docxPath), count: parsed.length, questions: parsed });
  }
  return all;
}

function main() {
  const batches = parseAllQuizDocx();
  const all = batches.flatMap((b) => b.questions);

  for (const b of batches) {
    console.log(`${b.file}: ${b.count} questions`);
  }
  console.log(`Total: ${all.length}`);

  if (process.argv.includes("--json")) {
    const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "parsed-quiz-bank.json");
    fs.writeFileSync(out, JSON.stringify(all, null, 2));
    console.log("Wrote", out);
  }

  return all;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  main();
}
