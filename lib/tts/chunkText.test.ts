import { describe, expect, it } from "vitest";
import { chunkTextForTts, chunkTextForBrowser } from "./chunkText";

describe("chunkTextForTts", () => {
  it("returns empty for blank input", () => {
    expect(chunkTextForTts("   ")).toEqual([]);
  });

  it("returns single chunk for short text", () => {
    expect(chunkTextForTts("Hello world.")).toEqual(["Hello world."]);
  });

  it("splits long text into multiple chunks under max", () => {
    const sentence = "This is a test sentence. ";
    const long = sentence.repeat(200);
    const chunks = chunkTextForTts(long, 500);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c) => expect(c.length).toBeLessThanOrEqual(500));
  });

  it("chunks browser text by word count", () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}.`).join(" ");
    const chunks = chunkTextForBrowser(words, 80);
    expect(chunks.length).toBeGreaterThan(1);
  });
});
