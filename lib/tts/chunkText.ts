const DEFAULT_MAX_CHARS = 3800;
const DEFAULT_BROWSER_MAX_WORDS = 160;

/**
 * Split long text into TTS-safe chunks at sentence boundaries.
 */
export function chunkTextForTts(
  text: string,
  maxChars: number = DEFAULT_MAX_CHARS
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const sentences = normalized.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const piece = current ? `${current} ${sentence}` : sentence;

    if (piece.length <= maxChars) {
      current = piece;
      continue;
    }

    if (current) chunks.push(current.trim());

    if (sentence.length > maxChars) {
      // Hard-split oversized sentence
      for (let i = 0; i < sentence.length; i += maxChars) {
        chunks.push(sentence.slice(i, i + maxChars).trim());
      }
      current = "";
    } else {
      current = sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

/**
 * Smaller word-based chunks for browser speech — one sentence group at a time
 * sounds much more natural than a single long utterance.
 */
export function chunkTextForBrowser(
  text: string,
  maxWords: number = DEFAULT_BROWSER_MAX_WORDS
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?…]+[.!?…]+/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";
  let wordCount = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    const sentenceWords = trimmed.split(/\s+/).length;

    if (wordCount + sentenceWords > maxWords && current) {
      chunks.push(current.trim());
      current = trimmed;
      wordCount = sentenceWords;
      continue;
    }

    current = current ? `${current} ${trimmed}` : trimmed;
    wordCount += sentenceWords;
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 10);
}
