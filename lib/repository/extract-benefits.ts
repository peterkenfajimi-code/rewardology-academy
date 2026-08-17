import {
  buildExtractionInstructions,
  buildExtractionPrompt,
} from "@/lib/repository/extraction-prompt";
import { fetchSourceDocument } from "@/lib/repository/fetch-source-document";
import { extractTextFromPdf } from "@/lib/repository/pdf-text";
import type { CountryModule, ExtractedEntry } from "@/lib/repository/types";

export type ExtractSourceMode = "text" | "url-text" | "url-pdf-text";

export type ExtractBenefitsResult = {
  entries: ExtractedEntry[];
  sourceMode: ExtractSourceMode;
  pageCount?: number;
};

export function parseExtractedJson(text: string): ExtractedEntry[] {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("[")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("["), trimmed.lastIndexOf("]") + 1);

  const parsed = JSON.parse(jsonText) as ExtractedEntry[];
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
  return parsed;
}

export async function callAnthropicExtraction(model: string, prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const payload = (await res.json()) as {
    error?: { type?: string; message?: string };
    content?: { type: string; text?: string }[];
  };

  if (!res.ok) {
    const detail = payload.error?.message ?? payload.error?.type ?? "Anthropic API error";
    throw new Error(detail);
  }

  const textBlock = payload.content?.find((c) => c.type === "text");
  if (!textBlock?.text) throw new Error("Empty model response");
  return textBlock.text;
}

export function anthropicModelId(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";
}

export async function extractBenefitsFromSource(params: {
  companyName: string;
  countryModule?: CountryModule | null;
  rawText?: string;
  sourceUrl?: string;
}): Promise<ExtractBenefitsResult> {
  const rawText = params.rawText?.trim() ?? "";
  const sourceUrl = params.sourceUrl?.trim() ?? "";

  if (!rawText && !sourceUrl) {
    throw new Error("Provide rawText or sourceUrl for extraction");
  }

  const model = anthropicModelId();

  if (rawText) {
    const responseText = await callAnthropicExtraction(
      model,
      buildExtractionPrompt(params.companyName, params.countryModule ?? null, rawText)
    );
    return { entries: parseExtractedJson(responseText), sourceMode: "text" };
  }

  const fetched = await fetchSourceDocument(sourceUrl);

  if (fetched.kind === "pdf") {
    const extracted = await extractTextFromPdf(fetched.buffer);
    const responseText = await callAnthropicExtraction(
      model,
      `${buildExtractionInstructions(params.companyName, params.countryModule ?? null)}

The following text was extracted from a ${extracted.pageCount}-page PDF (benefits-related sections only):

${extracted.text}`
    );
    return {
      entries: parseExtractedJson(responseText),
      sourceMode: "url-pdf-text",
      pageCount: extracted.pageCount,
    };
  }

  const responseText = await callAnthropicExtraction(
    model,
    buildExtractionPrompt(params.companyName, params.countryModule ?? null, fetched.text)
  );
  return { entries: parseExtractedJson(responseText), sourceMode: "url-text" };
}
