import { PDFParse } from "pdf-parse";

const BENEFITS_KEYWORDS = [
  "pension",
  "pencom",
  "gratuity",
  "remuneration",
  "compensation",
  "employee benefit",
  "staff benefit",
  "welfare",
  "medical",
  "health insurance",
  "hmo",
  "group life",
  "nsitf",
  "leave",
  "annual leave",
  "maternity",
  "retirement",
  "contributory",
  "scheme",
  "human capital",
  "personnel",
];

const PROMPT_CHAR_LIMIT = 12_000;

function scoreParagraph(paragraph: string): number {
  const lower = paragraph.toLowerCase();
  let score = 0;
  for (const kw of BENEFITS_KEYWORDS) {
    if (lower.includes(kw)) score += 1;
  }
  return score;
}

/** Prefer paragraphs that mention benefits; fall back to a bounded slice of the full text. */
export function selectBenefitsExcerpt(fullText: string): string {
  const normalized = fullText.replace(/\r/g, "\n").replace(/\t/g, " ");
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 40);

  const scored = paragraphs
    .map((text, index) => ({ text, index, score: scoreParagraph(text) }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if (scored.length === 0) {
    const mid = Math.floor(normalized.length / 3);
    return normalized.slice(mid, mid + PROMPT_CHAR_LIMIT).trim();
  }

  const chosen = new Set<number>();
  const parts: string[] = [];
  let total = 0;

  for (const hit of scored) {
    for (const offset of [-1, 0, 1]) {
      const idx = hit.index + offset;
      if (idx < 0 || idx >= paragraphs.length || chosen.has(idx)) continue;
      const chunk = paragraphs[idx];
      if (total + chunk.length + 2 > PROMPT_CHAR_LIMIT) continue;
      chosen.add(idx);
      parts.push(chunk);
      total += chunk.length + 2;
    }
    if (total >= PROMPT_CHAR_LIMIT * 0.85) break;
  }

  parts.sort((a, b) => paragraphs.indexOf(a) - paragraphs.indexOf(b));
  const excerpt = parts.join("\n\n").trim();
  return excerpt.slice(0, PROMPT_CHAR_LIMIT);
}

export async function extractTextFromPdf(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const textResult = await parser.getText();
    const pageCount = textResult.total ?? textResult.pages.length;
    const excerpt = selectBenefitsExcerpt(textResult.text ?? "");

    if (excerpt.length < 80) {
      throw new Error(
        "Could not find readable benefits text in that PDF — copy the pension/benefits section and paste it below."
      );
    }

    return { text: excerpt, pageCount };
  } finally {
    await parser.destroy();
  }
}
